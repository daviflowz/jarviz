import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBNtW8gMngS7RpWZeGv0DrWoaCwY_Moig",
  authDomain: "jarvix-b7e7c.firebaseapp.com",
  projectId: "jarvix-b7e7c",
  storageBucket: "jarvix-b7e7c.firebasestorage.app",
  messagingSenderId: "209861300263",
  appId: "1:209861300263:web:77fc34d559dd5b8b903e02",
  measurementId: "G-N77QDXV9ZJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Habilitar logs detalhados do Firestore para debug
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuração do Firebase carregada:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
} 