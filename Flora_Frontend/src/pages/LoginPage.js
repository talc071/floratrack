import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getSession } from '../services/authService';
import '../App.css';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate('/', { replace: true });
  }, [navigate]);

  const validate = () => {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register') {
      if (!form.firstName.trim()) errs.firstName = 'First name is required.';
      if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    }

    if (!form.email) errs.email = 'Email is required.';
    else if (!emailRe.test(form.email)) errs.email = 'Enter a valid email address.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password
        });
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">🌿</span>
          <h1>FloraTrack</h1>
          <p>{isRegister ? 'Create your account' : 'Digital Plant Care Companion'}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div className="alert alert-error">{serverError}</div>}

          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'input-error' : ''}
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'input-error' : ''}
                  autoComplete="family-name"
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading
              ? (isRegister ? 'Creating account…' : 'Signing in…')
              : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button type="button" className="login-link" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </p>
          ) : (
            <p>
              New to FloraTrack?{' '}
              <button type="button" className="login-link" onClick={() => switchMode('register')}>
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
