const mongoose = require('mongoose');

const TOOL_NAMES = [
  'jira',
  'confluence',
  'github',
  'sharepoint',
  'teams',
  'teamscalendar',
  'outlook',
  'powerpoint',
  'blackduck',
  'veracode',
  'polaris',
  'workday',
  'bitbucket'
];

const integrationSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  department: { type: String, required: true, trim: true },
  tool: { type: String, required: true, enum: TOOL_NAMES },
  enabled: { type: Boolean, default: false },
  config: {
    baseUrl: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    projectKey: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

integrationSchema.index(
  { teamId: 1, department: 1, tool: 1 },
  { unique: true, partialFilterExpression: { department: { $type: 'string' } } }
);
integrationSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Integration', integrationSchema);
module.exports.TOOL_NAMES = TOOL_NAMES;
