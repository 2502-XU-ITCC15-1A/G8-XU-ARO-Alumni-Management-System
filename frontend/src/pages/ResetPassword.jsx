import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import aroLogo from '../assets/aro-logo.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const passwordRegex =
      /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 6 characters and include at least one special character (e.g. @, #, !).'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, {
        password,
      });

      setSuccess(
        'Password updated successfully! Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Link is invalid or has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT SIDE */}
        <div className="login-form-side">
          <span className="login-role-tag">
            Password Recovery
          </span>

          <h4
            className="fw-bold mb-1 mt-3"
            style={{ color: '#283971', fontSize: 22 }}
          >
            Set New Password
          </h4>

          <p
            style={{
              color: '#6b7280',
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            Please enter your new secure password below.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="pw-wrapper">
              <input
                className="login-input"
                type={showPw ? 'text' : 'password'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="pw-toggle"
                aria-label={
                  showPw ? 'Hide password' : 'Show password'
                }
                onClick={() => setShowPw((v) => !v)}
              >
                <i
                  aria-hidden="true"
                  className={`bi bi-eye${
                    showPw ? '-slash' : ''
                  }`}
                />
              </button>
            </div>

            <input
              className="login-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            <div
              style={{
                fontSize: 11,
                color: '#6b7280',
                marginBottom: 8,
                marginTop: -4,
              }}
            >
              Password must be at least 6 characters and
              include a special character (e.g. @, #, !).
            </div>

            {error && (
              <div
                className="text-danger mb-2"
                style={{ fontSize: 13 }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="text-success mb-2"
                style={{ fontSize: 13 }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </form>

          <button
            className="back-btn"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-arrow-left" /> Back
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-dark-panel">
          <div className="login-panel-content">
            <img
              src={aroLogo}
              alt="ARO Logo"
              className="login-panel-logo-img"
            />

            <div className="login-panel-divider" />

            <div className="login-panel-university">
              Xavier University
            </div>

            <div className="login-panel-subtitle">
              Ateneo de Cagayan
            </div>

            <div className="login-panel-office">
              Alumni Relations Office
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}