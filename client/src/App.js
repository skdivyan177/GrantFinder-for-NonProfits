import React, { useState } from 'react';
import OrgForm from './components/OrgForm';
import Results from './components/Results';
import styles from './App.module.css';
import grants from './grants.json';

const STATES = { FORM: 'form', LOADING: 'loading', RESULTS: 'results', ERROR: 'error' };

export default function App() {
  const [state, setState] = useState(STATES.FORM);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  async function handleSubmit(orgProfile) {
    setState(STATES.LOADING);
    setError('');
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgProfile, grants }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results);
      setState(STATES.RESULTS);
    } catch (err) {
      setError(err.message);
      setState(STATES.ERROR);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>Grant Finder</span>
        </div>
        <p className={styles.tagline}>AI-powered grant matching for small nonprofits</p>
      </header>

      <main className={styles.main}>
        {(state === STATES.FORM || state === STATES.ERROR || state === STATES.LOADING) && (
          <div className={styles.formWrap}>
            <div className={styles.formHeader}>
              <h2>Tell us about your organization</h2>
              <p>
                We'll analyze {grants.length} funding opportunities and surface the best matches,
                with tailored reasoning and draft LOI language for your top results.
              </p>
            </div>
            <OrgForm onSubmit={handleSubmit} loading={state === STATES.LOADING} />
            {state === STATES.ERROR && (
              <div className={styles.errorBox}>
                <strong>Something went wrong:</strong> {error}
              </div>
            )}
            {state === STATES.LOADING && (
              <div className={styles.loadingNote}>
                Claude is reading each grant's eligibility criteria and scoring fit against your
                profile. This takes 15–30 seconds.
              </div>
            )}
          </div>
        )}

        {state === STATES.RESULTS && (
          <Results
            results={results}
            grants={grants}
            onReset={() => setState(STATES.FORM)}
          />
        )}
      </main>

      <footer className={styles.footer}>
        Grant data is curated and updated manually. Always verify eligibility before applying.
      </footer>
    </div>
  );
}
