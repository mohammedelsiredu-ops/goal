# 🏥 Nicotine - Clinic Management System

A complete, production-ready, multi-tenant SaaS clinic management system.

## ✨ Features

### Core Features
- 🔐 Multi-tenant architecture with organization isolation
- 👥 Role-based access control (Superadmin, Admin, Doctor, Nurse, Receptionist, Lab)
- 📊 Real-time analytics dashboard with Chart.js
- 🌍 Multi-language support (EN/AR/DE) with RTL
- 📱 Responsive design (Mobile, Tablet, Desktop)
- ☁️ Cloudinary integration for file uploads
- 🔍 Advanced search and filtering

### Medical Features
- 👤 Patient Management with auto-generated MRN (REF-2026-0001)
- 📅 Appointment Scheduling
- 📋 Medical Records & Diagnosis
- 🧪 Lab Module
- 💊 Nursing Module
- 📈 Analytics & Reporting
- 📝 Audit Logging

### Subscription Management
- Trial, Basic, Premium, Enterprise plans
- Feature toggles per organization
- User and patient limits
- Automatic expiry handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Cloudinary account (optional, for uploads)

### Installation

1. **Generate the project:**
   ```bash
   node setup.js
   ```

2. **Install dependencies:**
   ```bash
   cd nicotine
   npm run install-all
   ```

3. **Configure environment:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Seed initial data:**
   ```bash
   npm run seed
   ```

5. **Start development:**
   ```bash
   cd ..
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:5000

### Default Credentials

**Superadmin:**
- Email: admin@nicotine.com
- Password: Admin@123!

**Demo Organization (ORG001):**
- Admin: admin@demo.com / Admin@123!
- Doctor: doctor@demo.com / Doctor@123!
- Nurse: nurse@demo.com / Nurse@123!

## 📁 Project Structure

```
nicotine/
├── server/
│   ├── models/           # Mongoose models
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/           # Helpers & seeding
│   └── server.js        # Express server
├── client/
│   ├── public/          # Static files
│   │   ├── css/        # Stylesheets
│   │   ├── js/         # JavaScript
│   │   └── index.html  # Main HTML
│   └── webpack.config.js
└── package.json
```

## 🔧 Configuration

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nicotine

# Security
JWT_SECRET=your-secret-key-min-32-chars
SESSION_SECRET=your-session-secret

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=http://localhost:3001
```

## 🎨 UI/UX Design

### Color Palette
- **Primary Blue:** #2563eb (Trust, Professional)
- **Secondary Green:** #10b981 (Health, Success)
- **Accent Purple:** #8b5cf6 (Analytics)
- **Surface White:** #ffffff
- **Background:** #f8fafc

### Typography
- **Font:** Inter (System fallback)
- **Headings:** 600-700 weight
- **Body:** 400-500 weight

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register organization
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Soft delete patient

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/export` - Export reports

### Organizations
- `GET /api/organizations` - List all (Superadmin)
- `PUT /api/organizations/:id` - Update organization
- `PUT /api/organizations/:id/subscription` - Update subscription

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Helmet.js security headers
- Input validation & sanitization
- CORS protection
- Session management
- Audit logging

## 🌍 Multi-Language Support

The system supports:
- **English (EN)** - Default
- **Arabic (AR)** - With RTL support
- **German (DE)**

Language switching is automatic based on user preference.

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## 🚀 Production Deployment

### Build for production:
```bash
npm run build
```

### Deploy to:
- **Backend:** Heroku, Railway, Render
- **Frontend:** Netlify, Vercel, Cloudflare Pages
- **Database:** MongoDB Atlas

### Environment Checklist:
- [ ] Set strong JWT_SECRET (32+ chars)
- [ ] Configure MongoDB Atlas
- [ ] Set up Cloudinary (optional)
- [ ] Enable CORS for frontend domain
- [ ] Configure SSL/HTTPS
- [ ] Set NODE_ENV=production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@nicotine.com
- Documentation: [Wiki]

## 🎯 Roadmap

- [ ] Mobile apps (React Native)
- [ ] Telegram bot integration
- [ ] AI-powered diagnosis suggestions
- [ ] Video consultations
- [ ] E-prescriptions
- [ ] Insurance integration
- [ ] Payment gateway
- [ ] Advanced reporting
- [ ] Multi-clinic support
- [ ] API webhooks

## 👏 Acknowledgments

Built with:
- Express.js
- MongoDB + Mongoose
- Chart.js
- Webpack
- Cloudinary

---

**Made with ❤️ for healthcare professionals**
