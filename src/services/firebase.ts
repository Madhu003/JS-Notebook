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
} as const;

// Hardcoded user for demo
export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: '👤',
} as const;

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

import { CellType } from '../types/enums';

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  language?: string;
  output?: string;
  error?: string;
}

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  cells: Cell[];
  userId: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  tags: string[];
}

export interface CreateNotebookData {
  title: string;
  description?: string;
  cells: Cell[];
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateNotebookData {
  title?: string;
  description?: string;
  cells?: Cell[];
  isPublic?: boolean;
  tags?: string[];
}
