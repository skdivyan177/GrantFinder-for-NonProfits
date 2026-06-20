import React, { useState } from 'react';
import styles from './OrgForm.module.css';

const BUDGET_OPTIONS = [
  'Under $250K',
  '$250K – $500K',
  '$500K – $1M',
  '$1M – $3M',
  '$3M – $10M',
  'Over $10M',
];

const EMPTY = {
  mission: '',
  location: '',
  budget: '',
  programArea: '',
  populations: '',
};

export default function OrgForm({ onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.mission.trim()) e.mission = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.budget) e.budget = 'Required';
    if (!form.programArea.trim()) e.programArea = 'Required';
    if (!form.populations.trim()) e.populations = 'Required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit(form);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="mission">Mission Statement</label>
        <textarea
          id="mission"
          name="mission"
          rows={4}
          placeholder="Describe your organization's mission and primary work in 2-4 sentences."
          value={form.mission}
          onChange={handleChange}
          className={errors.mission ? styles.invalid : ''}
        />
        {errors.mission && <span className={styles.error}>{errors.mission}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="location">Location (City, State)</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Richmond, VA"
            value={form.location}
            onChange={handleChange}
            className={errors.location ? styles.invalid : ''}
          />
          {errors.location && <span className={styles.error}>{errors.location}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="budget">Annual Budget</label>
          <select
            id="budget"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className={errors.budget ? styles.invalid : ''}
          >
            <option value="">Select range…</option>
            {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.budget && <span className={styles.error}>{errors.budget}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="programArea">Primary Program Area</label>
        <input
          id="programArea"
          name="programArea"
          type="text"
          placeholder="e.g. food security, workforce development, youth mentorship"
          value={form.programArea}
          onChange={handleChange}
          className={errors.programArea ? styles.invalid : ''}
        />
        {errors.programArea && <span className={styles.error}>{errors.programArea}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="populations">Populations Served</label>
        <input
          id="populations"
          name="populations"
          type="text"
          placeholder="e.g. low-income families, returning citizens, rural communities"
          value={form.populations}
          onChange={handleChange}
          className={errors.populations ? styles.invalid : ''}
        />
        {errors.populations && <span className={styles.error}>{errors.populations}</span>}
      </div>

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Analyzing grants…' : 'Find Matching Grants'}
      </button>
    </form>
  );
}
