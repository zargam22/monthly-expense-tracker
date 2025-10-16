// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDenYZRGJTYHV-IENNpBr4bHbDWf4BAOBk",
  authDomain: "monthly-expense-tracker-e7ea3.firebaseapp.com",
  projectId: "monthly-expense-tracker-e7ea3",
  storageBucket: "monthly-expense-tracker-e7ea3.firebasestorage.app",
  messagingSenderId: "1002507965275",
  appId: "1:1002507965275:web:689a05f920fc110602407e",
  measurementId: "G-4Z7MM8N0R7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with better error handling
export const db = getFirestore(app);

// Enable network by default
try {
  enableNetwork(db);
} catch (error) {
  console.log('Network already enabled or error enabling network:', error);
}

// For development/testing with emulator (optional)
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }