const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth');
const { subscriptionGuard } = require('../middleware/subscriptionGuard');

router.use(authenticate);
router.use(subscriptionGuard);

router.get('/catalog', labController.getTestCatalog);
router.put('/catalog/:testId/toggle', authorize('lab', 'admin'), labController.toggleTestAvailability);

module.exports = router;
