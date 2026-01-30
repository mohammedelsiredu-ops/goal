const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');
const { subscriptionGuard } = require('../middleware/subscriptionGuard');

router.use(authenticate);
router.use(subscriptionGuard);

router.post('/', authorize('doctor', 'receptionist', 'admin'), patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);
router.put('/:id', authorize('doctor', 'receptionist', 'admin'), patientController.updatePatient);

module.exports = router;
