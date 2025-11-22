import {
  initializeApp,
  getApps,
} from 'firebase/app';
import {
  getFirestore,
} from 'firebase/firestore';
import {
  getAuth,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk3xbvz6zUkT0yWc-fu_6RBJOnrFzV3WU",
  authDomain: "js-notebook-fcced.firebaseapp.com",
  projectId: "js-notebook-fcced",
  storageBucket: "js-notebook-fcced.firebasestorage.app",
  messagingSenderId: "345863327073",
  appId: "1:345863327073:web:883593c3a9e08bc45d8920"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections
export const COLLECTIONS = {
  NOTEBOOKS: 'notebooks',
  USERS: 'users',
  SNIPPETS: 'snippets',
} as const;

// Hardcoded user for demo
export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '',
} as const;

// Export types from centralized location
export type { User, Cell, Notebook, CreateNotebookData, UpdateNotebookData } from '../types';
