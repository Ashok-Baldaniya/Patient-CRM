import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Summary = {
  dueToday: number;
  overdue: number;
  sentToday: number;
  revisitsToday: number;
};

const emptySummary: Summary = {
  dueToday: 0,
  overdue: 0,
  sentToday: 0,
  revisitsToday: 0,
};

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('Connect the backend to see today’s follow-up summary.'));
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Today’s clinic snapshot</h2>
        </div>
      </div>
      {error ? <p className="empty-state">{error}</p> : null}
      <div className="stats-grid">
        <article className="stat-card">
          <span>Due today</span>
          <strong>{summary.dueToday}</strong>
        </article>
        <article className="stat-card">
          <span>Overdue</span>
          <strong>{summary.overdue}</strong>
        </article>
        <article className="stat-card">
          <span>Sent today</span>
          <strong>{summary.sentToday}</strong>
        </article>
        <article className="stat-card">
          <span>Visits today</span>
          <strong>{summary.revisitsToday}</strong>
        </article>
      </div>
      <article className="panel">
        <h3>Reminder rule</h3>
        <p>
          Each visit creates a new follow-up cycle. Reminder time is scheduled for{' '}
          <strong>9:00 AM IST on the previous day</strong>, and any older active reminder is
          cancelled when a new visit is saved.
        </p>
      </article>
    </section>
  );
}
