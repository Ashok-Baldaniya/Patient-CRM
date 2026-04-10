import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Template = {
  _id: string;
  name: string;
  language: string;
  content: string;
  isDefault: boolean;
};

const initialForm = {
  name: '',
  language: 'English',
  content:
    'Hello {{patientName}}, this is a reminder from {{clinicName}}. Your follow-up is due on {{dueDate}}.',
  isDefault: true,
};

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTemplates = () => {
    api
      .getTemplates()
      .then((data) => setTemplates(data as Template[]))
      .catch(() => setError('Templates will load when the backend is running.'));
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await api.createTemplate(form);
      setForm(initialForm);
      setMessage('Template saved. New visits can now use it.');
      loadTemplates();
    } catch {
      setError('Could not save the template.');
    }
  };

  const makeDefault = async (template: Template) => {
    setError(null);
    setMessage(null);

    try {
      await api.updateTemplate(template._id, {
        isDefault: true,
      });
      setMessage(`"${template.name}" is now the default reminder template.`);
      loadTemplates();
    } catch {
      setError('Could not update the default template.');
    }
  };

  return (
    <section className="page page-grid">
      <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Templates</p>
            <h2>Create reminder template</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Template name
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Default English reminder"
            />
          </label>
          <label>
            Language
            <input
              required
              value={form.language}
              onChange={(event) => setForm({ ...form, language: event.target.value })}
              placeholder="English"
            />
          </label>
          <label className="full-span">
            Template content
            <textarea
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              checked={form.isDefault}
              type="checkbox"
              onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
            />
            Set as default
          </label>
          <button className="primary-button" type="submit">
            Save template
          </button>
        </form>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="empty-state">{error}</p> : null}
        <article className="hint-card">
          <h3>Available variables</h3>
          <p>
            Use <code>{'{{patientName}}'}</code>, <code>{'{{clinicName}}'}</code>,{' '}
            <code>{'{{dueDate}}'}</code>, <code>{'{{visitDate}}'}</code>,{' '}
            <code>{'{{followUpDays}}'}</code>, and <code>{'{{patientPhone}}'}</code>.
          </p>
        </article>
      </article>

      <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Saved</p>
            <h2>Template library</h2>
          </div>
        </div>
        <div className="stack">
          {templates.length === 0 ? (
            <p className="empty-state">No templates yet. Create one to personalize reminders.</p>
          ) : (
            templates.map((template) => (
              <article className="template-card" key={template._id}>
                <div className="queue-head">
                  <div>
                    <h3>{template.name}</h3>
                    <p>
                      {template.language}
                      {template.isDefault ? ' • Default' : ''}
                    </p>
                  </div>
                  {!template.isDefault ? (
                    <button
                      className="secondary-button"
                      onClick={() => makeDefault(template)}
                      type="button"
                    >
                      Make default
                    </button>
                  ) : (
                    <span className="status-pill sent">default</span>
                  )}
                </div>
                <p className="template-preview">{template.content}</p>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
