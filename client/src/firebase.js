import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCqbMpcQrRuDAX_YYIvs3Qa0vybj9vC8uk",
  authDomain: "akkaunt-co.firebaseapp.com",
  projectId: "akkaunt-co",
  storageBucket: "akkaunt-co.firebasestorage.app",
  messagingSenderId: "25547521288",
  appId: "1:25547521288:web:7ab333963cee1af81a00bd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };