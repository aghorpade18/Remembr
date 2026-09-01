const express = require('express');
const multer = require('multer');
const path = require('path');
const Skill = require('../models/Skill');
const { SKILL_STATUSES } = require('../models/Skill');

const router = express.Router();

function normalizeDepartment(department) {
  return department?.trim() || 'Unassigned';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.json') {
      return cb(new Error('Only JSON files are allowed'));
    }
    cb(null, true);
  }
});

router.get('/:teamId', async (req, res, next) => {
  try {
    const filter = { teamId: req.params.teamId };
    if (req.query.department) filter.department = normalizeDepartment(req.query.department);
    const skills = await Skill.find(filter).sort({ status: 1, createdAt: -1 });
    res.json(skills);
  } catch (err) { next(err); }
});

router.post('/:teamId/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.body.department) return res.status(400).json({ error: 'Department is required' });

    let content;
    try {
      content = JSON.parse(req.file.buffer.toString('utf-8'));
    } catch {
      return res.status(400).json({ error: 'Invalid JSON file' });
    }

    const skill = await Skill.create({
      teamId: req.params.teamId,
      department: normalizeDepartment(req.body.department),
      status: 'draft',
      fileName: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      content
    });
    res.status(201).json(skill);
  } catch (err) { next(err); }
});

router.get('/detail/:id', async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Not found' });
    res.json(skill);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    );
    if (!skill) return res.status(404).json({ error: 'Not found' });
    res.json(skill);
  } catch (err) { next(err); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!SKILL_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of ${SKILL_STATUSES.join(', ')}` });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Not found' });

    if (status === 'active') {
      await Skill.updateMany(
        {
          teamId: skill.teamId,
          department: skill.department,
          status: 'active',
          _id: { $ne: skill._id }
        },
        { status: 'inactive', updatedAt: Date.now() }
      );
    }

    skill.status = status;
    skill.updatedAt = Date.now();
    await skill.save();
    res.json(skill);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Another skill is already active for this department' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;
