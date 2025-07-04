#!/bin/bash

echo "🚀 PayrollHR Firebase Deployment Script"
echo "========================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "🔐 Step 1: Login to Firebase"
echo "This will open your browser for authentication..."
firebase login

echo "✅ Step 2: Build the application"
npm run build

echo "🔧 Step 3: Initialize Firebase project"
firebase use onit-payroll

echo "🌐 Step 4: Deploy to Firebase Hosting"
firebase deploy --only hosting

echo "🗄️  Step 5: Deploy Firestore rules (optional)"
firebase deploy --only firestore:rules

echo "🎉 Deployment completed!"
echo ""
echo "🌍 Your app is now live at:"
echo "   - https://onit-payroll.web.app"
echo "   - https://onit-payroll.firebaseapp.com"
echo ""
echo "📊 To add sample data:"
echo "   1. Visit your live app"
echo "   2. Open browser console (F12)"
echo "   3. Run: fetch('/init-data.js').then(r=>r.text()).then(eval).then(()=>initPayrollHRData())"
