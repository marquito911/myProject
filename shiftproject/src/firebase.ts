import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjPdDKeUco0qyGK0xqUuPayyoxL4vLG20",
  authDomain: "fir-react-40e67.firebaseapp.com",
  projectId: "fir-react-40e67",
  storageBucket: "fir-react-40e67.firebasestorage.app",
  messagingSenderId: "75158323298",
  appId: "1:75158323298:web:02c13b8bf4ca9457ce513b",
  measurementId: "G-18CH921TXR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
