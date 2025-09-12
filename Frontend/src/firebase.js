// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeCiABM-5Sizq-PmBBxjKSoxeweJdpf5A",
  authDomain: "devpulse-fa91b.firebaseapp.com",
  projectId: "devpulse-fa91b",
  storageBucket: "devpulse-fa91b.firebasestorage.app",
  messagingSenderId: "251955428976",
  appId: "1:251955428976:web:3ac65ec9d511b52ce47eb5",
  measurementId: "G-ER3TXLQX4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);