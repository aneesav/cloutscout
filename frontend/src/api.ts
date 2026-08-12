import type { DashboardSummary, QAResponse } from './types';

export async function fetchDashboard(): Promise<DashboardSummary> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function askQuestion(question: string): Promise<QAResponse> {
  const res = await fetch('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Q&A failed: ${res.status}`);
  }
  return res.json();
}
