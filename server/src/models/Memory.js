const mongoose = require('mongoose');

const MEMORY_SOURCES = ['manual', 'chat'];
const MEMORY_SECTIONS = ['You', 'Teams', 'Areas'];

const memorySchema = new mongoose.Schema({
    teamId: { type: String, required: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    section: { type: String, enum: MEMORY_SECTIONS, default: 'Teams', index: true },
    topic: { type: String, trim: true, default: 'General' },
    key: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    source: { type: String, enum: MEMORY_SOURCES, default: 'manual' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// One memory per (team, department, key) so repeated extraction updates it instead of duplicating.
memorySchema.index({ teamId: 1, department: 1, key: 1 }, { unique: true });

memorySchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Memory', memorySchema);
module.exports.MEMORY_SOURCES = MEMORY_SOURCES;
module.exports.MEMORY_SECTIONS = MEMORY_SECTIONS;
