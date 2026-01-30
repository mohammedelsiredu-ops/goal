require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { LabTestCatalog } = require('../models/LabTest');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
};

const seed = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding database...');
    
    // Create demo organization
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    let org = await Organization.findOne({ orgId: 'ORG001' });
    if (!org) {
      org = await Organization.create({
        orgId: 'ORG001',
        clinicName: 'Nicotine Medical Center',
        clinicNameAr: 'مركز نيكوتين الطبي',
        clinicNameDe: 'Nicotine Medizinisches Zentrum',
        email: 'admin@nicotine.com',
        phone: '+1234567890',
        subscription: {
          plan: 'premium',
          isActive: true,
          expiryDate,
          maxUsers: 50,
          maxPatients: 1000
        },
        features: {
          analytics: true,
          labModule: true,
          nursingModule: true,
          billingModule: true,
          cloudStorage: true
        }
      });
      console.log('✅ Created organization');
    }
    
    // Create superadmin
    const superadminExists = await User.findOne({ username: 'superadmin' });
    if (!superadminExists) {
      await User.create({
        orgId: 'SUPERADMIN',
        username: 'superadmin',
        email: 'superadmin@nicotine.com',
        password: 'Admin@123!',
        role: 'superadmin',
        fullName: 'Super Administrator'
      });
      console.log('✅ Created superadmin');
    }
    
    // Create demo users
    const users = [
      { username: 'dr.smith', email: 'dr.smith@nicotine.com', role: 'doctor', fullName: 'Dr. John Smith', fullNameAr: 'د. جون سميث', specialization: 'General Medicine' },
      { username: 'nurse.jane', email: 'nurse.jane@nicotine.com', role: 'nurse', fullName: 'Jane Doe', fullNameAr: 'جين دو' },
      { username: 'reception', email: 'reception@nicotine.com', role: 'receptionist', fullName: 'Sarah Johnson', fullNameAr: 'سارة جونسون' },
      { username: 'lab.tech', email: 'lab@nicotine.com', role: 'lab', fullName: 'Mike Wilson', fullNameAr: 'مايك ويلسون' }
    ];
    
    for (const userData of users) {
      const exists = await User.findOne({ username: userData.username });
      if (!exists) {
        await User.create({ ...userData, orgId: org.orgId, password: 'Password123!' });
        console.log(`✅ Created user: ${userData.username}`);
      }
    }
    
    // Create lab test catalog
    const tests = [
      { testCode: 'CBC', testName: { en: 'Complete Blood Count', ar: 'تعداد الدم الكامل', de: 'Blutbild' }, category: 'hematology', price: 50 },
      { testCode: 'GLUC', testName: { en: 'Blood Glucose', ar: 'سكر الدم', de: 'Blutzucker' }, category: 'biochemistry', price: 30 },
      { testCode: 'LIPID', testName: { en: 'Lipid Profile', ar: 'فحص الدهون', de: 'Lipidprofil' }, category: 'biochemistry', price: 70 },
      { testCode: 'XRAY', testName: { en: 'X-Ray', ar: 'أشعة سينية', de: 'Röntgen' }, category: 'radiology', price: 100 }
    ];
    
    for (const test of tests) {
      const exists = await LabTestCatalog.findOne({ orgId: org.orgId, testCode: test.testCode });
      if (!exists) {
        await LabTestCatalog.create({ ...test, orgId: org.orgId });
        console.log(`✅ Created test: ${test.testCode}`);
      }
    }
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Superadmin: superadmin / Admin@123!');
    console.log('Doctor: dr.smith / Password123!');
    console.log('Nurse: nurse.jane / Password123!');
    console.log('Receptionist: reception / Password123!');
    console.log('Lab: lab.tech / Password123!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
