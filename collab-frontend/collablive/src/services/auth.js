import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { handleAuthError } from "@/lib/handleAuthError";
import axios from "axios";
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentWorkspace   = null;
  }

  // Password Reset
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: 'Password reset email sent successfully!' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw handleAuthError(error);
    }
  }

  // Helper method to get current user token
  async getCurrentUserToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(true);
    }
    return null;
  }

  // Email/Password Registration
  async signUpWithEmail(email, password, displayName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      // Send email verification
      //await sendEmailVerification(userCredential.user);

      const idToken = await userCredential.user.getIdToken();
      const backendResponse = await this.verifyTokenWithBackend(idToken, {
        authMethod: "email",
        displayName: displayName,
        workspaceSlug:null,
        profileUrl:null
      });

      return {
        success: true,
        user: userCredential.user,
        message: 'Account created successfully! Please check your email for verification.'
      };
    } catch (error) {
      throw handleAuthError(error);
    }
  }

  // Signin with Email
  async signinWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const backendResponse = await this.verifyTokenWithBackend(idToken, {
        authMethod: "email",
      });
      return {
        success: true,
        user: userCredential.user,
        backendData: backendResponse
      };
    } catch (error) {
      throw handleAuthError();
    }
  }

  // Signin or Signup with google flow is same.
  async signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      const backendResponse = await this.verifyTokenWithBackend(idToken, {
        authMethod: "google",
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });

      return {
        success: true,
        user: userCredential.user,
        data: backendResponse,
        isNewUser: userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime
      }
    } catch (error) {
      throw handleAuthError();
    }
  }


  // GitHub Sign-In
  async signInWithGitHub() {
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const idToken = await userCredential.user.getIdToken();

      const backendResponse = await this.verifyTokenWithBackend(idToken, {
        authMethod: 'github',
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });

      return {
        success: true,
        user: userCredential.user,
        backendData: backendResponse,
        isNewUser: userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime
      };
    } catch (error) {
      console.error('GitHub login error:', error);
      throw handleAuthError(error);
    }
  }

  // Verify token with backend (called after Firebase auth)
  async verifyTokenWithBackend(idToken, additionalData = {}) {
    try {
      console.log('Verifying token with backend:', idToken, additionalData, this.baseURL);
      const response = await axios.post(`${this.baseURL}/auth/verify`, {
        idToken,
        ...additionalData
      });

      return response.data;
    } catch (error) {
      console.error('Backend verification error:', error);
      throw new Error(`Backend verification failed: ${error.response?.status || error.message}`);
    }
  }

  // Signout logic
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw handleAuthError(error);
    }
  }
  // Refresh user data from backend
  async refreshUserData() {
    try {
      const [profile, userData] = await Promise.all([
        this.getProfile(),
        this.getUserData()
      ]);

      return { profile, userData };
    } catch (error) {
      console.error('Refresh user data error:', error);
      throw error;
    }
  }

  // Get User profile from backend
  async getProfile() {
    try{
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    }catch(error){
      console.error('Get profile data error:',error);
      throw error;
    }
  }

  // Get User Data from backend
  async getUserData() {
    try{
      const response = await axiosInstance.get('/user/data');
      return response.data;
    }catch(error){
      console.error('Get user data error: ',error);
      throw error;
    }
  }


  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Get current user's email verification status
  isEmailVerified() {
    return auth.currentUser?.emailVerified || false;
  }
  
  
}

const authService = new AuthService();
export default authService;