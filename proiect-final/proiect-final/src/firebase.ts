import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where  } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { firestore, storage , collection, addDoc, doc, setDoc, db , auth, getDoc, getDocs, query, where   };