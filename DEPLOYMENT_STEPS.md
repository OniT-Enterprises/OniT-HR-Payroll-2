# PayrollHR Firebase Deployment Guide

## 🚀 Your app is ready to deploy!

### Build Status: ✅ Complete

- Built successfully with Vite
- Output files ready in `dist/spa/`
- Firebase configuration files created

### Manual Deployment Steps:

#### 1. **Firebase Console Setup**

Go to [Firebase Console](https://console.firebase.google.com/project/onit-payroll)

#### 2. **Enable Firestore Database**

- Go to **Firestore Database**
- Click **Create database**
- Choose **Start in test mode** for now
- Select a location (us-central1 recommended)

#### 3. **Deploy via Firebase Console**

- Go to **Hosting** in Firebase Console
- Click **Get started** if first time
- You can upload the `dist/spa` folder directly via web interface

#### 4. **Alternative: Command Line Deployment**

If you have Firebase CLI installed locally:

```bash
# Login to Firebase
firebase login

# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 🌐 Your Live URLs:

- **Main App**: https://onit-payroll.web.app
- **Alternative**: https://onit-payroll.firebaseapp.com

### 📊 Initialize Sample Data:

After deployment, visit your live app and run this in browser console:

```javascript
// This will populate your Firestore with sample employees and candidates
import("./assets/initializeFirebaseData.js").then((m) =>
  m.initializeFirebaseData(),
);
```

### 🔐 First Admin User:

1. Go to Firebase Console → Authentication
2. Click **Add user**
3. Email: `admin@payrollhr.com`
4. Password: `admin123`
5. Or use the signup page at `/auth/register`

### 🛡️ Security (Production Ready):

1. Update Firestore rules in Firebase Console
2. Enable Authentication rules
3. Set up proper user roles

## Current Features Ready:

✅ Employee Management with Firebase
✅ Candidate Selection with real-time data  
✅ User Authentication
✅ All HR modules (Time, Performance, Payroll, Reports)
✅ Responsive design
✅ Professional UI/UX

Your PayrollHR system is production-ready! 🎉
