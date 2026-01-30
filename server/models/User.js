const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  username: { type: String, required: true, lowercase: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    required: true,
    enum: ['superadmin', 'admin', 'doctor', 'nurse', 'receptionist', 'lab'],
    index: true
  },
  fullName: { type: String, required: true },
  fullNameAr: String,
  fullNameDe: String,
  phone: String,
  specialization: String,
  specializationAr: String,
  specializationDe: String,
  avatar: { url: String, publicId: String },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  passwordChangedAt: Date,
  preferences: {
    language: { type: String, enum: ['en', 'ar', 'de'], default: 'en' }
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ orgId: 1, username: 1 }, { unique: true });
userSchema.index({ orgId: 1, email: 1 }, { unique: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
