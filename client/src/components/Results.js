import React from 'react';
import GrantCard from './GrantCard';
import styles from './Results.module.css';

export default function Results({ results, grants, onReset }) {
  // results already sorted by fit_score (server sorts them)
  const grantByName = Object.fromEntries(grants.map(g => [g.name, g]));

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <div>
          <h2 className={styles.heading}>Grant Matches</h2>
          <p className={styles.sub}>{results.length} grants analyzed · sorted by fit score</p>
        </div>
        <button className={styles.reset} onClick={onReset}>← New Search</button>
      </div>

      <div className={styles.list}>
        {results.map((r, i) => (
          <GrantCard
            key={r.grant_name}
            result={r}
            grant={grantByName[r.grant_name]}
            rank={i + 1}
          />
        ))}
      </div>
    </section>
  );
}
