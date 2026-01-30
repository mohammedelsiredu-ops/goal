const express = require('express');
const router = express.Router();
const nursingController = require('../controllers/nursingController');
const { authenticate, authorize } = require('../middleware/auth');
const { subscriptionGuard } = require('../middleware/subscriptionGuard');

router.use(authenticate);
router.use(subscriptionGuard);

router.get('/orders/pending', authorize('nurse', 'admin'), nursingController.getPendingOrders);
router.put('/orders/:orderId/start', authorize('nurse', 'admin'), nursingController.startOrderExecution);
router.put('/orders/:orderId/complete', authorize('nurse', 'admin'), nursingController.completeOrderExecution);

module.exports = router;
