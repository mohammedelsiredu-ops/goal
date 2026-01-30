const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userRole: String,
  action: { type: String, required: true, index: true },
  resourceType: { type: String, enum: ['patient', 'appointment', 'medical_record', 'nursing_order', 'lab_test', 'user', 'organization', 'system'] },
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failure', 'error'], default: 'success' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: false });

auditLogSchema.index({ orgId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
