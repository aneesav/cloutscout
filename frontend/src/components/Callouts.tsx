interface Props {
  items: string[];
}

export default function Callouts({ items }: Props) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
        Key Callouts
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{item}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>No callouts available.</p>
        )}
      </div>
    </div>
  );
}
