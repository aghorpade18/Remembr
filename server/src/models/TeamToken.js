const mongoose = require('mongoose');

const TARGET_TYPES = ['channel', 'groupchat'];

const teamTokenSchema = new mongoose.Schema({
    teamId: { type: String, required: true, index: true },
    targetType: { type: String, required: true, enum: TARGET_TYPES },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true, trim: true },
    token: { type: String, default: '', trim: true },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

teamTokenSchema.index({ teamId: 1, targetType: 1, targetId: 1 }, { unique: true });
teamTokenSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('TeamToken', teamTokenSchema);
module.exports.TARGET_TYPES = TARGET_TYPES;