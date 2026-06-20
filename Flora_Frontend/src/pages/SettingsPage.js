import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getSettings, updateSettings } from '../services/settingsService';
import '../App.css';
import './SettingsPage.css';

function SettingsPage() {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    theme: 'light',
    language: 'English',
    notificationsEnabled: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    getSettings()
      .then((data) =>
        setForm({
          displayName: data.displayName || '',
          email: data.email || '',
          theme: data.theme || 'light',
          language: data.language || 'English',
          notificationsEnabled: !!data.notificationsEnabled,
        })
      )
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.displayName.trim()) errs.displayName = 'Display name is required.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) errs.email = 'Email is required.';
    else if (!emailRe.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.theme) errs.theme = 'Please select a theme.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors({ ...errors, [name]: '' });
    setSuccess('');
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updateSettings(form);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />

      <main className="page-content">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Manage your account preferences.</p>

        {loading ? (
          <div className="loading-spinner">Loading settings…</div>
        ) : (
          <div className="settings-card">
            <form onSubmit={handleSubmit} noValidate>
              {success && <div className="alert alert-success">{success}</div>}
              {serverError && <div className="alert alert-error">{serverError}</div>}

              {/* Account section */}
              <div className="settings-section">
                <h2 className="settings-section-title">Account</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="displayName">Display Name</label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="Your full name"
                      value={form.displayName}
                      onChange={handleChange}
                      className={errors.displayName ? 'input-error' : ''}
                    />
                    {errors.displayName && <span className="field-error">{errors.displayName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>
              </div>

              {/* Appearance section */}
              <div className="settings-section">
                <h2 className="settings-section-title">Appearance</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="theme">Theme Preference</label>
                    <select
                      id="theme"
                      name="theme"
                      value={form.theme}
                      onChange={handleChange}
                      className={errors.theme ? 'input-error' : ''}
                    >
                      <option value="light">🌞 Light</option>
                      <option value="dark">🌙 Dark</option>
                    </select>
                    {errors.theme && <span className="field-error">{errors.theme}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select id="language" name="language" value={form.language} onChange={handleChange}>
                      <option value="English">English</option>
                      <option value="Hebrew">Hebrew (עברית)</option>
                      <option value="French">French (Français)</option>
                      <option value="Spanish">Spanish (Español)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications section */}
              <div className="settings-section">
                <h2 className="settings-section-title">Notifications</h2>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    checked={form.notificationsEnabled}
                    onChange={handleChange}
                  />
                  <span>Enable email notifications for watering reminders</span>
                </label>
              </div>

              <div className="settings-footer">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SettingsPage;
