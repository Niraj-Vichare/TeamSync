// utils/handleAuthError.js
import AuthErrorCodes from '../constants/authErrorCode';

export function handleAuthError(error) {
  const authMessages = {
    [AuthErrorCodes.USER_NOT_FOUND]: 'No account found with this email address.',
    [AuthErrorCodes.WRONG_PASSWORD]: 'Incorrect password.',
    [AuthErrorCodes.EMAIL_ALREADY_IN_USE]: 'An account with this email already exists.',
    [AuthErrorCodes.WEAK_PASSWORD]: 'Password should be at least 6 characters long.',
    [AuthErrorCodes.INVALID_EMAIL]: 'Please enter a valid email address.',
    [AuthErrorCodes.USER_DISABLED]: 'This account has been disabled.',
    [AuthErrorCodes.TOO_MANY_REQUESTS]: 'Too many unsuccessful attempts. Please try again later.',
    [AuthErrorCodes.POPUP_CLOSED_BY_USER]: 'Sign-in was cancelled.',
    [AuthErrorCodes.CANCELLED_POPUP_REQUEST]: 'Sign-in was cancelled.',
    [AuthErrorCodes.POPUP_BLOCKED]: 'Sign-in popup was blocked. Please allow popups and try again.',
    [AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL]: 'An account already exists with the same email address but different sign-in credentials.',
    [AuthErrorCodes.REQUIRES_RECENT_LOGIN]: 'This operation requires recent authentication. Please sign in again.',
    [AuthErrorCodes.INVALID_CREDENTIAL]: 'The provided credentials are invalid.',
  };

  const message = authMessages[error.code] || error.message || 'An authentication error occurred.';
  return new Error(message);
}
