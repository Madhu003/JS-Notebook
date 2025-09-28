// Firebase initialization
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAk3xbvz6zUkT0yWc-fu_6RBJOnrFzV3WU',
  authDomain: 'js-notebook-fcced.firebaseapp.com',
  projectId: 'js-notebook-fcced',
  storageBucket: 'js-notebook-fcced.firebasestorage.app',
  messagingSenderId: '345863327073',
  appId: '1:345863327073:web:25fdde579b6252915d8920',
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);

export default app;
