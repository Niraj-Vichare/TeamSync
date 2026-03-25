import axios from "axios";
import axiosInstance from "./axiosInstance";
import { oauthService } from "./oauth";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentUser = null;
    this.currentWorkspaceId = null;
    this.userRole = null;
    this.userPermissions = [];
  }

  // Sign up with email and password
  async signUpWithEmail(signupData) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/signup`, signupData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Set workspace ID if provided
        if (response.data.workspaceId) {
          this.setCurrentWorkspaceId(response.data.workspaceId);
        }

        const profile = await this.getProfile();
        this.currentUser = profile.data;

        return {
          success: true,
          user: this.currentUser,
          workspaceId: this.currentWorkspaceId,
          message: response.data.message || 'Account created successfully!'
        };
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  }

  // Sign in with email and password
  async signinWithEmail(loginData) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/signin`, loginData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Set workspace ID and user role
        if (response.data.data?.workspaceId) {
          this.setCurrentWorkspaceId(response.data.data.workspaceId);
        }

        if (response.data.data?.userRole) {
          // this.setUserRole(response.data.data.userRole);
          const role = response.data.data?.userRole || response.data.user?.userRole;
          this.setUserRole(role);
        }

        const profile = await this.getProfile();
        this.currentUser = profile.data;

        return {
          success: true,
          user: profile.data,
          workspaceId: this.currentWorkspaceId,
          userRole: this.userRole,
          message: response.data.message || 'Signin successful'
        };
      } else {
        throw new Error(response.data.message || 'Signin failed');
      }
    } catch (error) {
      console.error('Signin error:', error);
      throw new Error(error.response?.data?.message || 'Signin failed');
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      return await oauthService.signInWithGoogle();
    } catch (error) {
      console.error('Google signin error:', error);
      throw new Error('Google signin failed');
    }
  }
  // Password Reset
  async resetPassword(email) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/reset-password`, {
        email
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password reset email sent successfully!'
        };
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Sign out
  async signOut() {
    try {
      await axiosInstance.post('/auth/signout');

      // Clear local data
      this.currentUser = null;
      this.currentWorkspaceId = null;
      this.userRole = null;
      localStorage.removeItem('currentWorkspaceId');

      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      // Even if backend call fails, clear local data
      this.currentUser = null;
      this.currentWorkspaceId = null;
      this.userRole = null;
      localStorage.removeItem('currentWorkspaceId');

      throw new Error('Signout failed');
    }
  }

  // Get user profile from backend
  async getProfile() {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Get user data from backend
  async getUserData() {
    try {
      const response = await axiosInstance.get('/user/data');
      return response.data;
    } catch (error) {
      console.error('Get user data error:', error);
      throw error;
    }
  }

  // Refresh user data from backend
  async refreshUserData() {
    try {
      const [profile, userData] = await Promise.all([
        this.getProfile(),
        this.getUserData()
      ]);

      this.currentUser = profile.data;
      return { profile, userData };
    } catch (error) {
      console.error('Refresh user data error:', error);
      throw error;
    }
  }

  // Check authentication status
  async checkAuthStatus() {
    try {
      const profile = await this.getProfile();
      this.currentUser = profile.data;

      // Load workspace ID from localStorage if not in memory
      if (!this.currentWorkspaceId) {
        const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        if (storedWorkspaceId) {
          this.currentWorkspaceId = storedWorkspaceId;
        }
        return true;
      }
      return false;

    } catch (error) {
      this.currentUser = null;
      this.currentWorkspaceId = null;
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current workspace ID
  getCurrentWorkspaceId() {
    // Return from memory or fallback to localStorage
    if (this.currentWorkspaceId) {
      return this.currentWorkspaceId;
    }

    const stored = localStorage.getItem('currentWorkspaceId');
    if (stored) {
      this.currentWorkspaceId = stored;
      return stored;
    }

    return null;
  }

  // Set current workspace ID (consistent storage)
  setCurrentWorkspaceId(workspaceId) {
    if (workspaceId) {
      this.currentWorkspaceId = workspaceId;
      localStorage.setItem('currentWorkspaceId', workspaceId);
    } else {
      this.currentWorkspaceId = null;
      localStorage.removeItem('currentWorkspaceId');
    }
  }

  // Set user role
  setUserRole(userRole) {
    this.userRole = userRole;
  }

  // Get user role
  getUserRole() {
    return this.userRole;
  }

  async getUserPermissions() {
    try {
      const workspaceId = this.getCurrentWorkspaceId();
      if (!workspaceId) return [];

      const response = await axiosInstance.get('/user/permissions', {
        params: { workspaceId }
      });

      if (response.data.success) {
        // Store in memory only — never localStorage (security risk per audit)
        this.userPermissions = response.data.data || [];
        return this.userPermissions;
      }
      return [];
    } catch (error) {
      console.error('Get permissions error:', error);
      return [];
    }
  }
  setUserPermissions(permissions) {
    // Memory only — no localStorage (security risk)
    this.userPermissions = permissions || [];
  }

  // NEW: Clear permissions cache
  clearPermissions() {
    this.userPermissions = [];
    localStorage.removeItem('userPermissions');
  }


}

const authService = new AuthService();
export default authService;