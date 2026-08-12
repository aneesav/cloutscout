interface Props {
  items: string[];
}

export default function Callouts({ items }: Props) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
        Trends
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
            <CalloutText text={item} />
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>No callouts available.</p>
        )}
      </div>
    </div>
  );
}

function CalloutText({ text }: { text: string }) {
  const idx = text.indexOf(': ');
  if (idx === -1) {
    return <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{text}</span>;
  }
  const label = text.slice(0, idx);
  const rest = text.slice(idx + 2);
  return (
    <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
      <span style={{ display: 'block', fontWeight: 700, color: '#1a3254', marginBottom: '2px' }}>{label}</span>
      {rest}
    </span>
  );
}
