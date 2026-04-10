import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type QueueItem = {
  _id: string;
  status: string;
  followUpDays: number;
  dueAtLabel: string;
  reminderAtLabel: string;
  whatsappUrl: string;
  messageTextSnapshot?: string;
  patientId?: {
    fullName?: string;
    mobile?: string;
  };
};

export function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = () => {
    api
      .getQueue()
      .then((data) => setQueue(data as QueueItem[]))
      .catch(() => setError('Queue will load when the backend and database are running.'));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const openWhatsapp = async (item: QueueItem) => {
    await updateStatus(item._id, 'opened');
    window.open(item.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const updateStatus = async (id: string, action: 'opened' | 'sent' | 'skipped') => {
    if (action === 'opened') {
      await api.markFollowupOpened(id);
    }
    if (action === 'sent') {
      await api.markFollowupSent(id);
    }
    if (action === 'skipped') {
      await api.markFollowupSkipped(id);
    }
    loadQueue();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Queue</p>
          <h2>Reminder helper</h2>
        </div>
      </div>
      {error ? <p className="empty-state">{error}</p> : null}
      <div className="stack">
        {queue.length === 0 ? (
          <article className="panel">
            <p className="empty-state">No due reminders right now.</p>
          </article>
        ) : (
          queue.map((item, index) => (
            <article className="panel queue-card" key={item._id}>
              <div className="queue-head">
                <div>
                  <p className="queue-step">Queue #{index + 1}</p>
                  <h3>{item.patientId?.fullName ?? 'Unknown patient'}</h3>
                  <p>{item.patientId?.mobile ?? 'No mobile number'}</p>
                </div>
                <span className={`status-pill ${item.status}`}>{item.status}</span>
              </div>
              <div className="queue-meta">
                <span>Follow-up after {item.followUpDays} days</span>
                <span>Due: {item.dueAtLabel}</span>
                <span>Reminder: {item.reminderAtLabel}</span>
              </div>
              <p className="template-preview">{item.messageTextSnapshot ?? 'No message preview.'}</p>
              <div className="queue-actions">
                <button
                  className="primary-button"
                  onClick={() => openWhatsapp(item)}
                  type="button"
                >
                  Open WhatsApp
                </button>
                <button className="secondary-button" onClick={() => updateStatus(item._id, 'sent')}>
                  Mark sent
                </button>
                <button className="ghost-button" onClick={() => updateStatus(item._id, 'skipped')}>
                  Skip
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
