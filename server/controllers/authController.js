const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }
    
    const user = await User.findOne({ username, isActive: true, isDeleted: false }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    user.lastLogin = new Date();
    await user.save();
    
    await AuditLog.log({
      orgId: user.orgId,
      userId: user._id,
      userName: user.fullName,
      userRole: user.role,
      action: 'login',
      resourceType: 'system',
      status: 'success',
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        orgId: user.orgId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findById(req.user._id);
    user.preferences.language = language;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating preferences' });
  }
};
