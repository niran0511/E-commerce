import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRc9ZEiODyzeXsAQ9SvE6ulO4dcDYFYrc",
  authDomain: "shopsmartai-66d49.firebaseapp.com",
  projectId: "shopsmartai-66d49",
  storageBucket: "shopsmartai-66d49.firebasestorage.app",
  messagingSenderId: "973675056636",
  appId: "1:973675056636:web:792add9b699c374e94f679",
  measurementId: "G-GXG9G6EX5E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
