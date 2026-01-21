
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCs_pmK2Psaqo3FIsAetxaGBsR3S1EVcyE",
  authDomain: "courtsync-2a204.firebaseapp.com",
  projectId: "courtsync-2a204",
  storageBucket: "courtsync-2a204.firebasestorage.app",
  messagingSenderId: "165746199522",
  appId: "1:165746199522:web:899c41f53d1092c3edc7bb",
  measurementId: "G-R3KQL3DSF5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
