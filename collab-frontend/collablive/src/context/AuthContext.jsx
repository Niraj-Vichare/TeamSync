import authService from '@/services/auth';
import projectService from '@/services/project';
import workspaceService from '@/services/workspace';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ongoingProjects,setOngoingProjects] = useState([]);
  const [workspaces,setWorkspaces] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
    useEffect(() => {
      checkAuthStatus();
      getUserWorkspaces();
      getUserProjects();
    }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        //setUserProfile(user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        //setUserProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
      //setUserProfile(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    try {
      const result = await authService.signUpWithEmail(signupData);
      setCurrentUser(result.user);
      setCurrentWorkspaceId(result.workspaceId);
      //setUserProfile(result.user);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const login = async (loginData) => {
    try {
      const result = await authService.signinWithEmail(loginData);
      
      if (result.success) {
        setCurrentUser(result.user);
        setCurrentWorkspaceId(result.workspaceId);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
      // Note: The user will be redirected, so we don't need to update state here
      // The state will be updated when they return and the app reloads
    } catch (error) {
      throw error;
    }
  };

  const loginWithGitHub = async () => {
    try {
      await authService.signInWithGitHub();
      // Note: The user will be redirected, so we don't need to update state here
      // The state will be updated when they return and the app reloads
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      //setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if logout fails on backend, clear frontend state
      setCurrentUser(null);
      //setUserProfile(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const resetPassword = (email) => {
    return authService.resetPassword(email);
  };

  const refreshUserData = async () => {
    try {
      const { profile, userData } = await authService.refreshUserData();
      setCurrentUser(profile.data);
      setUserProfile(profile.data);
      return { user: profile.data, profile: profile.data, userData };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  // Get current workspace ID
  const getCurrentWorkspaceId = () => {
    return authService.getCurrentWorkspaceId();
  };

  // Set current workspace ID
  const setCurrentWorkspaceId = (workspaceId) => {
    authService.setCurrentWorkspaceId(workspaceId);
  };
  
  const getUserWorkspaces = async () => {
    if (workspaces.length > 0) return; // already cached
    var result = await workspaceService.getUserWorkspaces();
    const {successCode,data,success,message} =  result.data;
    if(successCode === 200 && success){
      setWorkspaces(data);
    } else {
      setWorkspaces([]);
    }
    console.log("User Workspaces:",data);
  }

  const getUserProjects = async () => {
    if (ongoingProjects.length > 0) return; // already cached
    var result = await projectService.getUserProjects();
    const {successCode,data,success,message} =  result.data;
    if(successCode === 200 && success){
      setOngoingProjects(data);
    } else {
      setOngoingProjects([]);
    }
    console.log("Ongoing Projects:",data);
  }

  const value = {
    currentUser,
    loading,
    isAuthenticated: isAuthenticated,
    signup,
    login,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    resetPassword,
    refreshUserData,
    checkAuthStatus,
    getCurrentWorkspaceId,
    setCurrentWorkspaceId,
    workspaces,
    ongoingProjects,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}