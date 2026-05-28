import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLE_REDIRECTS = {
  'xu-aro': '/dashboard',
  'alumni': '/alumni-portal',
  'external': '/external-portal',
};

const ERROR_MESSAGES = {
  cancelled: 'Google sign-in was cancelled.',
  no_account: 'No account found with this Google email. Please contact the administrator.',
  wrong_role: 'You are not allowed to access this portal.',
  token_failed: 'Google sign-in failed. Please try again.',
  no_email: 'Could not retrieve your Google account info.',
  server_error: 'Something went wrong. Please try again.',
};

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';  // URLSearchParams already decodes
    const userParam = params.get('user');
    const error = params.get('error');
    
    console.log('AuthCallback URL:', window.location.href);
    console.log('Token from params:', token.substring(0, 50) + '...');
    console.log('User param:', userParam ? userParam.substring(0, 50) + '...' : 'MISSING');
    console.log('Error:', error);

    // If there's no error and no token params, this page was loaded incorrectly - do nothing
    if (!error && !token && !userParam) {
      console.log('⚠️ No OAuth parameters found - component should not be rendering here');
      return;
    }

    if (error || !token) {
      console.log('❌ Error or no token detected. Error:', error, 'Token exists:', !!token);
      navigate('/login', {
        state: {
          role: 'alumni',
          googleError: ERROR_MESSAGES[error] || 'Google sign-in failed.',
        },
        replace: true,
      });
      return;
    }

    try {
      console.log('✅ Token exists, parsing user data...');
      if (!userParam) {
        throw new Error('userParam is missing from URL');
      }
      console.log('  - Raw userParam:', userParam.substring(0, 100) + '...');
      const decodedUserParam = decodeURIComponent(userParam);
      console.log('  - Decoded userParam:', decodedUserParam);
      const user = JSON.parse(decodedUserParam);
      console.log('  - Parsed user:', JSON.stringify(user));
      
      if (!user.role) {
        throw new Error('User role is missing from response');
      }
      
      console.log('  - Setting localStorage with role:', user.role);
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));
      
      const redirectPath = ROLE_REDIRECTS[user.role] || '/dashboard';
      console.log('✅ Login successful! Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('❌ Error in AuthCallback:', err.message);
      console.error('  - Stack:', err.stack);
      navigate('/login', {
        state: { role: 'alumni', googleError: 'Google sign-in failed: ' + err.message },
        replace: true,
      });
    }
  }, []);  // Empty dependency array - only run once on mount

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#283971' }}>
      Signing in…
    </div>
  );
}
