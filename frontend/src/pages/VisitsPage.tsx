import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type PatientOption = {
  _id: string;
  fullName: string;
  mobile: string;
  ageLabel?: string;
};

type TemplateOption = {
  _id: string;
  name: string;
  language: string;
  isDefault: boolean;
};

const nowAsLocalInput = new Date().toISOString().slice(0, 16);

const initialQuickPatientForm = {
  fullName: '',
  mobile: '',
  ageLabel: '',
  notes: '',
};

function getPatientLabel(patient: PatientOption) {
  return `${patient.fullName} (${patient.mobile})`;
}

export function VisitsPage() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientPickerOpen, setIsPatientPickerOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickPatientForm, setQuickPatientForm] = useState(initialQuickPatientForm);
  const [form, setForm] = useState({
    patientId: '',
    visitAt: nowAsLocalInput,
    followUpDays: '7',
    messageTemplateId: '',
    notes: '',
  });

  const loadPatients = () => {
    api
      .getPatients()
      .then((data) => setPatients(data as PatientOption[]))
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Add or load patients before creating visits.',
        ),
      );
  };

  useEffect(() => {
    loadPatients();

    api
      .getTemplates()
      .then((data) => {
        const templateList = data as TemplateOption[];
        setTemplates(templateList);
        const defaultTemplate = templateList.find((item) => item.isDefault);

        if (defaultTemplate) {
          setForm((current) => ({
            ...current,
            messageTemplateId: defaultTemplate._id,
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const name = patient.fullName.toLowerCase();
      const mobile = patient.mobile.toLowerCase();

      return name.includes(query) || mobile.includes(query);
    });
  }, [patients, patientSearch]);

  const selectedPatient = patients.find((patient) => patient._id === form.patientId);

  const selectPatient = (patient: PatientOption) => {
    setForm((current) => ({
      ...current,
      patientId: patient._id,
    }));
    setPatientSearch(getPatientLabel(patient));
    setIsPatientPickerOpen(false);
  };

  const handleQuickAddPatient = async () => {
    setError(null);
    setMessage(null);

    try {
      const createdPatient = (await api.createPatient({
        ...quickPatientForm,
        isActive: true,
      })) as PatientOption;

      setQuickPatientForm(initialQuickPatientForm);
      setShowQuickAdd(false);
      selectPatient(createdPatient);
      setMessage('Patient created and selected for this visit.');
      loadPatients();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Could not create the patient.',
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const parsedVisitDate = new Date(form.visitAt);

      if (Number.isNaN(parsedVisitDate.getTime())) {
        throw new Error('Please select a valid visit date and time.');
      }

      await api.createVisit({
        ...form,
        followUpDays: Number(form.followUpDays),
        visitAt: parsedVisitDate.toISOString(),
        messageTemplateId: form.messageTemplateId || undefined,
      });
      setMessage('Visit saved and the next reminder cycle has been created.');
      setForm((current) => ({
        ...current,
        notes: '',
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not save the visit. Please try again.',
      );
    }
  };

  return (
    <section className="page page-grid">
      <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Visits</p>
            <h2>Create a follow-up cycle</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="full-span">
            <label className="search-label">Patient</label>
            <div className="patient-picker">
              <div className="patient-picker-control">
                <input
                  className="patient-picker-input"
                  onBlur={() => {
                    window.setTimeout(() => setIsPatientPickerOpen(false), 120);
                  }}
                  onChange={(event) => {
                    setPatientSearch(event.target.value);
                    setIsPatientPickerOpen(true);
                    setForm((current) => ({
                      ...current,
                      patientId: '',
                    }));
                  }}
                  onFocus={() => setIsPatientPickerOpen(true)}
                  placeholder="Search and select patient by name or mobile number"
                  value={patientSearch}
                />
                <button
                  aria-label="Toggle patient list"
                  className="patient-picker-toggle"
                  onClick={() => setIsPatientPickerOpen((current) => !current)}
                  type="button"
                >
                  ▾
                </button>
              </div>
              {isPatientPickerOpen ? (
                <div className="patient-picker-menu">
                  {filteredPatients.length === 0 ? (
                    <div className="patient-picker-empty">No matching patient found.</div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button
                        className={
                          patient._id === form.patientId
                            ? 'patient-picker-option active'
                            : 'patient-picker-option'
                        }
                        key={patient._id}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          selectPatient(patient);
                        }}
                        type="button"
                      >
                        <strong>{patient.fullName}</strong>
                        <span>{patient.mobile}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <input className="visually-hidden" readOnly required value={form.patientId} />
          </div>
          <div className="full-span quick-actions">
            <button
              className="secondary-button"
              onClick={() => setShowQuickAdd((current) => !current)}
              type="button"
            >
              {showQuickAdd ? 'Close quick add' : 'Add patient from here'}
            </button>
            {selectedPatient ? (
              <p className="success-state">
                Selected: {getPatientLabel(selectedPatient)}
              </p>
            ) : (
              <p className="empty-state">Open the patient field and choose a patient there.</p>
            )}
          </div>

          {showQuickAdd ? (
            <section className="full-span sub-panel">
              <div className="page-header">
                <div>
                  <p className="eyebrow">Quick Add</p>
                  <h3>Create a patient without leaving this page</h3>
                </div>
              </div>
              <div className="divider" />
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    required
                    value={quickPatientForm.fullName}
                    onChange={(event) =>
                      setQuickPatientForm({ ...quickPatientForm, fullName: event.target.value })
                    }
                    placeholder="Patient full name"
                  />
                </label>
                <label>
                  Mobile
                  <input
                    required
                    value={quickPatientForm.mobile}
                    onChange={(event) =>
                      setQuickPatientForm({ ...quickPatientForm, mobile: event.target.value })
                    }
                    placeholder="9876543210"
                  />
                </label>
                <label>
                  Age label
                  <input
                    value={quickPatientForm.ageLabel}
                    onChange={(event) =>
                      setQuickPatientForm({ ...quickPatientForm, ageLabel: event.target.value })
                    }
                    placeholder="32 years"
                  />
                </label>
                <label className="full-span">
                  Notes
                  <textarea
                    value={quickPatientForm.notes}
                    onChange={(event) =>
                      setQuickPatientForm({ ...quickPatientForm, notes: event.target.value })
                    }
                    placeholder="Condition or quick notes"
                  />
                </label>
                <button className="primary-button" onClick={handleQuickAddPatient} type="button">
                  Save and select patient
                </button>
              </div>
            </section>
          ) : null}

          <label>
            Visit date and time
            <input
              required
              type="datetime-local"
              value={form.visitAt}
              onChange={(event) => setForm({ ...form, visitAt: event.target.value })}
            />
          </label>
          <label>
            Follow-up days
            <select
              value={form.followUpDays}
              onChange={(event) => setForm({ ...form, followUpDays: event.target.value })}
            >
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
            </select>
          </label>
          <label>
            Reminder template
            <select
              value={form.messageTemplateId}
              onChange={(event) => setForm({ ...form, messageTemplateId: event.target.value })}
            >
              <option value="">Use built-in default</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} ({template.language}){template.isDefault ? ' - default' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="full-span">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Visit notes or patient condition"
            />
          </label>
          <button className="primary-button" type="submit">
            Save visit
          </button>
        </form>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="empty-state">{error}</p> : null}
        <p className="empty-state">
          The message snapshot is frozen when the visit is saved, so later template edits do not
          change old follow-up reminders.
        </p>
      </article>

      <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Selection Help</p>
            <h2>Patient picker guide</h2>
          </div>
        </div>
        <div className="stack">
          <article className="history-card">
            <strong>Search before selecting</strong>
            <p>
              Click into the patient field, type there, and choose the matching patient from the
              same dropdown list.
            </p>
          </article>
          <article className="history-card">
            <strong>Quick-add on the same page</strong>
            <p>
              If it is a first visit, use the quick-add section and the new patient will be
              auto-selected.
            </p>
          </article>
          <article className="history-card">
            <strong>Current patient</strong>
            <p>
              {selectedPatient ? getPatientLabel(selectedPatient) : 'No patient selected yet.'}
            </p>
          </article>
        </div>
      </article>
    </section>
  );
}
