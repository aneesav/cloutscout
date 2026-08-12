import type { DashboardKpis } from '../types';

interface Props {
  kpis: DashboardKpis;
}

export default function KpiStrip({ kpis }: Props) {
  const tiles = [
    { label: 'Creators Tracked', value: kpis.creators_tracked.toLocaleString() },
    { label: 'Videos Analyzed', value: kpis.videos_analyzed.toLocaleString() },
    { label: 'Verified Creators', value: `${(kpis.pct_verified * 100).toFixed(0)}%` },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {t.label}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}
