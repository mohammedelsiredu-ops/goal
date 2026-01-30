const { LabTestCatalog } = require('../models/LabTest');
const AuditLog = require('../models/AuditLog');

exports.getTestCatalog = async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    const query = { orgId: req.user.orgId, isActive: true };
    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    
    const tests = await LabTestCatalog.find(query).sort({ category: 1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching test catalog' });
  }
};

exports.toggleTestAvailability = async (req, res) => {
  try {
    const { isAvailable, unavailableReason } = req.body;
    const test = await LabTestCatalog.findOne({ _id: req.params.testId, orgId: req.user.orgId });
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    
    const previousStatus = test.isAvailable;
    test.isAvailable = isAvailable;
    test.unavailableReason = isAvailable ? null : unavailableReason;
    test.lastToggledBy = req.user._id;
    test.lastToggledAt = new Date();
    await test.save();
    
    await AuditLog.log({
      orgId: req.user.orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'lab_availability_toggle',
      resourceType: 'lab_test',
      resourceId: test._id.toString(),
      details: { testCode: test.testCode, before: previousStatus, after: isAvailable },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: `Test ${isAvailable ? 'enabled' : 'disabled'}`, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling availability' });
  }
};
