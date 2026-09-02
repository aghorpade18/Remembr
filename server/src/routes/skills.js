const express = require('express');
const multer = require('multer');
const path = require('path');
const Skill = require('../models/Skill');
const { SKILL_STATUSES } = require('../models/Skill');

const router = express.Router();

function normalizeDepartment(department) {
  return department?.trim() || 'Unassigned';
}

const ALLOWED_EXTENSIONS = ['.json', '.md', '.txt'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Only JSON, Markdown (.md), and Text (.txt) files are allowed'));
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

    const ext = path.extname(req.file.originalname).toLowerCase();
    const rawContent = req.file.buffer.toString('utf-8');
    let content;
    let contentType;

    if (ext === '.json') {
      try {
        content = JSON.parse(rawContent);
        contentType = 'json';
      } catch {
        return res.status(400).json({ error: 'Invalid JSON file' });
      }
    } else {
      // .md or .txt - store as text
      content = rawContent;
      contentType = ext === '.md' ? 'markdown' : 'text';
    }

    const skill = await Skill.create({
      teamId: req.params.teamId,
      department: normalizeDepartment(req.body.department),
      status: 'draft',
      fileName: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      content,
      contentType
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

    skill.status = status;
    skill.updatedAt = Date.now();
    await skill.save();
    res.json(skill);
  } catch (err) {
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
