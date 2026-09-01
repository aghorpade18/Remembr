const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  teamId: { type: String, required: true, index: true },
  teamName: { type: String, required: true },
  department: { type: String, required: true, trim: true },
  members: [{
    id: { type: String, required: true },
    displayName: { type: String, required: true },
    mail: { type: String, default: null },
    userPrincipalName: { type: String, default: null }
  }],
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

permissionSchema.index({ teamId: 1, department: 1 }, { unique: true });
permissionSchema.pre('save', function () { this.updatedAt = Date.now(); });

module.exports = mongoose.model('Permission', permissionSchema);
