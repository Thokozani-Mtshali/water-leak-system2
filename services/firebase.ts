import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBqW8ZufBCNFcaD0fV7Ld_mlotDTIv2w9g",
  authDomain: "leakreporter-f8fa0.firebaseapp.com",
  projectId: "leakreporter-f8fa0",
  storageBucket: "leakreporter-f8fa0.firebasestorage.app",
  messagingSenderId: "947740141217",
  appId: "1:947740141217:web:037647e978a8aa35bcb2e0",
  measurementId: "G-JD3G074MRK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase services
// export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;