import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentUser = null;
    this.currentWorkspaceId = null;
  }

  // Sign up with email and password
  async signUpWithEmail(signupData) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/signup`, signupData,{
        withCredentials: true
      });
      this.setCurrentWorkspaceId(response.data.workspaceId); // Clear current workspace ID
      if (response.data.success) {
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
      // Make sure loginData is an object with email and password
      const response = await axios.post(`${this.baseURL}/auth/signin`, loginData,{
        withCredentials: true
      });

      if (response.data.success) {
        
        this.setCurrentWorkspaceId(response.data.data.workspaceId); // Clear current workspace ID
        this.currentUser = response.data.data.userId;
        // Store workspace ID if provided
        if (response.data.data?.workspaceId) {
          this.currentWorkspaceId = response.data.data.workspaceId;
          localStorage.setItem('currentWorkspaceId', response.data.data.workspaceId);
        }
        const profile = await this.getProfile();
        this.currentUser = profile.data;

        return {
          success: true,
          user: profile.data,
          workspaceId: response.data.data?.workspaceId,
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

  // Sign in with Google (if you want to keep this option)
  async signInWithGoogle() {
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = `${this.baseURL}/auth/google`;
      
      // Note: The backend should handle the OAuth flow and redirect back
      // with appropriate tokens/cookies set
    } catch (error) {
      console.error('Google signin error:', error);
      throw new Error('Google signin failed');
    }
  }

  // Sign in with GitHub (if you want to keep this option)
  async signInWithGitHub() {
    try {
      // Redirect to backend GitHub OAuth endpoint
      window.location.href = `${this.baseURL}/auth/github`;
      
      // Note: The backend should handle the OAuth flow and redirect back
      // with appropriate tokens/cookies set
    } catch (error) {
      console.error('GitHub signin error:', error);
      throw new Error('GitHub signin failed');
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
      cookieStore.delete('authToken');
      localStorage.removeItem('currentWorkspaceId');
      
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      // Even if backend call fails, clear local data
      this.currentUser = null;
      this.currentWorkspaceId = null;
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
      return true;
    } catch (error) {
      this.currentUser = null;
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
    return this.currentWorkspaceId || localStorage.getItem('currentWorkspaceId');
  }

  // Set current workspace ID
  setCurrentWorkspaceId(workspaceId) {
    this.currentWorkspaceId = workspaceId;
    localStorage.setItem('currentWorkspaceId', workspaceId);
  }
}

const authService = new AuthService();
export default authService;