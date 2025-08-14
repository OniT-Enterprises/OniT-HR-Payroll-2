# Firebase Deployment Instructions

## Quick Fix for Permissions Error

The Firebase permissions error has been resolved by:

1. **Removing aggressive Firebase blocking** that was preventing authentication
2. **Simplifying Firestore rules** to allow unrestricted access for development  
3. **Making authentication optional** in the candidate service

## Deploy Updated Rules

To deploy the updated Firestore rules to your Firebase project:

```bash
# Option 1: Use the deployment script
./deploy.sh

# Option 2: Deploy rules only
firebase deploy --only firestore:rules

# Option 3: Deploy everything
firebase deploy
```

## Current Firestore Rules

The current rules allow unrestricted access for development:

```javascript
match /{document=**} {
  allow read, write: if true;
}
```

## For Production

Before deploying to production, update `firestore.rules` to use authenticated access:

```javascript
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

## Troubleshooting

If you still encounter permissions errors:

1. **Check Firebase Console**: Verify the rules are deployed in the [Firebase Console](https://console.firebase.google.com/project/onit-payroll/firestore/rules)
2. **Clear browser cache**: Hard refresh (Ctrl+F5) to clear any cached Firebase tokens
3. **Check network**: Ensure Firebase services are accessible from your network

## Testing

The application now includes a Firebase test component on the dashboard that will:
- Test Firebase connectivity
- Verify Firestore access
- Check authentication status
- Test candidate service functionality

Use this to verify the fixes are working correctly.
