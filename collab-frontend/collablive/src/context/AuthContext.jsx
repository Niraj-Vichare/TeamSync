import authService from '@/services/auth';
import notificationHubService from '@/services/notificationHub';
import { oauthService } from '@/services/oauth';
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
  const [userPermissions, setUserPermissions] = useState([]); // NEW
  const [loading, setLoading] = useState(true);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

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
      loadUserPermissions(); // NEW
    }
  }, [isAuthenticated, workspaceId]);
  useEffect(() => {
    if (isAuthenticated && workspaceId) {
      getUserWorkspaces();
      getUserProjects();
      loadUserPermissions();
      notificationHubService.connect();   // ← ADD THIS
    }

    // Disconnect on auth loss
    return () => {
      if (!isAuthenticated) notificationHubService.disconnect();
    };
  }, [isAuthenticated, workspaceId]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const isAuth = await authService.checkAuthStatus();
      
      if (isAuth) {
        const user = authService.getCurrentUser();
        const storedWorkspaceId = authService.getCurrentWorkspaceId();
        const storedRole = authService.getUserRole();
        const storedPermissions = authService.getUserPermissions(); // NEW
        
        setCurrentUser(user);
        setWorkspaceId(storedWorkspaceId);
        setUserRole(storedRole);
        setUserPermissions(storedPermissions || []); // NEW
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setWorkspaceId(null);
        setUserRole(null);
        setUserPermissions([]); // NEW
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
      setWorkspaceId(null);
      setUserRole(null);
      setUserPermissions([]); // NEW
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignin = async () => {
        setOauthLoading(true);
        const result = await oauthService.signInWithGoogle();
        if (!result.success) {
            toast.error('Failed to start Google sign in');
            setOauthLoading(false);
        }
        // Will redirect to Google automatically
    };

  // NEW: Load user permissions from backend
  const loadUserPermissions = async () => {
    try {
      const permissions = await authService.getUserPermissions();
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setUserPermissions([]);
    }
  };

  // NEW: Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!userPermissions || userPermissions.length === 0) return false;
    return userPermissions.includes(permission);
  };

  // NEW: Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (!userPermissions || userPermissions.length === 0) return false;
    return permissions.some(p => userPermissions.includes(p));
  };

  // NEW: Check if user has all of the specified permissions
  const hasAllPermissions = (permissions) => {
    if (!userPermissions || userPermissions.length === 0) return false;
    return permissions.every(p => userPermissions.includes(p));
  };

  // NEW: Check if user has a specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // NEW: Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  const signup = async (signupData) => {
    try {
      const result = await authService.signUpWithEmail(signupData);
      setCurrentUser(result.user);
      setWorkspaceId(result.workspaceId);
      setUserRole(result.userRole); // NEW
      setUserPermissions(result.permissions || []); // NEW
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
        setUserPermissions(result.permissions || []); // NEW
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


  const logout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setWorkspaceId(null);
      setUserRole(null);
      setUserPermissions([]); // NEW
      setWorkspaces([]);
      setOngoingProjects([]);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if logout fails on backend, clear frontend state
      setCurrentUser(null);
      setWorkspaceId(null);
      setUserRole(null);
      setUserPermissions([]); // NEW
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
      await loadUserPermissions(); // NEW: Reload permissions
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
    loadUserPermissions(); // NEW: Reload permissions for new workspace
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
    userPermissions, // NEW
    workspaceId,
    loading,
    isAuthenticated,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserData,
    checkAuthStatus,
    getCurrentWorkspaceId,
    setCurrentWorkspaceId,
    workspaces,
    ongoingProjects,
    getUserWorkspaces,
    // NEW: Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    loadUserPermissions,
    setUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}