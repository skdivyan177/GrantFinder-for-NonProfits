import React, { useState } from 'react';
import styles from './GrantCard.module.css';

function ScoreBadge({ score }) {
  const tier = score >= 8 ? 'high' : score >= 6 ? 'mid' : 'low';
  return (
    <span className={`${styles.badge} ${styles[tier]}`}>
      {score}/10
    </span>
  );
}

export default function GrantCard({ result, grant, rank }) {
  const [open, setOpen] = useState(false);
  const hasDraft = !!result.draft_paragraph;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          {rank <= 3 && <span className={styles.topBadge}>Top Match #{rank}</span>}
          <h3 className={styles.name}>{result.grant_name}</h3>
          {grant && (
            <p className={styles.sub}>
              {grant.funder}
              {grant.amount_range && <> · {grant.amount_range}</>}
              {grant.deadline && <> · Deadline: {grant.deadline}</>}
            </p>
          )}
        </div>
        <ScoreBadge score={result.fit_score} />
      </div>

      <p className={styles.reasoning}>{result.reasoning}</p>

      {hasDraft && (
        <div className={styles.draftSection}>
          <button
            className={styles.toggle}
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
          >
            {open ? 'Hide' : 'Show'} drafted LOI opening paragraph
            <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
          </button>
          {open && (
            <div className={styles.draft}>
              <p>{result.draft_paragraph}</p>
            </div>
          )}
        </div>
      )}

      {grant?.source_link && (
        <a
          className={styles.link}
          href={grant.source_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View grant details →
        </a>
      )}
    </article>
  );
}
