const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Permission = require('../models/Permission');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

function normalizeDepartment(department) {
  return department?.trim() || 'Unassigned';
}

function handleMongoError(err, res, next) {
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A permission row already exists for this department' });
  }

  return next(err);
}

router.get('/:teamId', async (req, res, next) => {
  try {
    const perms = await Permission.find({
      teamId: req.params.teamId,
      department: { $exists: true, $ne: null }
    }).sort({ department: 1 });
    res.json(perms);
  } catch (err) { next(err); }
});

router.post('/',
  body('teamId').notEmpty(), body('teamName').notEmpty(),
  body('department').notEmpty(),
  body('members').isArray(),
  body('members.*.id').notEmpty(),
  body('members.*.displayName').notEmpty(),
  body('enabled').isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const { teamId, teamName, members, enabled } = req.body;
      const department = normalizeDepartment(req.body.department);
      const filter = { teamId, department };
      const now = Date.now();
      console.log(`filter: ${JSON.stringify(filter)}`)
      const existing = await Permission.findOneAndUpdate(
        filter,
        { teamId, teamName, department, members, enabled, updatedAt: now },
        { new: true, runValidators: true }
      );
      if (existing) return res.json(existing);

      try {
        const created = await Permission.create({ teamId, teamName, department, members, enabled });
        return res.json(created);
      } catch (err) {
        if (err.code === 11000) {
          const raced = await Permission.findOne(filter);
          if (raced) return res.json(raced);
          console.error('Duplicate key without matching row', { teamId, department, keyValue: err.keyValue });
        }
        throw err;
      }
    } catch (err) { handleMongoError(err, res, next); }
  }
);

router.put('/:id',
  body('department').optional().notEmpty(),
  body('members').optional().isArray(),
  body('members.*.id').optional().notEmpty(),
  body('members.*.displayName').optional().notEmpty(),
  body('enabled').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const update = { updatedAt: Date.now() };
      ['department', 'members', 'enabled'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) update[field] = req.body[field];
      });
      if (update.department) update.department = normalizeDepartment(update.department);
      const perm = await Permission.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
      if (!perm) return res.status(404).json({ error: 'Not found' });
      res.json(perm);
    } catch (err) { handleMongoError(err, res, next); }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const perm = await Permission.findByIdAndDelete(req.params.id);
    if (!perm) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;
