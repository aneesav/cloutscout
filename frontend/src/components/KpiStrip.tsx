import type { DashboardKpis } from '../types';

interface Props {
  kpis: DashboardKpis;
}

export default function KpiStrip({ kpis }: Props) {
  function formatReach(n: number) {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  }

  const tiles = [
    { label: 'Creators Tracked', value: kpis.creators_tracked.toLocaleString() },
    { label: 'Videos Analyzed', value: kpis.videos_analyzed.toLocaleString() },
    { label: 'Total Reach', value: formatReach(kpis.total_reach) },
    { label: 'Avg Engagement Rate', value: `${(kpis.aggregate_engagement_rate * 100).toFixed(2)}%` },
    { label: 'Verified Creators', value: `${(kpis.pct_verified * 100).toFixed(0)}%` },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
      {tiles.map((t) => (
        <div
          key={t.label}
          style={{
            background: '#1a1d2e',
            border: '1px solid #2d3150',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {t.label}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}
