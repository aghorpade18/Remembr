const express = require('express');
const { body, param, validationResult } = require('express-validator');
const TeamToken = require('../models/TeamToken');
const { TARGET_TYPES } = require('../models/TeamToken');

const router = express.Router();

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
}

function handleMongoError(err, res, next) {
    if (err.code === 11000) {
        return res.status(409).json({ error: 'A token row already exists for this target' });
    }

    return next(err);
}

router.get('/:teamId',
    param('teamId').notEmpty(),
    validate,
    async (req, res, next) => {
        try {
            const tokens = await TeamToken.find({ teamId: req.params.teamId }).sort({ targetType: 1, targetName: 1 });
            res.json(tokens);
        } catch (err) { next(err); }
    }
);

router.put('/',
    body('teamId').notEmpty(),
    body('targetType').isIn(TARGET_TYPES),
    body('targetId').notEmpty(),
    body('targetName').notEmpty(),
    body('token').optional().isFloat({ min: 0 }),
    body('enabled').optional().isBoolean(),
    validate,
    async (req, res, next) => {
        try {
            const { teamId, targetType, targetId } = req.body;
            const update = {
                teamId,
                targetType,
                targetId,
                targetName: req.body.targetName.trim(),
                token: Number(req.body.token || 0),
                enabled: req.body.enabled !== undefined ? req.body.enabled : true,
                updatedAt: Date.now()
            };

            const saved = await TeamToken.findOneAndUpdate(
                { teamId, targetType, targetId },
                update,
                { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
            );

            res.json(saved);
        } catch (err) { handleMongoError(err, res, next); }
    }
);

module.exports = router;