import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { useAuth } from './lib/auth';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { QueuePage } from './pages/QueuePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { VisitsPage } from './pages/VisitsPage';

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(username, password);
    } catch {
      setError('Login failed. Check your clinic admin username and password.');
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Clinic Access</p>
        <h1>Patient CRM admin</h1>
        <p className="login-copy">
          Sign in to manage follow-ups, visits, and WhatsApp reminder queues.
        </p>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit">
          Sign in
        </button>
        {error ? <p className="empty-state">{error}</p> : null}
      </form>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <div className="login-screen">Loading clinic workspace...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/visits" element={<VisitsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Shell>
  );
}
