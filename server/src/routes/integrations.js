const express = require('express');
const { body, validationResult } = require('express-validator');
const Integration = require('../models/Integration');
const { TOOL_NAMES } = require('../models/Integration');

const router = express.Router();

function normalizeDepartment(department) {
  return department?.trim() || 'Unassigned';
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.get('/:teamId', async (req, res, next) => {
  try {
    if (!req.query.department) return res.status(400).json({ error: 'department query is required' });
    const department = normalizeDepartment(req.query.department);
    const filter = { teamId: req.params.teamId, department };
    let integrations = await Integration.find(filter);

    if (integrations.length === 0) {
      const defaults = TOOL_NAMES.map((tool) => ({
        teamId: req.params.teamId, department, tool, enabled: false
      }));
      integrations = await Integration.insertMany(defaults);
    }

    res.json(integrations);
  } catch (err) { next(err); }
});

router.put('/:id',
  body('enabled').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const update = { updatedAt: Date.now() };
      if (req.body.enabled !== undefined) update.enabled = req.body.enabled;
      if (req.body.config) update.config = req.body.config;

      const integration = await Integration.findByIdAndUpdate(
        req.params.id, update, { new: true, runValidators: true }
      );
      if (!integration) return res.status(404).json({ error: 'Not found' });
      res.json(integration);
    } catch (err) { next(err); }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const integration = await Integration.findByIdAndDelete(req.params.id);
    if (!integration) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;
