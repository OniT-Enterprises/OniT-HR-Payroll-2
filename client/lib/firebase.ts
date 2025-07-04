// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVdpT-32mvHyfJi03eHVN4IkZtnFVh3xs",
  authDomain: "onit-payroll.firebaseapp.com",
  projectId: "onit-payroll",
  storageBucket: "onit-payroll.firebasestorage.app",
  messagingSenderId: "797230079174",
  appId: "1:797230079174:web:c95536b46c82eea6300bc7",
  measurementId: "G-G2SP080W34",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
