interface Props {
  items: string[];
}

const ICONS = ['🏆', '🔄', '📊', '🌱', '⚠️'];

export default function Callouts({ items }: Props) {
  return (
    <div style={{ background: '#1a1d2e', border: '1px solid #2d3150', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>
        Key Callouts
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              background: '#151824',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{ICONS[i] ?? '•'}</span>
            <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{item}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: '13px', color: '#475569' }}>No callouts available.</p>
        )}
      </div>
    </div>
  );
}
