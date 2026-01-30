const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');
const { subscriptionGuard, featureGuard } = require('../middleware/subscriptionGuard');

router.use(authenticate);
router.use(subscriptionGuard);
router.use(featureGuard('analytics'));

router.get('/dynamic', authorize('doctor', 'admin', 'superadmin'), analyticsController.getDynamicAnalytics);
router.get('/diagnosis-breakdown', authorize('doctor', 'admin', 'superadmin'), analyticsController.getDiagnosisBreakdown);

module.exports = router;
