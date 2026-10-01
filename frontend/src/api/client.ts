import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface Transaction {
  step: number;
  type: string;
  amount: number;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  oldbalanceDest: number;
  newbalanceDest: number;
}

export interface ShapExplanation {
  feature: string;
  feature_label: string;
  value: number;
  shap_value: number;
  contribution_percentage: number;
  impact: 'INCREASES_RISK' | 'DECREASES_RISK' | 'NEUTRAL';
}

export interface RuleTrigger {
  rule_id: string;
  rule_name: string;
  action: 'BLOCK' | 'MANUAL_REVIEW' | 'CHALLENGE' | 'ALLOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface PredictionResult {
  prediction: string;
  fraud_probability: number;
  risk_score: number;
  risk_level: string;
  transaction_type: string;
  amount: number;
  decision?: 'BLOCK' | 'MANUAL_REVIEW' | 'CHALLENGE' | 'ALLOW';
  decision_reason?: string;
  requires_analyst_review?: boolean;
  requires_stepup_auth?: boolean;
  triggered_rules?: RuleTrigger[];
  explanation: Array<{ feature: string; value: string; direction: string; description: string }>;
  shap_explanations?: ShapExplanation[];
  recommended_action: string;
  model_name: string;
  model_version: string;
  training_date: string;
  prediction_timestamp: string;
  case_number?: string;
}

export interface CaseItem {
  id: number;
  case_number: string;
  transaction_id: string;
  step: number;
  tx_type: string;
  amount: number;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  oldbalanceDest: number;
  newbalanceDest: number;
  fraud_probability: number;
  risk_score: number;
  risk_level: string;
  recommendation: string;
  decision: 'BLOCK' | 'MANUAL_REVIEW' | 'CHALLENGE' | 'ALLOW';
  decision_reason: string;
  triggered_rules: RuleTrigger[];
  status: 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'RESOLVED_LEGITIMATE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assigned_to: string;
  analyst_notes: string;
  analyst_verdict: string;
  created_at: string;
  updated_at: string;
}

export interface QueueMetrics {
  total_cases: number;
  pending_review: number;
  under_investigation: number;
  confirmed_fraud: number;
  false_positives: number;
  critical_priority: number;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  action: 'BLOCK' | 'MANUAL_REVIEW' | 'CHALLENGE' | 'ALLOW';
  enabled: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  model_version: string | null;
  api_version: string;
  uptime_since: string;
  model_latency_ms: number;
  services: Record<string, string>;
}

export interface ModelSummary {
  model_name: string;
  model_version: string;
  training_date: string | null;
  status: string;
  metrics: Record<string, number>;
  dataset_rows: number | null;
  fraud_count: number | null;
  fraud_rate: number | null;
}

export interface AnalyticsOverview {
  dataset_rows: number;
  fraud_count: number;
  fraud_rate: number;
  avg_amount: number;
  type_stats: Record<string, {
    count: number;
    fraud_count: number;
    fraud_rate: number;
    avg_amount: number;
  }>;
  fraud_trend: Array<{ step_bucket: number; total: number; fraud: number; fraud_rate: number }>;
  selected_model: string;
  model_display_name: string;
  metrics: Record<string, number>;
}

// API Functions
export const predictTransaction = (data: Transaction) =>
  api.post<PredictionResult>('/predict', data).then((r) => r.data);

export const getHealth = () =>
  api.get<HealthStatus>('/health').then((r) => r.data);

export const getModelSummary = () =>
  api.get<ModelSummary>('/model-info/summary').then((r) => r.data);

export const getModelInfo = () =>
  api.get('/model-info').then((r) => r.data);

export const getAnalyticsOverview = () =>
  api.get<AnalyticsOverview>('/analytics/overview').then((r) => r.data);

export const getFeatureImportance = () =>
  api.get('/analytics/feature-importance').then((r) => r.data);

export const getConfusionMatrix = () =>
  api.get('/analytics/confusion-matrix').then((r) => r.data);

export const getRocCurve = () =>
  api.get('/analytics/roc-curve').then((r) => r.data);

export const getPrCurve = () =>
  api.get('/analytics/pr-curve').then((r) => r.data);

export const analyzeDataset = (file: File, columnMapping?: Record<string, string>) => {
  const form = new FormData();
  form.append('file', file);
  form.append('column_mapping', JSON.stringify(columnMapping || {}));
  return api.post('/upload/analyze', form).then((r) => r.data);
};

export const validateDataset = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/validate', form).then((r) => r.data);
};

// Phase 1 Rules Engine & Case Queue API Calls
export const getRules = () =>
  api.get<{ active_rules_count: number; rules: BusinessRule[] }>('/rules').then((r) => r.data);

export const getCaseMetrics = () =>
  api.get<QueueMetrics>('/cases/metrics').then((r) => r.data);

export const getCases = (params?: { status?: string; priority?: string }) =>
  api.get<{ total: number; cases: CaseItem[] }>('/cases', { params }).then((r) => r.data);

export const getCaseDetail = (caseNumber: string) =>
  api.get<CaseItem>(`/cases/${caseNumber}`).then((r) => r.data);

export const updateCase = (
  caseNumber: string,
  payload: { status?: string; assigned_to?: string; analyst_notes?: string; analyst_verdict?: string }
) => api.patch<CaseItem>(`/cases/${caseNumber}`, payload).then((r) => r.data);
