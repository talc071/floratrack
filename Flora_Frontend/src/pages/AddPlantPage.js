import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createPlant } from '../services/plantsService';
import { identifyPlant } from '../services/careLogsService';
import { getSession } from '../services/authService';
import '../App.css';
import './AddPlantPage.css';

const LOCATIONS = ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Balcony', 'Garden', 'Bathroom', 'Other'];

const EMPTY = {
  name: '',
  species: '',
  location: '',
  wateringFrequencyDays: '7',
  notes: '',
};

function AddPlantPage() {
  const navigate = useNavigate();
  const session  = getSession();

  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [serverErr,  setServerErr]  = useState('');
  const [imageFile,  setImageFile]  = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [aiResult,   setAiResult]   = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
    setServerErr('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleIdentify = async () => {
    if (!imageFile) return;
    setIdentifying(true);
    setAiResult(null);
    try {
      const result = await identifyPlant(imageFile);
      setAiResult(result);
      setForm((f) => ({
        ...f,
        species: result.identification.species,
        wateringFrequencyDays: String(result.identification.wateringFrequencyDays),
        name: f.name || result.identification.commonName,
      }));
    } catch (err) {
      setServerErr('AI identification failed: ' + err.message);
    } finally {
      setIdentifying(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name     = 'Plant name is required.';
    if (!form.species.trim()) errs.species  = 'Species is required.';
    if (!form.location)       errs.location = 'Please select a location.';
    const freq = Number(form.wateringFrequencyDays);
    if (!freq || freq < 1 || freq > 365)
      errs.wateringFrequencyDays = 'Enter a value between 1 and 365.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await createPlant({
        userId: session?.userId,
        name:   form.name.trim(),
        species: form.species.trim(),
        location: form.location,
        wateringFrequencyDays: Number(form.wateringFrequencyDays),
        notes: form.notes.trim(),
      });
      navigate('/');
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <button className="btn-back" onClick={() => navigate('/')}>← Back to Dashboard</button>

        <h1 className="page-title">🌱 Add New Plant</h1>
        <p className="page-subtitle">Manually fill in your plant's details, or upload a photo for AI identification.</p>

        {/* AI identification section */}
        <div className="ai-section">
          <h2 className="ai-section-title">🤖 AI Species Identification <span className="ai-badge">Optional</span></h2>
          <p className="ai-section-desc">Upload a photo and let the AI identify the species and suggest a watering schedule.</p>
          <div className="ai-upload-row">
            <input
              type="file"
              id="plantImage"
              accept="image/*"
              onChange={handleImageChange}
              className="ai-file-input"
            />
            <label htmlFor="plantImage" className="btn-upload">
              📷 {imageFile ? imageFile.name : 'Choose Photo'}
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!imageFile || identifying}
              onClick={handleIdentify}
            >
              {identifying ? 'Identifying…' : 'Identify Plant'}
            </button>
          </div>
          {aiResult && (
            <div className="ai-result">
              <strong>AI Result:</strong> {aiResult.identification.commonName} ({aiResult.identification.species})
              — Confidence: {Math.round(aiResult.identification.confidence * 100)}%
              <br />
              <span className="ai-care-hint">{aiResult.identification.careInstructions}</span>
            </div>
          )}
        </div>

        {/* Manual form */}
        <div className="settings-card">
          <form onSubmit={handleSubmit} noValidate>
            {serverErr && <div className="alert alert-error">{serverErr}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Plant Name *</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="e.g. My Monstera"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="species">Species *</label>
                <input
                  id="species" name="species" type="text"
                  placeholder="e.g. Monstera deliciosa"
                  value={form.species} onChange={handleChange}
                  className={errors.species ? 'input-error' : ''}
                />
                {errors.species && <span className="field-error">{errors.species}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <select
                  id="location" name="location"
                  value={form.location} onChange={handleChange}
                  className={errors.location ? 'input-error' : ''}
                >
                  <option value="">— Select location —</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="wateringFrequencyDays">Watering Frequency (days) *</label>
                <input
                  id="wateringFrequencyDays" name="wateringFrequencyDays" type="number"
                  min="1" max="365"
                  value={form.wateringFrequencyDays} onChange={handleChange}
                  className={errors.wateringFrequencyDays ? 'input-error' : ''}
                />
                {errors.wateringFrequencyDays && <span className="field-error">{errors.wateringFrequencyDays}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes" name="notes" rows={3}
                placeholder="Any extra care tips or observations…"
                value={form.notes} onChange={handleChange}
              />
            </div>

            <div className="settings-footer">
              <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Adding…' : '+ Add Plant'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AddPlantPage;
