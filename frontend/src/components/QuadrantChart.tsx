import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { QuadrantPoint } from '../types';

interface Props {
  points: QuadrantPoint[];
}

const QUADRANT_COLORS: Record<string, string> = {
  priority_partnerships: '#34d399',
  rising_talent: '#818cf8',
  reach_without_traction: '#f59e0b',
  not_a_fit: '#475569',
};

const QUADRANT_LABELS: Record<string, string> = {
  priority_partnerships: 'Priority partnerships',
  rising_talent: 'Rising talent',
  reach_without_traction: 'Reach without traction',
  not_a_fit: 'Not a fit',
};

interface ChartPoint extends QuadrantPoint {
  log_reach: number;
  er_pct: number;
}

export default function QuadrantChart({ points }: Props) {
  const data: ChartPoint[] = points.map((p) => ({
    ...p,
    log_reach: Math.log10(p.reach),
    er_pct: p.engagement_rate * 100,
  }));

  const reaches = data.map((d) => d.log_reach);
  const ers = data.map((d) => d.er_pct);
  const medLogReach = median(reaches);
  const medEr = median(ers);

  function renderTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div style={{ background: '#1a1d2e', border: '1px solid #2d3150', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
        <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>@{p.author_name}</div>
        <div style={{ color: '#94a3b8' }}>Engagement: {(p.engagement_rate * 100).toFixed(2)}%</div>
        <div style={{ color: '#94a3b8' }}>Reach: {formatReach(p.reach)}</div>
        <div style={{ color: '#94a3b8' }}>Videos: {p.video_count}</div>
        <div style={{ marginTop: '4px', color: QUADRANT_COLORS[p.quadrant] ?? '#94a3b8' }}>
          {QUADRANT_LABELS[p.quadrant] ?? p.quadrant}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1a1d2e', border: '1px solid #2d3150', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>Creator Quadrant</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Engagement rate vs. reach (log scale)</div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {Object.entries(QUADRANT_LABELS).map(([k, label]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: QUADRANT_COLORS[k] }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <XAxis
            dataKey="log_reach"
            type="number"
            name="Reach (log)"
            domain={['auto', 'auto']}
            tick={{ fill: '#475569', fontSize: 11 }}
            tickFormatter={(v) => formatReach(Math.pow(10, v))}
            label={{ value: 'Reach →', position: 'insideBottom', offset: -4, fill: '#475569', fontSize: 11 }}
          />
          <YAxis
            dataKey="er_pct"
            type="number"
            name="Engagement %"
            domain={['auto', 'auto']}
            tick={{ fill: '#475569', fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            width={45}
          />
          <Tooltip content={renderTooltip as never} />
          <ReferenceLine x={medLogReach} stroke="#2d3150" strokeDasharray="4 4" />
          <ReferenceLine y={medEr} stroke="#2d3150" strokeDasharray="4 4" />
          <Scatter data={data} name="creators">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={QUADRANT_COLORS[entry.quadrant] ?? '#94a3b8'}
                fillOpacity={0.75}
                r={Math.min(3 + entry.video_count * 0.8, 8)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
        Dot size = video count · Dashed lines = median
      </div>
    </div>
  );
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatReach(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}
