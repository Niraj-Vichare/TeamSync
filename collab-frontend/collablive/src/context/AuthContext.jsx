import authService from '@/services/auth';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const profile = await authService.getProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = (email, password, displayName) => {
    return authService.registerWithEmail(email, password, displayName);
  };

  const login = (email, password) => {
    return authService.signinWithEmail(email, password);
  };

  const loginWithGoogle = () => {
    return authService.signInWithGoogle();
  };

  const loginWithGitHub = () => {
    return authService.signInWithGitHub();
  };

  const logout = () => {
    return authService.logout();
  };

  const resetPassword = (email) => {
    return authService.resetPassword(email);
  };

  const refreshUserData = async () => {
    try {
      const { user, profile } = await authService.refreshUserData();
      setCurrentUser(user);
      setUserProfile(profile);
      return { user, profile };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    userProfile,
    isAuthenticated: true,
    signup,
    login,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    resetPassword,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
