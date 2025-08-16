#!/bin/bash

# Deploy Firestore rules and indexes
echo "🚀 Deploying Firestore rules and indexes..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Login check
echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Deploy rules and indexes
echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo "✅ Deployment completed!"
echo ""
echo "📝 Note: The Firestore rules have been updated to allow unrestricted access for development."
echo "🔒 For production, uncomment the authentication-based rules in firestore.rules"
