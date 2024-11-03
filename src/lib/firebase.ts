import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCm1WBAAcphr9B19WhILQqHAKFmx_p4jPY",
  authDomain: "vit-connect-420a2.firebaseapp.com",
  projectId: "vit-connect-420a2",
  storageBucket: "vit-connect-420a2.appspot.com",
  messagingSenderId: "1030046126425",
  appId: "1:1030046126425:web:e360a8ddd203035d57bc48",
  measurementId: "G-Q8XPVJJ6WE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);