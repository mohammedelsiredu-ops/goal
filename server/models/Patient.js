const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  mrn: { type: String, required: true, unique: true, uppercase: true },
  fullName: { type: String, required: true },
  fullNameAr: String,
  fullNameDe: String,
  dateOfBirth: Date,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
    index: true
  },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true },
  address: {
    street: String,
    city: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  allergies: [String],
  chronicDiseases: [String],
  photo: { url: String, publicId: String },
  notes: String,
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastVisit: Date,
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

patientSchema.index({ orgId: 1, mrn: 1 });
patientSchema.index({ gender: 1, age: 1 });

patientSchema.pre('save', async function(next) {
  if (this.mrn) return next();
  const year = new Date().getFullYear();
  const prefix = `REF-${year}-`;
  const lastPatient = await this.constructor.findOne({
    mrn: new RegExp(`^${prefix}`)
  }).sort({ mrn: -1 });
  let sequence = 1;
  if (lastPatient) {
    const lastSequence = parseInt(lastPatient.mrn.split('-')[2]);
    sequence = lastSequence + 1;
  }
  this.mrn = `${prefix}${String(sequence).padStart(4, '0')}`;
  next();
});

patientSchema.pre('save', function(next) {
  if (this.dateOfBirth && !this.age) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
