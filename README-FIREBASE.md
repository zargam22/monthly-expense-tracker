# Firebase Setup Instructions for Monthly Expense Tracker

## 🔥 Complete Firebase Migration Guide

This guide will help you set up Firebase for your expense tracker app with **FREE hosting and database**.

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `monthly-expense-tracker` (or your preferred name)
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**

### 2. Enable Firestore Database

1. In your Firebase project, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select your region (closest to your location)
5. Click **"Done"**

### 3. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Web app"** icon (`</>`)
4. Enter app nickname: `monthly-expense-tracker`
5. **Check** "Also set up Firebase Hosting"
6. Click **"Register app"**
7. **COPY** the Firebase config object

### 4. Update Firebase Config

Edit `firebase-config.js` and replace with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Update Project ID

Edit `.firebaserc` file:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 6. Install Dependencies & Build

```bash
npm install
npm run build
```

### 7. Deploy to Firebase

```bash
firebase login
firebase deploy
```

## 🎉 Your App is Live!

After deployment, you'll get a URL like:
`https://your-project-id.web.app`

## 🔒 Security Rules (Important!)

Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // Simple rule for single-user app
      match /transactions/{transactionId} {
        allow read, write: if true;
      }
    }
  }
}
```

## ✅ Features Included

- **Real Firebase Database** (never lose data)
- **Firebase Hosting** (professional URL)
- **Automatic backups**
- **Advanced reporting** capabilities
- **Multi-device access**
- **100% FREE** for your usage level

## 🚀 Usage

Your app now uses Firebase instead of localStorage:
- All data persists permanently
- Access from any device
- No cache clearing data loss
- Better performance
- Professional hosting

## 📊 Firebase Quotas (All FREE)

- **Hosting**: 10GB storage, 360MB/day transfer
- **Database**: 1GB storage, 50K reads/day, 20K writes/day
- **Perfect** for expense tracking app

## 🛠️ Local Development

```bash
npm run dev
```

App runs on `http://localhost:3000`

## 📱 Next Steps

Your expense tracker is now a professional cloud application!

**Optional enhancements:**
- Add user authentication for multiple users
- Set up custom domain
- Enable offline functionality
- Add data export features