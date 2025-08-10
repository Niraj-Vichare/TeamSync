const AuthErrorCodes = {
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  POPUP_CLOSED_BY_USER: 'auth/popup-closed-by-user',
  CANCELLED_POPUP_REQUEST: 'auth/cancelled-popup-request',
  POPUP_BLOCKED: 'auth/popup-blocked',
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',
  REQUIRES_RECENT_LOGIN: 'auth/requires-recent-login',
  INVALID_CREDENTIAL: 'auth/invalid-credential',
};

export default AuthErrorCodes;  