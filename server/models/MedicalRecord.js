const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visitDate: { type: Date, default: Date.now, index: true },
  chiefComplaint: { en: String, ar: String, de: String },
  examinationFindings: String,
  vitalSigns: {
    temperature: Number,
    pulse: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  diagnosis: {
    primary: { type: String, required: true, index: true },
    primaryAr: String,
    primaryDe: String,
    secondary: [String]
  },
  treatmentPlan: String,
  attachments: [{
    name: String,
    url: String,
    publicId: String
  }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

medicalRecordSchema.index({ orgId: 1, 'diagnosis.primary': 1, visitDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
