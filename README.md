# OniT HR Payroll System

A comprehensive, modern HR and Payroll management system built with React, TypeScript, and Firebase. Designed for companies to efficiently manage employees, departments, payroll, and organizational data.

![OniT HR Payroll](https://img.shields.io/badge/OniT-HR%20Payroll-blue)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

## 🚀 Features

### 👥 Employee Management

- **Complete Employee Profiles** - Personal info, job details, compensation, documents
- **Bulk CSV Import** - Import employees with intelligent column mapping
- **Profile Completeness Tracking** - Visual indicators for missing information
- **Document Management** - Track ID cards, passports, visas with expiry dates
- **Employee Directory** - Searchable, filterable employee listings

### 🏢 Department Management

- **Dynamic Departments** - Create and manage organizational departments
- **Visual Customization** - Custom icons, colors, and shapes for departments
- **Director & Manager Assignment** - Assign leadership roles
- **Department Analytics** - Staff counts, payroll costs, statistics

### 📊 Dashboard & Analytics

- **Staff Dashboard** - Real-time employee statistics and breakdowns
- **Time & Leave Dashboard** - Employee time tracking overview
- **Payroll Reports** - Comprehensive salary and compensation reports
- **Organization Chart** - Visual representation of company structure

### 👤 Hiring & Offboarding

- **Candidate Management** - Track applications and candidates
- **Offboarding Process** - Structured employee departure workflow
- **Exit Interviews** - Built-in exit interview management
- **Status Tracking** - Monitor onboarding/offboarding progress

### 🔧 System Features

- **Firebase Integration** - Real-time database and authentication
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Data Export** - CSV export capabilities
- **Search & Filtering** - Advanced search across all modules
- **Dark/Light Theme** - Customizable interface themes

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: React Context, Custom Hooks
- **Forms**: React Hook Form, Zod Validation
- **Routing**: React Router v6
- **Charts**: Recharts
- **File Processing**: Papa Parse (CSV)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** or **yarn** package manager
- **Firebase CLI** (for deployment)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/OniT-Enterprises/OniT-HR-Payroll.git
cd OniT-HR-Payroll
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database, Authentication, and Storage
3. Copy your Firebase config and create `client/lib/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
OniT-HR-Payroll/
├── client/                 # Frontend application
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├���─ layout/        # Layout components
│   │   └── ...            # Feature components
│   ├── pages/             # Application pages
│   │   ├── staff/         # Employee management
│   │   ├── hiring/        # Recruitment & offboarding
│   │   ├── dashboards/    # Analytics dashboards
│   │   └── reports/       # Reporting modules
│   ├── services/          # Firebase services
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   └── contexts/          # React contexts
├── public/                # Static assets
├── firebase.json          # Firebase configuration
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

The system includes built-in authentication with demo credentials:

- **Demo Admin**: `admin@onit.com` / `admin123`
- **Demo User**: `user@onit.com` / `user123`

For production, configure Firebase Authentication with your preferred providers.

## 📈 Key Modules

### Employee Management (`/staff`)

- **All Employees** - Complete employee directory
- **Add Employee** - New employee onboarding form
- **Departments** - Department management and analytics
- **Organization Chart** - Visual company structure

### Dashboards (`/dashboards`)

- **Staff Dashboard** - Employee overview and statistics
- **Time & Leave** - Time tracking and leave management

### Hiring (`/hiring`)

- **Candidate Selection** - Recruitment pipeline
- **Offboarding** - Employee departure management

### Reports (`/reports`)

- **Payroll Reports** - Comprehensive payroll analytics

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize:

```bash
firebase login
firebase init hosting
```

3. Build and deploy:

```bash
npm run build
firebase deploy
```

### Other Platforms

The application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Deploy from Git or drag & drop
- **AWS S3**: Static website hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Contact: [Your Contact Information]
- Documentation: [Your Documentation URL]

## 🔄 Recent Updates

- ✅ Complete Firebase integration
- ✅ Bulk CSV import with column mapping
- ✅ Department management with visual customization
- ✅ Comprehensive offboarding workflow
- ✅ Monthly salary display throughout application
- ✅ Profile completeness tracking
- ✅ Real-time data synchronization

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] API integration capabilities
- [ ] Advanced role-based permissions
- [ ] Payroll processing automation
- [ ] Performance review module

---

**OniT Enterprises** - Building the future of HR technology
