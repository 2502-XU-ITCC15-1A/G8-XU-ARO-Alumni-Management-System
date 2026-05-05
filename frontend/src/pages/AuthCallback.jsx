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
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');

    if (error || !token) {
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
      const user = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(ROLE_REDIRECTS[user.role] || '/dashboard', { replace: true });
    } catch {
      navigate('/login', {
        state: { role: 'alumni', googleError: 'Google sign-in failed.' },
        replace: true,
      });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#283971' }}>
      Signing in…
    </div>
  );
}
