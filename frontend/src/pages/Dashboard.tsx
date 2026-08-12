import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';
import type { DashboardSummary } from '../types';
import KpiStrip from '../components/KpiStrip';
import ShortlistTable from '../components/ShortlistTable';
import QuadrantChart from '../components/QuadrantChart';
import Callouts from '../components/Callouts';

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!data) return null;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          Creator Talent Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          {data.kpis.date_range_start} – {data.kpis.date_range_end} · TikTok snapshot
        </p>
      </div>

      <KpiStrip kpis={data.kpis} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <ShortlistTable creators={data.shortlist} />
        <QuadrantChart points={data.quadrant_chart} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <Callouts items={data.callouts} />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b', fontSize: '15px' }}>
      Loading dashboard…
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '10px', padding: '24px', maxWidth: '480px' }}>
        <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>Failed to load dashboard</div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>{message}</div>
      </div>
    </div>
  );
}
