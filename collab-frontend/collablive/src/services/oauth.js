import { supabase } from '@/services/supabase';
import axiosInstance from './axiosInstance';

export const oauthService = {
  /**
   * Initiate Google OAuth
   */
  async signInWithGoogle() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('OAuth error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Handle OAuth callback
   */
  async handleCallback() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Get session from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!data.session) throw new Error('No session found');

      // Send tokens to backend
      const response = await axiosInstance.post('/auth/oauth/callback', {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};