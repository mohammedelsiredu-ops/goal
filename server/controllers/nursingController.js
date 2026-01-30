const NursingOrder = require('../models/NursingOrder');
const AuditLog = require('../models/AuditLog');

exports.getPendingOrders = async (req, res) => {
  try {
    const { priority, actionType } = req.query;
    const query = { orgId: req.user.orgId, status: 'pending', isDeleted: false };
    if (priority) query.priority = priority;
    if (actionType) query.actionType = actionType;
    
    const orders = await NursingOrder.find(query)
      .populate('patientId', 'mrn fullName age gender allergies')
      .populate('doctorId', 'fullName specialization')
      .sort({ priority: 1, createdAt: 1 });
    
    res.json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

exports.startOrderExecution = async (req, res) => {
  try {
    const order = await NursingOrder.findOne({ _id: req.params.orderId, orgId: req.user.orgId, status: 'pending' });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.executionTimestamps.push({
      action: 'started',
      timestamp: new Date(),
      performedBy: req.user._id,
      notes: req.body.notes || 'Started'
    });
    order.status = 'in_progress';
    await order.save();
    
    await AuditLog.log({
      orgId: req.user.orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'nursing_order_update',
      resourceType: 'nursing_order',
      resourceId: order._id.toString(),
      details: { action: 'started', orderNumber: order.orderNumber },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Order started', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting order' });
  }
};

exports.completeOrderExecution = async (req, res) => {
  try {
    const order = await NursingOrder.findOne({
      _id: req.params.orderId,
      orgId: req.user.orgId,
      status: { $in: ['pending', 'in_progress'] }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.executionTimestamps.push({
      action: 'completed',
      timestamp: new Date(),
      performedBy: req.user._id,
      notes: req.body.administrationNotes || 'Completed'
    });
    order.status = 'completed';
    order.administeredBy = req.user._id;
    order.administeredAt = new Date();
    order.administrationNotes = req.body.administrationNotes;
    await order.save();
    
    await AuditLog.log({
      orgId: req.user.orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'nursing_order_complete',
      resourceType: 'nursing_order',
      resourceId: order._id.toString(),
      details: { orderNumber: order.orderNumber },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Order completed', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing order' });
  }
};
