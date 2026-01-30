const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');

const subscriptionGuard = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'superadmin') {
      return next();
    }
    
    const orgId = req.user?.orgId;
    if (!orgId) {
      return res.status(403).json({ success: false, message: 'Organization not found' });
    }
    
    const organization = await Organization.findOne({ orgId });
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    
    if (!organization.subscription.isActive) {
      await AuditLog.log({
        orgId,
        userId: req.user._id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'subscription_blocked',
        resourceType: 'system',
        details: { reason: 'Subscription inactive' },
        status: 'failure',
        ipAddress: req.ip
      });
      return res.status(403).json({ success: false, code: 'SUBSCRIPTION_INACTIVE', message: 'Subscription is inactive' });
    }
    
    const now = new Date();
    const expiryDate = new Date(organization.subscription.expiryDate);
    if (now > expiryDate) {
      return res.status(403).json({ success: false, code: 'SUBSCRIPTION_EXPIRED', message: 'Subscription has expired' });
    }
    
    req.organization = organization;
    next();
  } catch (error) {
    console.error('Subscription guard error:', error);
    return res.status(500).json({ success: false, message: 'Error checking subscription' });
  }
};

const featureGuard = (featureName) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.role === 'superadmin') {
        return next();
      }
      const organization = req.organization || await Organization.findOne({ orgId: req.user.orgId });
      if (!organization || !organization.features[featureName]) {
        return res.status(403).json({ success: false, code: 'FEATURE_NOT_AVAILABLE', message: 'Feature not available in your plan' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error checking feature access' });
    }
  };
};

module.exports = { subscriptionGuard, featureGuard };
