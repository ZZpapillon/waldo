import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// Import other Firebase SDKs as needed

const firebaseConfig = {
  apiKey: "AIzaSyD-_EE5QU0pslO335jradfOiv4FqemMN7s",
  authDomain: "waldo-8727f.firebaseapp.com",
  projectId: "waldo-8727f",
  storageBucket: "waldo-8727f.appspot.com",
  messagingSenderId: "92739825088",
  appId: "1:92739825088:web:261365f61e95b5a74a2c25"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase modules as needed
export const auth = firebase.auth();
export const firestore = firebase.firestore();
// Export other Firebase modules as needed
