import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDUhsSTKb6MCmSL3xIFD4CTAaMvaWneCfo",
  authDomain: "octo-10d4f.firebaseapp.com",
  projectId: "octo-10d4f",
  storageBucket: "octo-10d4f.firebasestorage.app",
  messagingSenderId: "494062478640",
  appId: "1:494062478640:web:8588ee8de55ee9917294f5",
  measurementId: "G-D2YLS083GJ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics só no browser
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) getAnalytics(app);
  });
}

export default app;
