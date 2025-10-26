import { FirebaseError } from 'firebase/app';

export type FirebaseErrorResponse = {
  title: string;
  message: string;
};

export function handleFirebaseError(error: unknown): FirebaseErrorResponse {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return {
          title: 'Invalid Email',
          message: 'Please provide a valid email address.',
        };
      case 'auth/user-disabled':
        return {
          title: 'Account Disabled',
          message: 'This account has been disabled. Please contact support.',
        };
      case 'auth/user-not-found':
        return {
          title: 'User Not Found',
          message: 'No account found with these credentials.',
        };
      case 'auth/wrong-password':
        return {
          title: 'Invalid Password',
          message: 'The password is incorrect. Please try again.',
        };
      case 'auth/email-already-in-use':
        return {
          title: 'Email In Use',
          message: 'This email is already registered.',
        };
      case 'auth/operation-not-allowed':
        return {
          title: 'Operation Not Allowed',
          message: 'This operation is not allowed. Please contact support.',
        };
      case 'auth/weak-password':
        return {
          title: 'Weak Password',
          message: 'The password is too weak. Please choose a stronger password.',
        };
      // Firestore errors
      case 'permission-denied':
        return {
          title: 'Permission Denied',
          message: 'You do not have permission to perform this action.',
        };
      case 'not-found':
        return {
          title: 'Not Found',
          message: 'The requested resource was not found.',
        };
      case 'already-exists':
        return {
          title: 'Already Exists',
          message: 'This resource already exists.',
        };
      default:
        return {
          title: 'Error',
          message: error.message || 'An unexpected error occurred.',
        };
    }
  }
  
  return {
    title: 'Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  };
}