const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Memory = require('../models/Memory');
const { extractMemories, normalizeSection } = require('../services/openaiClient');

const router = express.Router();

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
}

function normalizeDepartment(department) {
    return department?.trim() || 'Unassigned';
}

function slugify(value) {
    const slug = String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return slug || `memory-${Date.now()}`;
}

function handleMongoError(err, res, next) {
    if (err.code === 11000) {
        return res.status(409).json({ error: 'A memory with this key already exists for this department' });
    }
    return next(err);
}

router.get('/:teamId',
    param('teamId').notEmpty(),
    validate,
    async (req, res, next) => {
        try {
            const filter = { teamId: req.params.teamId };
            if (req.query.department) filter.department = normalizeDepartment(req.query.department);
            if (req.query.q) {
                const search = new RegExp(req.query.q, 'i');
                filter.$or = [{ key: search }, { topic: search }, { content: search }, { tags: search }];
            }
            const memories = await Memory.find(filter).sort({ updatedAt: -1 });
            res.json(memories);
        } catch (err) { next(err); }
    }
);

// Extracts memory-worthy facts from free text or a chat transcript via OpenAI, then upserts by key.
router.post('/:teamId/generate',
    param('teamId').notEmpty(),
    body('department').notEmpty(),
    body('text').optional().isString(),
    body('messages').optional().isArray(),
    validate,
    async (req, res, next) => {
        try {
            const { department, text, messages } = req.body;
            if (!text && (!messages || messages.length === 0)) {
                return res.status(400).json({ error: 'Provide text or messages to extract memory from' });
            }

            const extracted = await extractMemories({ text, messages });
            if (extracted.length === 0) {
                return res.json({ created: [], message: 'Nothing worth remembering was found' });
            }

            const teamId = req.params.teamId;
            const normalizedDepartment = normalizeDepartment(department);

            const saved = await Promise.all(extracted.map((memory) => Memory.findOneAndUpdate(
                { teamId, department: normalizedDepartment, key: memory.key },
                {
                    teamId,
                    department: normalizedDepartment,
                    section: memory.section,
                    topic: memory.topic,
                    key: memory.key,
                    content: memory.content,
                    tags: memory.tags,
                    source: 'chat',
                    updatedAt: Date.now()
                },
                { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
            )));

            res.status(201).json({ created: saved });
        } catch (err) { next(err); }
    }
);

router.post('/',
    body('teamId').notEmpty(),
    body('department').notEmpty(),
    body('content').notEmpty(),
    validate,
    async (req, res, next) => {
        try {
            const { teamId, content } = req.body;
            const department = normalizeDepartment(req.body.department);
            const topic = (req.body.topic || 'General').trim();
            const section = normalizeSection(req.body.section);
            const key = slugify(req.body.key || `${section}-${topic}`);

            const saved = await Memory.findOneAndUpdate(
                { teamId, department, key },
                {
                    teamId,
                    department,
                    section,
                    topic,
                    key,
                    content,
                    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
                    source: 'manual',
                    updatedAt: Date.now()
                },
                { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
            );
            res.status(201).json(saved);
        } catch (err) { handleMongoError(err, res, next); }
    }
);

router.put('/:id',
    param('id').notEmpty(),
    validate,
    async (req, res, next) => {
        try {
            const update = { updatedAt: Date.now() };
            if (req.body.content !== undefined) update.content = req.body.content;
            if (req.body.topic !== undefined) update.topic = req.body.topic;
            if (req.body.tags !== undefined) update.tags = req.body.tags;
            if (req.body.enabled !== undefined) update.enabled = req.body.enabled;

            const memory = await Memory.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
            if (!memory) return res.status(404).json({ error: 'Not found' });
            res.json(memory);
        } catch (err) { next(err); }
    }
);

router.delete('/:id',
    param('id').notEmpty(),
    validate,
    async (req, res, next) => {
        try {
            const memory = await Memory.findByIdAndDelete(req.params.id);
            if (!memory) return res.status(404).json({ error: 'Not found' });
            res.json({ deleted: true });
        } catch (err) { next(err); }
    }
);

module.exports = router;
