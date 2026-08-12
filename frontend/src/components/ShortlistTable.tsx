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
    sortKey === k ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Top Creator Shortlist</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <FilterChip
            active={filterVerified === true}
            onClick={() => setFilterVerified(filterVerified === true ? null : true)}
          >
            Verified only
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
          <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
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
                  borderBottom: '1px solid #f1f5f9',
                  opacity: c.low_confidence ? 0.55 : 1,
                  background: i % 2 === 0 ? 'transparent' : '#fafbfc',
                }}
              >
                <td style={{ padding: '9px 16px', color: '#0f172a', fontWeight: 500 }}>
                  <span>@{c.author_name}</span>
                  {c.verified && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: '#2563eb', border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '4px', padding: '1px 5px' }}>
                      Verified
                    </span>
                  )}
                  {c.low_confidence && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: '#b45309', border: '1px solid #fde68a', background: '#fffbeb', borderRadius: '4px', padding: '1px 5px' }}>
                      Low sample
                    </span>
                  )}
                </td>
                <td style={{ padding: '9px 16px', color: '#1a3254', fontWeight: 600 }}>
                  <ScoreBar score={c.potential_score} />
                </td>
                <td style={{ padding: '9px 16px', color: '#059669' }}>
                  {(c.engagement_rate * 100).toFixed(2)}%
                </td>
                <td style={{ padding: '9px 16px', color: '#64748b' }}>{formatReach(c.reach)}</td>
                <td style={{ padding: '9px 16px', color: '#64748b' }}>{c.video_count}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
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
  color: '#64748b',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e2e8f0',
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
        background: active ? '#e8edf5' : '#ffffff',
        border: `1px solid ${active ? '#1a3254' : '#e2e8f0'}`,
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '11px',
        color: active ? '#1a3254' : '#64748b',
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
      <div style={{ width: '50px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: '#1a3254', borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '12px' }}>{score.toFixed(0)}</span>
    </div>
  );
}
