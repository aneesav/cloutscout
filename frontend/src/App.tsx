import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import QA from './pages/QA';

type Page = 'dashboard' | 'qa';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        height: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
          <img src="/icon.png" alt="" style={{ height: '30px', display: 'block' }} />
          <img src="/logo.png" alt="CloutScout" style={{ height: '20px', display: 'block' }} />
        </div>
        <NavButton active={page === 'dashboard'} onClick={() => setPage('dashboard')}>
          Dashboard
        </NavButton>
        <NavButton active={page === 'qa'} onClick={() => setPage('qa')}>
          Ask a Question
        </NavButton>
      </nav>

      <main>
        {page === 'dashboard' ? <Dashboard /> : <QA />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 2px',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        color: active ? '#1a3254' : '#64748b',
        borderBottom: active ? '2px solid #1a3254' : '2px solid transparent',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  );
}
