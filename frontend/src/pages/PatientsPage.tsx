import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type Patient = {
  _id: string;
  fullName: string;
  mobile: string;
  ageLabel?: string;
  notes?: string;
};

type VisitHistory = {
  _id: string;
  visitAt: string;
  dueAt: string;
  reminderAt: string;
  followUpDays: number;
  notes?: string;
};

type FollowUpHistory = {
  _id: string;
  status: string;
  dueAt: string;
  reminderAt: string;
  sentAt?: string;
  skippedAt?: string;
  cancelledAt?: string;
  messageTextSnapshot?: string;
};

type PatientHistoryResponse = {
  patient: Patient;
  history: {
    visits: VisitHistory[];
    followups: FollowUpHistory[];
  };
};

const initialForm = {
  fullName: '',
  mobile: '',
  ageLabel: '',
  notes: '',
};

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPatients = () => {
    api
      .getPatients()
      .then((data) => setPatients(data as Patient[]))
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Backend unavailable. Patient list will appear once the API is running.',
        ),
      );
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setHistory(null);
      return;
    }

    api
      .getPatientHistory(selectedPatientId)
      .then((data) => setHistory(data as PatientHistoryResponse))
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error ? caughtError.message : 'Could not load patient history.',
        ),
      );
  }, [selectedPatientId]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const name = patient.fullName.toLowerCase();
      const mobile = patient.mobile.toLowerCase();

      return name.includes(query) || mobile.includes(query);
    });
  }, [patients, search]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const createdPatient = (await api.createPatient({
        ...form,
        isActive: true,
      })) as Patient;

      setForm(initialForm);
      setMessage('Patient saved successfully.');
      loadPatients();
      setSelectedPatientId(createdPatient._id);
      setSearch(createdPatient.fullName);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not save the patient. Please verify the backend is running.',
      );
    }
  };

  return (
    <section className="page page-grid">
      <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Patients</p>
            <h2>Add a patient</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Patient full name"
              required
            />
          </label>
          <label>
            Mobile
            <input
              value={form.mobile}
              onChange={(event) => setForm({ ...form, mobile: event.target.value })}
              placeholder="9876543210"
              required
            />
          </label>
          <label>
            Age label
            <input
              value={form.ageLabel}
              onChange={(event) => setForm({ ...form, ageLabel: event.target.value })}
              placeholder="32 years"
            />
          </label>
          <label className="full-span">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Condition, medicine notes, or follow-up context"
            />
          </label>
          <button className="primary-button" type="submit">
            Save patient
          </button>
        </form>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="empty-state">{error}</p> : null}
      </article>

      <div className="stack">
        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Registry</p>
              <h2>Search patients</h2>
            </div>
          </div>
          <label className="search-label">
            Search by patient name or mobile number
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Type name or phone number"
            />
          </label>
          <div className="table-list">
            {filteredPatients.length === 0 ? (
              <p className="empty-state">No patients matched this search.</p>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  className={
                    patient._id === selectedPatientId ? 'table-row patient-row active' : 'table-row patient-row'
                  }
                  key={patient._id}
                  onClick={() => setSelectedPatientId(patient._id)}
                  type="button"
                >
                  <div>
                    <strong>{patient.fullName}</strong>
                    <p>{patient.mobile}</p>
                  </div>
                  <div>
                    <span>{patient.ageLabel ?? 'Age not added'}</span>
                    <p>{patient.notes ?? 'No notes yet'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">History</p>
              <h2>{history?.patient.fullName ?? 'Select a patient to view history'}</h2>
            </div>
          </div>
          {!history ? (
            <p className="empty-state">
              Patient visit history and reminder activity will appear here.
            </p>
          ) : (
            <div className="history-grid">
              <section className="history-section">
                <h3>Visit history</h3>
                <div className="stack">
                  {history.history.visits.length === 0 ? (
                    <p className="empty-state">No visits recorded yet.</p>
                  ) : (
                    history.history.visits.map((visit) => (
                      <article className="history-card" key={visit._id}>
                        <strong>{formatDateTime(visit.visitAt)}</strong>
                        <p>Follow-up after {visit.followUpDays} days</p>
                        <p>Due: {formatDateTime(visit.dueAt)}</p>
                        <p>Reminder: {formatDateTime(visit.reminderAt)}</p>
                        <p>{visit.notes ?? 'No visit notes'}</p>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="history-section">
                <h3>Reminder history</h3>
                <div className="stack">
                  {history.history.followups.length === 0 ? (
                    <p className="empty-state">No reminders recorded yet.</p>
                  ) : (
                    history.history.followups.map((followup) => (
                      <article className="history-card" key={followup._id}>
                        <div className="queue-head">
                          <strong>{formatDateTime(followup.reminderAt)}</strong>
                          <span className={`status-pill ${followup.status}`}>{followup.status}</span>
                        </div>
                        <p>Due: {formatDateTime(followup.dueAt)}</p>
                        <p>{followup.messageTextSnapshot ?? 'No message snapshot saved.'}</p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
