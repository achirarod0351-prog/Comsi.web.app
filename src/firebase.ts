import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiclxotS7Bi4BVoCEQEeqtiQydWz53Cn8",
  authDomain: "essential-indexer-1n50x.firebaseapp.com",
  projectId: "essential-indexer-1n50x",
  storageBucket: "essential-indexer-1n50x.firebasestorage.app",
  messagingSenderId: "958019561629",
  appId: "1:958019561629:web:f17ed2666a900b5786cc74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId and enable ignoreUndefinedProperties
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, "ai-studio-calendarapp-94ace091-c09b-42cb-9ee8-1b5efcf7ebb7");

// Initialize Auth
const auth = getAuth(app);

export { app, db, auth };
