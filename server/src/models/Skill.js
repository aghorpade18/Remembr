const mongoose = require('mongoose');

const SKILL_STATUSES = ['draft', 'active', 'inactive'];

const skillSchema = new mongoose.Schema({
  teamId: { type: String, required: true, index: true },
  department: { type: String, required: true, trim: true, index: true },
  status: { type: String, enum: SKILL_STATUSES, default: 'draft', index: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  contentType: { type: String, enum: ['json', 'markdown', 'text'], default: 'json' },
  uploadedBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

skillSchema.index(
  { teamId: 1, department: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_per_department' }
);

skillSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Skill', skillSchema);
module.exports.SKILL_STATUSES = SKILL_STATUSES;
