import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import aroLogo from '../assets/aro-logo.png';

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

const CAN_REGISTER = ['alumni'];

export default function Login() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const role = state?.role;

  const isStaff = !CAN_REGISTER.includes(role);

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(state?.googleError || '');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!role) return <Navigate to="/" replace />;

  const saveAndRedirect = (data, expectedRole) => {
    const userRole = data.user.role;

    if (expectedRole && userRole !== expectedRole) {
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
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const backendUrl = "https://aro-alumni-backend.onrender.com";
        
        await axios.post(`${backendUrl}/api/auth/forgot-password`, { email, role });
        
        setSuccess('Password reset link has been sent to your email.');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
        if (!passwordRegex.test(password)) {
          setError('Password must be at least 6 characters and include at least one special character (e.g. @, #, !).');
          setLoading(false);
          return;
        }

        await axios.post('/api/auth/register', {
          email,
          password,
          role,
          name: email.split('@')[0],
        });

        setSuccess('Account created! Please sign in.');
        setIsSignUp(false);
        setPassword('');
        setLoading(false);
        return;
      }

      const { data } = await axios.post('/api/auth/login', {
        email,
        password,
      });

      saveAndRedirect(data, role);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = (forgotMode, signUpMode) => {
    setError('');
    setSuccess('');
    setPassword('');
    setIsForgotPassword(forgotMode);
    setIsSignUp(signUpMode);
  };

  const handleGoogleLogin = () => {
    console.log('🔐 Starting Google login for role:', role);
    // Use the actual backend URL for OAuth redirect (not proxied since it's a full page navigation)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    console.log('  - Backend URL:', backendUrl);
    window.location.href = `${backendUrl}/api/auth/google?role=${role}`;
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-form-side">
          <span className="login-role-tag">
            {ROLE_LABELS[role]}
          </span>

          <h4
            className="fw-bold mb-1 mt-3"
            style={{ color: '#283971', fontSize: 22 }}
          >
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create account' : 'Sign in'}
          </h4>

          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
            {isForgotPassword 
              ? 'Enter your email address and we will send you a link to reset your password.' 
              : isSignUp 
              ? 'Please fill in your details.' 
              : 'Please login to continue to your account.'}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!isForgotPassword && (
              <>
                <div className="pw-wrapper">
                  <input
                    className="login-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="pw-toggle"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    <i
                      aria-hidden="true"
                      className={`bi bi-eye${showPw ? '-slash' : ''}`}
                    />
                  </button>
                </div>

                {!isSignUp && (
                  <div className="d-flex justify-content-end mb-3" style={{ marginTop: -12 }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0, color: '#283971', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => resetFormState(true, false)}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}

            {isSignUp && (
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                Password must be at least 6 characters and include a special character (e.g. @, #, !).
              </div>
            )}

            {error && (
              <div className="text-danger mb-2" style={{ fontSize: 13 }}>
                {error}
              </div>
            )}

            {success && (
              <div className="text-success mb-2" style={{ fontSize: 13 }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Loading...'
                : isForgotPassword
                ? 'Send Reset Link'
                : isSignUp
                ? 'Create account'
                : 'Sign in'}
            </button>
          </form>

          {!isForgotPassword && !isSignUp && role === 'alumni' && (
            <>
              <div className="login-or">or</div>

              <button
                className="google-btn"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
              >
                <i className="bi bi-google" /> Sign in with Google
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {isForgotPassword ? (
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Remember your password?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, color: '#283971', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                  onClick={() => resetFormState(false, false)}
                >
                  Sign in
                </button>
              </p>
            ) : (
              !isStaff && (
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0, color: '#283971', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                    onClick={() => resetFormState(false, !isSignUp)}
                  >
                    {isSignUp ? 'Sign in' : 'Create one'}
                  </button>
                </p>
              )
            )}
          </div>

          <button
            className="back-btn"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-arrow-left" /> Back
          </button>
        </div>

        <div className="login-dark-panel">
          <div className="login-panel-content">
            <img src={aroLogo} alt="ARO Logo" className="login-panel-logo-img" />
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