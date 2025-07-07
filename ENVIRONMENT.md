# Environment Configuration

This document explains how to configure the environment variables and settings for the OniT HR Payroll system.

## 🔧 Environment Variables

### Required Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Environment Files by Stage

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## ��� Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "onit-hr-payroll")
4. Enable Google Analytics (optional)
5. Choose your analytics account

### 2. Enable Services

#### Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your region

#### Authentication

1. Go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"

#### Storage

1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select your region

### 3. Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add web app
4. Register your app
5. Copy the configuration object

### 4. Configure Firestore Rules

```javascript
// Firestore Security Rules (for development)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    // NOTE: This is for development only!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Configure Storage Rules

```javascript
// Storage Security Rules (for development)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 🚀 Deployment Environments

### Development

```env
VITE_APP_ENV=development
VITE_FIREBASE_PROJECT_ID=onit-hr-payroll-dev
```

### Staging

```env
VITE_APP_ENV=staging
VITE_FIREBASE_PROJECT_ID=onit-hr-payroll-staging
```

### Production

```env
VITE_APP_ENV=production
VITE_FIREBASE_PROJECT_ID=onit-hr-payroll-prod
```

## 🔐 Security Considerations

### Production Firebase Rules

For production, use more restrictive rules:

#### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Employees collection
    match /employees/{document} {
      allow read, write: if request.auth != null;
    }

    // Departments collection
    match /departments/{document} {
      allow read, write: if request.auth != null;
    }

    // Candidates collection
    match /candidates/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /employee-documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }

    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Database Indexes

Create these indexes in Firestore for optimal performance:

### Employees Collection

- Field: `status`, Direction: Ascending
- Field: `jobDetails.department`, Direction: Ascending
- Field: `personalInfo.firstName`, Direction: Ascending

### Departments Collection

- Field: `name`, Direction: Ascending
- Field: `createdAt`, Direction: Descending

### Candidates Collection

- Field: `status`, Direction: Ascending
- Field: `appliedDate`, Direction: Descending

## 🛠️ Development Setup

### Local Firebase Emulators (Optional)

For local development without connecting to live Firebase:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Environment for Emulators

```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_AUTH_EMULATOR_HOST=localhost:9099
VITE_STORAGE_EMULATOR_HOST=localhost:9199
```

## 🔍 Troubleshooting

### Common Issues

1. **Firebase not initialized**

   - Check if all environment variables are set
   - Verify Firebase config syntax

2. **Permission denied**

   - Check Firestore security rules
   - Ensure user is authenticated

3. **CORS errors**
   - Verify Firebase project configuration
   - Check domain whitelist in Firebase

### Debug Mode

Enable debug logging:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 📝 Example .env.local

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC123...
VITE_FIREBASE_AUTH_DOMAIN=onit-hr-payroll.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onit-hr-payroll
VITE_FIREBASE_STORAGE_BUCKET=onit-hr-payroll.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123DEF

# Development Settings
VITE_APP_ENV=development
VITE_DEBUG=true
```

## 🚀 Deployment

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Other Platforms

The built files in `dist/` can be deployed to any static hosting service.
