const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      orgId: req.user.orgId,
      registeredBy: req.user._id
    };
    
    const patient = await Patient.create(patientData);
    
    await AuditLog.log({
      orgId: req.user.orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'patient_create',
      resourceType: 'patient',
      resourceId: patient._id.toString(),
      details: { mrn: patient.mrn, fullName: patient.fullName },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.status(201).json({ success: true, message: 'Patient created successfully', data: patient });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ success: false, message: 'Error creating patient' });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { orgId: req.user.orgId, isDeleted: false };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mrn: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Patient.countDocuments(query);
    
    res.json({
      success: true,
      data: patients,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching patients' });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, orgId: req.user.orgId, isDeleted: false });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching patient' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, orgId: req.user.orgId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    await AuditLog.log({
      orgId: req.user.orgId,
      userId: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'patient_update',
      resourceType: 'patient',
      resourceId: patient._id.toString(),
      details: { mrn: patient.mrn },
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Patient updated successfully', data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating patient' });
  }
};
