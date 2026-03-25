import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { oauthService } from '@/services/oauth';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function OAuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setCurrentWorkspaceId, setUserRole, checkAuthStatus } = useAuth();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const result = await oauthService.handleCallback();

      if (!result.success) {
        setError(result.error);
        toast.error('Authentication failed');
        setTimeout(() => navigate('/auth/signin'), 2000);
        return;
      }

      const userData = result.data;

      // Update auth state
      if (userData.workspaceId) {
        setCurrentWorkspaceId(userData.workspaceId);
      }
      if (userData.userRole !== undefined) {
        setUserRole(userData.userRole);
      }

      // Refresh auth status to load user profile
      await checkAuthStatus();

      toast.success('Signed in successfully!');

      // Redirect based on workspace
      if (!userData.workspaceId) {
        navigate('/workspace/create-workspace');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setError(error.message);
      toast.error('Authentication failed');
      setTimeout(() => navigate('/auth/signin'), 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Completing Sign In</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}