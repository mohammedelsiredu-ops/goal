const MedicalRecord = require('../models/MedicalRecord');
const AuditLog = require('../models/AuditLog');

exports.getDynamicAnalytics = async (req, res) => {
  try {
    const { diagnosis, gender, ageMin, ageMax, startDate, endDate } = req.query;
    const orgId = req.user.orgId;
    
    const matchConditions = { orgId };
    if (diagnosis) matchConditions['diagnosis.primary'] = { $regex: diagnosis, $options: 'i' };
    if (startDate || endDate) {
      matchConditions.visitDate = {};
      if (startDate) matchConditions.visitDate.$gte = new Date(startDate);
      if (endDate) matchConditions.visitDate.$lte = new Date(endDate);
    }
    
    const pipeline = [
      { $match: matchConditions },
      { $lookup: { from: 'patients', localField: 'patientId', foreignField: '_id', as: 'patient' } },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          ...(gender && { 'patient.gender': gender }),
          ...(ageMin && { 'patient.age': { $gte: parseInt(ageMin) } }),
          ...(ageMax && { 'patient.age': { ...(ageMin ? { $gte: parseInt(ageMin), $lte: parseInt(ageMax) } : { $lte: parseInt(ageMax) }) } })
        }
      },
      { $lookup: { from: 'users', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          visitDate: 1,
          diagnosis: 1,
          'patient.mrn': 1,
          'patient.fullName': 1,
          'patient.gender': 1,
          'patient.age': 1,
          'doctor.fullName': 1
        }
      },
      { $sort: { visitDate: -1 } }
    ];
    
    const results = await MedicalRecord.aggregate(pipeline);
    
    const summaryPipeline = [
      ...pipeline.slice(0, 4),
      {
        $group: {
          _id: null,
          totalCases: { $sum: 1 },
          avgAge: { $avg: '$patient.age' },
          genderDistribution: { $push: '$patient.gender' },
          diagnosisDistribution: { $push: '$diagnosis.primary' }
        }
      }
    ];
    
    const summary = await MedicalRecord.aggregate(summaryPipeline);
    
    await AuditLog.log({
      orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'analytics_view',
      resourceType: 'system',
      details: { filters: { diagnosis, gender, ageMin, ageMax }, resultCount: results.length },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      data: {
        filters: { diagnosis, gender, ageRange: ageMin || ageMax ? `${ageMin || 0}-${ageMax || '∞'}` : null },
        summary: summary[0] || { totalCases: 0, avgAge: 0 },
        results,
        count: results.length
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving analytics' });
  }
};

exports.getDiagnosisBreakdown = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const orgId = req.user.orgId;
    
    const breakdown = await MedicalRecord.aggregate([
      { $match: { orgId } },
      { $group: { _id: '$diagnosis.primary', count: { $sum: 1 } } },
      { $project: { diagnosis: '$_id', totalCases: '$count' } },
      { $sort: { totalCases: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ success: true, data: breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving diagnosis breakdown' });
  }
};
