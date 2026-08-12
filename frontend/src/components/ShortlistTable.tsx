import { useState } from 'react';
import type { CreatorMetrics } from '../types';

interface Props {
  creators: CreatorMetrics[];
}

type SortKey = 'potential_score' | 'engagement_rate' | 'reach' | 'video_count';

function formatReach(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ShortlistTable({ creators }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('potential_score');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [hideLC, setHideLC] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...creators]
    .filter((c) => filterVerified === null || c.verified === filterVerified)
    .filter((c) => !hideLC || !c.low_confidence)
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === 'desc' ? -diff : diff;
    });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ' ·';

  return (
    <div style={{ background: '#1a1d2e', border: '1px solid #2d3150', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d3150', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Top Creator Shortlist</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <FilterChip
            active={filterVerified === true}
            onClick={() => setFilterVerified(filterVerified === true ? null : true)}
          >
            ✓ Verified only
          </FilterChip>
          <FilterChip
            active={hideLC}
            onClick={() => setHideLC((v) => !v)}
          >
            Hide low-confidence
          </FilterChip>
        </div>
      </div>

      <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#151824', zIndex: 1 }}>
            <tr>
              <th style={thStyle}>Creator</th>
              <SortTh label="Score" k="potential_score" onClick={() => toggleSort('potential_score')}>
                Score<SortIcon k="potential_score" />
              </SortTh>
              <SortTh label="Engagement" k="engagement_rate" onClick={() => toggleSort('engagement_rate')}>
                Engagement<SortIcon k="engagement_rate" />
              </SortTh>
              <SortTh label="Reach" k="reach" onClick={() => toggleSort('reach')}>
                Reach<SortIcon k="reach" />
              </SortTh>
              <SortTh label="Videos" k="video_count" onClick={() => toggleSort('video_count')}>
                Videos<SortIcon k="video_count" />
              </SortTh>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr
                key={c.author_name}
                style={{
                  borderBottom: '1px solid #1e2235',
                  opacity: c.low_confidence ? 0.6 : 1,
                  background: i % 2 === 0 ? 'transparent' : '#181b2a',
                }}
              >
                <td style={{ padding: '9px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                  <span>@{c.author_name}</span>
                  {c.verified && <span style={{ marginLeft: '5px', color: '#60a5fa', fontSize: '11px' }}>✓</span>}
                  {c.low_confidence && <span style={{ marginLeft: '5px', color: '#f59e0b', fontSize: '10px' }}>~</span>}
                </td>
                <td style={{ padding: '9px 16px', color: '#818cf8', fontWeight: 600 }}>
                  <ScoreBar score={c.potential_score} />
                </td>
                <td style={{ padding: '9px 16px', color: '#34d399' }}>
                  {(c.engagement_rate * 100).toFixed(2)}%
                </td>
                <td style={{ padding: '9px 16px', color: '#94a3b8' }}>{formatReach(c.reach)}</td>
                <td style={{ padding: '9px 16px', color: '#94a3b8' }}>{c.video_count}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                  No creators match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  color: '#475569',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #2d3150',
};

function SortTh({ children, onClick }: { label: string; k: SortKey; children: React.ReactNode; onClick: () => void }) {
  return (
    <th onClick={onClick} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>
      {children}
    </th>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#312e81' : 'none',
        border: `1px solid ${active ? '#4f46e5' : '#2d3150'}`,
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '11px',
        color: active ? '#818cf8' : '#64748b',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '50px', height: '4px', background: '#2d3150', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: '#818cf8', borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '12px' }}>{score.toFixed(0)}</span>
    </div>
  );
}
