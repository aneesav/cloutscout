import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import QA from './pages/QA';

type Page = 'dashboard' | 'qa';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      <nav style={{
        background: '#1a1d2e',
        borderBottom: '1px solid #2d3150',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        height: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '16px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#e2e8f0', letterSpacing: '-0.3px' }}>
            Clout Scout
          </span>
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
        color: active ? '#818cf8' : '#94a3b8',
        borderBottom: active ? '2px solid #818cf8' : '2px solid transparent',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  );
}
