export interface CreatorMetrics {
  author_name: string;
  potential_score: number;
  engagement_rate: number;
  reach: number;
  video_count: number;
  verified: boolean;
  low_confidence: boolean;
  quadrant: string;
}

export interface DashboardKpis {
  creators_tracked: number;
  videos_analyzed: number;
  total_reach: number;
  aggregate_engagement_rate: number;
  pct_verified: number;
  date_range_start: string;
  date_range_end: string;
}

export interface QuadrantPoint {
  author_name: string;
  reach: number;
  engagement_rate: number;
  video_count: number;
  verified: boolean;
  quadrant: string;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  shortlist: CreatorMetrics[];
  quadrant_chart: QuadrantPoint[];
  callouts: string[];
}

export interface QAResponse {
  answer: string;
  table: Record<string, unknown>[];
  low_confidence_note: boolean;
}
