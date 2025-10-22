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
    // Validate inputs
    if (!email || email.trim() === '') {
      throw new Error('Email is required');
    }
    if (!password || password.trim() === '') {
      throw new Error('Password is required');
    }

    try {
      console.log('🔐 Attempting login with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ User logged in successfully');
      return this.mapFirebaseUser(userCredential.user)!;
    } catch (error) {
      console.error('🔥 Firebase login error:', error);
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        console.error('🔥 Error message:', error.message);
        console.error('🔥 Error code:', (error as any).code);
        
        // Handle Firebase error codes
        const errorCode = (error as any).code;
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/missing-email':
            errorMessage = 'Email is required';
            break;
          default:
            // Fallback to message parsing for older Firebase versions
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
      }
      
      throw new Error(errorMessage);
    }
  }

  // Register with email and password
  async register(email: string, password: string, displayName: string): Promise<AuthUser> {
    // Validate inputs
    if (!email || email.trim() === '') {
      throw new Error('Email is required');
    }
    if (!password || password.trim() === '') {
      throw new Error('Password is required');
    }
    if (!displayName || displayName.trim() === '') {
      throw new Error('Display name is required');
    }

    try {
      console.log('📝 Attempting registration with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
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
