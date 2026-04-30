import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const ROLE_LABELS = {
  'xu-aro': 'XU-ARO Staff',
  'alumni': 'Alumni',
  'external': 'Book Center Staff',
};

const ROLE_REDIRECTS = {
  'xu-aro': '/dashboard',
  'alumni': '/alumni-portal',
  'external': '/external-portal',
};

export default function Login() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const role = state?.role;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!role) return <Navigate to="/" replace />;

  const saveAndRedirect = (data, expectedRole) => {
    const userRole = data.user.role;

    // 🔒 ROLE ENFORCEMENT (THIS IS THE FIX)
    if (userRole !== expectedRole) {
      setError("You are not allowed to access this portal.");
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(data.user));

    navigate(ROLE_REDIRECTS[userRole] || '/dashboard', { replace: true });
  };

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

      const { data } = await axios.post('/api/auth/login', {
        email,
        password,
      });

      saveAndRedirect(data, role); // 🔥 IMPORTANT FIX
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/auth/google', {
          access_token: tokenResponse.access_token,
          role,
        });

        saveAndRedirect(data, role); // 🔥 IMPORTANT FIX
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-form-side">
          <span className="login-role-tag">{ROLE_LABELS[role]}</span>

          <h4 className="fw-bold mb-1 mt-3" style={{ color: '#283971', fontSize: 22 }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </h4>

          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
            Please {isSignUp ? 'fill in your details' : 'login to continue to your account'}.
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

            {error && (
              <div className="text-danger mb-2" style={{ fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
          
          {role === 'alumni' && (
            <>
              <div className="login-or">or</div>

              <button
                className="google-btn"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
              >
                <i className="bi bi-google" />
                Sign in with Google
              </button>
            </>
          )}

          <button className="back-btn" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left" /> Back
          </button>
        </div>

        <div className="login-dark-panel">
          <div className="login-panel-content">
            <div className="login-panel-logo">XU · ARO</div>
            <div className="login-panel-divider" />
            <div className="login-panel-university">Xavier University</div>
            <div className="login-panel-subtitle">Ateneo de Cagayan</div>
            <div className="login-panel-office">Alumni Relations Office</div>
          </div>
        </div>

      </div>
    </div>
  );
}