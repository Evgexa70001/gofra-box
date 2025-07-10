import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAAz-eBamm-pS64w-rgtAws4zfDwNkCWG8',
  authDomain: 'gofra-box.firebaseapp.com',
  projectId: 'gofra-box',
  storageBucket: 'gofra-box.firebasestorage.app',
  messagingSenderId: '95416307786',
  appId: '1:95416307786:web:b7ac4a7825e3519a7f16b3',
  measurementId: 'G-906HWTLEPY',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
