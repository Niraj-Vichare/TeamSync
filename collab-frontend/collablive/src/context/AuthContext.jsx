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
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthStatus();
    };
    initializeAuth();
  }, []);

  // Load workspaces and projects when user is authenticated and has workspace
  useEffect(() => {
    if (isAuthenticated && workspaceId) {
      getUserWorkspaces();
      getUserProjects();
    }
  }, [isAuthenticated, workspaceId]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const user = authService.getCurrentUser();
        const storedWorkspaceId = authService.getCurrentWorkspaceId();
        
        setCurrentUser(user);
        setWorkspaceId(storedWorkspaceId);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setWorkspaceId(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
      setWorkspaceId(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    try {
      const result = await authService.signUpWithEmail(signupData);
      setCurrentUser(result.user);
      setWorkspaceId(result.workspaceId);
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
        setWorkspaceId(result.workspaceId);
        setUserRole(result.userRole);
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
    } catch (error) {
      throw error;
    }
  };

  const loginWithGitHub = async () => {
    try {
      await authService.signInWithGitHub();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setWorkspaceId(null);
      setUserRole(null);
      setWorkspaces([]);
      setOngoingProjects([]);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if logout fails on backend, clear frontend state
      setCurrentUser(null);
      setWorkspaceId(null);
      setUserRole(null);
      setWorkspaces([]);
      setOngoingProjects([]);
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
      return { user: profile.data, profile: profile.data, userData };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  // Get current workspace ID
  const getCurrentWorkspaceId = () => {
    return workspaceId || authService.getCurrentWorkspaceId();
  };

  // Set current workspace ID and sync with service
  const setCurrentWorkspaceId = (newWorkspaceId) => {
    authService.setCurrentWorkspaceId(newWorkspaceId);
    setWorkspaceId(newWorkspaceId);
  };
  
  const getUserWorkspaces = async () => {
    try {
      const result = await workspaceService.getUserWorkspaces();
      const { successCode, data, success } = result.data;
      
      if (successCode === 200 && success) {
        setWorkspaces(data);
      } else {
        setWorkspaces([]);
      }
      console.log("User Workspaces:", data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    }
  };

  const getUserProjects = async () => {
    try {
      const result = await projectService.getUserProjects();
      const { successCode, data, success } = result.data;
      
      if (successCode === 200 && success) {
        setOngoingProjects(data);
      } else {
        setOngoingProjects([]);
      }
      console.log("Ongoing Projects:", data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setOngoingProjects([]);
    }
  };

  const value = {
    currentUser,
    userRole,
    workspaceId,
    loading,
    isAuthenticated,
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
    getUserWorkspaces, // Export this so components can refresh workspaces
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}