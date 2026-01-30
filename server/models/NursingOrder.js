const mongoose = require('mongoose');

const nursingOrderSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  orderNumber: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actionType: {
    type: String,
    required: true,
    enum: ['injection', 'dressing', 'iv_drip', 'medication', 'vital_signs', 'blood_draw', 'other'],
    index: true
  },
  medicationName: String,
  administrationMethod: { type: String, enum: ['IV', 'IM', 'SC', 'PO', 'topical', 'other'] },
  dosage: String,
  frequency: String,
  specialInstructions: { en: String, ar: String, de: String },
  priority: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine', index: true },
  scheduledFor: Date,
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending', index: true },
  executionTimestamps: [{
    action: { type: String, enum: ['started', 'paused', 'resumed', 'completed', 'cancelled'] },
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  administeredAt: Date,
  administrationNotes: String,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

nursingOrderSchema.index({ orgId: 1, status: 1, priority: 1 });

nursingOrderSchema.pre('save', async function(next) {
  if (this.orderNumber) return next();
  const year = new Date().getFullYear();
  const prefix = `NO-${year}-`;
  const lastOrder = await this.constructor.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  }).sort({ orderNumber: -1 });
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  this.orderNumber = `${prefix}${String(sequence).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('NursingOrder', nursingOrderSchema);
