import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const ROLE_LABELS = {
  'xu-aro':   'XU-ARO Staff',
  'alumni':   'Alumni',
  'external': 'External User',
};

const ROLE_REDIRECTS = {
  'xu-aro':   '/dashboard',
  'alumni':   '/alumni-portal',
  'external': '/external-portal',
};

export default function Login() {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const role        = state?.role;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (!role) return <Navigate to="/" replace />;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/auth/google', {
          access_token: tokenResponse.access_token,
          role,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('user', JSON.stringify({ name: data.user.name, email: data.user.email }));
        navigate(ROLE_REDIRECTS[data.user.role] || '/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await axios.post('/api/auth/register', {
          email,
          password,
          role,
          name: email.split('@')[0],
        });
      }

      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user', JSON.stringify({ name: data.user.name, email: data.user.email }));
      navigate(ROLE_REDIRECTS[data.user.role] || '/dashboard', { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Form side */}
        <div className="login-form-side">
          <div className="login-role-tag">{ROLE_LABELS[role]}</div>

          <h4 className="fw-bold mb-1 mt-3" style={{ color: '#111827', fontSize: 22 }}>
            {isSignUp ? 'Sign up' : 'Sign in'}
          </h4>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
            Please login to continue to your account.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="pw-wrapper">
              <input
                className="login-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                <i className={`bi bi-eye${showPw ? '-slash' : ''}`} />
              </button>
            </div>

            {error && <div className="text-danger mb-2" style={{ fontSize: 13 }}>{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading
                ? (isSignUp ? 'Signing up…' : 'Signing in…')
                : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </form>

          <div className="login-or">or</div>

          <button className="google-btn" type="button" onClick={() => handleGoogleLogin()}>
            <i className="bi bi-google" />
            Sign {isSignUp ? 'up' : 'in'} with Google
          </button>

          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 'auto', paddingTop: 16 }}>
            {isSignUp ? (
              <>Already have an account?{' '}
                <button className="link-btn" onClick={() => { setIsSignUp(false); setError(''); }}>
                  Sign in
                </button>
              </>
            ) : (
              <>Need an account?{' '}
                <button className="link-btn" onClick={() => { setIsSignUp(true); setError(''); }}>
                  Create one
                </button>
              </>
            )}
          </div>

          <button className="back-btn" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left" /> Back
          </button>
        </div>

        {/* Decorative dark panel */}
        <div className="login-dark-panel" />

      </div>
    </div>
  );
}
