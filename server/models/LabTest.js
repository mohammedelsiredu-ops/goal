const mongoose = require('mongoose');

const labTestCatalogSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  testCode: { type: String, required: true, uppercase: true },
  testName: { en: { type: String, required: true }, ar: String, de: String },
  category: { type: String, enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'radiology', 'other'], required: true },
  isAvailable: { type: Boolean, default: true, index: true },
  unavailableReason: String,
  price: Number,
  isActive: { type: Boolean, default: true },
  lastToggledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastToggledAt: Date
}, { timestamps: true });

labTestCatalogSchema.index({ orgId: 1, testCode: 1 }, { unique: true });

const labTestOrderSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  testNumber: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testCatalogId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTestCatalog', required: true },
  testName: String,
  priority: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine', index: true },
  status: { type: String, enum: ['ordered', 'in_progress', 'completed', 'cancelled'], default: 'ordered', index: true },
  results: {
    data: mongoose.Schema.Types.Mixed,
    attachments: [{
      name: String,
      url: String,
      publicId: String
    }],
    reportedAt: Date
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

labTestOrderSchema.index({ orgId: 1, status: 1 });

labTestOrderSchema.pre('save', async function(next) {
  if (this.testNumber) return next();
  const year = new Date().getFullYear();
  const prefix = `LAB-${year}-`;
  const lastTest = await this.constructor.findOne({
    testNumber: new RegExp(`^${prefix}`)
  }).sort({ testNumber: -1 });
  let sequence = 1;
  if (lastTest) {
    const lastSequence = parseInt(lastTest.testNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  this.testNumber = `${prefix}${String(sequence).padStart(4, '0')}`;
  next();
});

const LabTestCatalog = mongoose.model('LabTestCatalog', labTestCatalogSchema);
const LabTestOrder = mongoose.model('LabTestOrder', labTestOrderSchema);

module.exports = { LabTestCatalog, LabTestOrder };
