import { useState } from 'react';
import { askQuestion } from '../api';
import type { QAResponse } from '../types';

const EXAMPLE_QUESTIONS = [
  'Which creators get the most engagement?',
  'Who has high reach but low engagement?',
  'Show me the top rising talent worth an early bet',
  'Which verified creators have the best potential score?',
  'Who are the top 5 creators overall?',
];

export default function QA() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuestion(trimmed);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await askQuestion(trimmed);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
          Ask a Question
        </h1>
      </div>

      {/* Input */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(question)}
            placeholder="e.g. Which creators get the most engagement?"
            style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
            }}
          />
          <button
            onClick={() => submit(question)}
            disabled={loading || !question.trim()}
            style={{
              background: loading || !question.trim() ? '#e2e8f0' : '#1a3254',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: loading || !question.trim() ? '#94a3b8' : '#fff',
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>

        {/* Example questions */}
        <div style={{ marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '8px' }}>Try:</span>
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '12px',
                color: '#1a3254',
                cursor: 'pointer',
                marginRight: '6px',
                marginTop: '4px',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: '4px' }}>Error</div>
          <div style={{ color: '#64748b', fontSize: '13px' }}>{error}</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
          Consulting the data…
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Answer */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#1a3254', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Answer
            </div>
            <p style={{ fontSize: '15px', color: '#0f172a', lineHeight: '1.6' }}>{result.answer}</p>
            {result.low_confidence_note && (
              <div style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#b45309' }}>
                Note: one or more creators in this result have a small sample size — treat with caution.
              </div>
            )}
          </div>

          {/* Supporting table */}
          {result.table.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Supporting Data
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {Object.keys(result.table[0]).map((col) => (
                        <th key={col} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                          {formatColName(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {Object.entries(row).map(([col, val]) => (
                          <td key={col} style={{ padding: '10px 16px', color: '#334155' }}>
                            {formatCell(col, val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatColName(col: string) {
  return col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(col: string, val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (col === 'engagement_rate' && typeof val === 'number') return `${(val * 100).toFixed(2)}%`;
  if (col === 'potential_score' && typeof val === 'number') return val.toFixed(1);
  if (col === 'reach' && typeof val === 'number') return formatReach(val);
  return String(val);
}

function formatReach(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
