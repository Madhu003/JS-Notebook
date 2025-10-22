import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  // Convert Firebase User to our AuthUser interface
  private mapFirebaseUser(user: User | null): AuthUser | null {
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  // Login with email and password
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User logged in successfully');
      return this.mapFirebaseUser(userCredential.user)!;
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'Firebase: Error (auth/user-not-found).':
            errorMessage = 'No account found with this email';
            break;
          case 'Firebase: Error (auth/wrong-password).':
            errorMessage = 'Incorrect password';
            break;
          case 'Firebase: Error (auth/invalid-email).':
            errorMessage = 'Invalid email address';
            break;
          case 'Firebase: Error (auth/user-disabled).':
            errorMessage = 'This account has been disabled';
            break;
          case 'Firebase: Error (auth/too-many-requests).':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Register with email and password
  async register(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
      
      console.log('✅ User registered successfully');
      return this.mapFirebaseUser(userCredential.user)!;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'Firebase: Error (auth/email-already-in-use).':
            errorMessage = 'An account with this email already exists';
            break;
          case 'Firebase: Error (auth/invalid-email).':
            errorMessage = 'Invalid email address';
            break;
          case 'Firebase: Error (auth/weak-password).':
            errorMessage = 'Password should be at least 6 characters';
            break;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Logout current user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ User logged out successfully');
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  // Listen to authentication state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(this.mapFirebaseUser(user));
    });
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(this.mapFirebaseUser(user));
      });
    });
  }
}

export const authService = new AuthService();
