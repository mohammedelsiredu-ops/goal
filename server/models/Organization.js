const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  orgId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  clinicName: { type: String, required: true },
  clinicNameAr: String,
  clinicNameDe: String,
  logo: {
    url: String,
    publicId: String
  },
  primaryColor: { type: String, default: '#2563eb' },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  address: {
    street: String,
    city: String,
    country: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    maxUsers: { type: Number, default: 5 },
    maxPatients: { type: Number, default: 100 }
  },
  features: {
    analytics: { type: Boolean, default: false },
    labModule: { type: Boolean, default: true },
    nursingModule: { type: Boolean, default: true },
    billingModule: { type: Boolean, default: true },
    cloudStorage: { type: Boolean, default: false }
  },
  defaultLanguage: {
    type: String,
    enum: ['en', 'ar', 'de'],
    default: 'en'
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

organizationSchema.index({ orgId: 1 });
organizationSchema.index({ 'subscription.isActive': 1, 'subscription.expiryDate': 1 });

organizationSchema.methods.isSubscriptionValid = function() {
  return this.subscription.isActive && new Date() <= new Date(this.subscription.expiryDate);
};

module.exports = mongoose.model('Organization', organizationSchema);
