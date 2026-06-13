import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCszjQMsUnQiR8P65_OI75iLAznOsvYg-k",
  authDomain: "milhas-373c0.firebaseapp.com",
  projectId: "milhas-373c0",
  storageBucket: "milhas-373c0.firebasestorage.app",
  messagingSenderId: "963593520062",
  appId: "1:963593520062:web:21f150de77dd874f256fef",
  measurementId: "G-H9TTPZYC7V",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
