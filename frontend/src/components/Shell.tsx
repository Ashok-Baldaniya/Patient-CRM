import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/patients', label: 'Patients' },
  { to: '/queue', label: 'Reminder Queue' },
  { to: '/visits', label: 'Add Visit' },
  { to: '/templates', label: 'Templates' },
];

export function Shell({ children }: PropsWithChildren) {
  const { logout, user } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Patient CRM</p>
          <h1>Clinic follow-up desk</h1>
          <p className="sidebar-copy">
            Zero-cost reminder workflow with a queue built for WhatsApp follow-ups.
          </p>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-user">Signed in as {user?.username ?? 'admin'}</p>
          <button className="ghost-button sidebar-logout" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
