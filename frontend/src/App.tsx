import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
import { TableSkeleton } from './components/ui/LoadingSkeleton';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AnalyzeTransaction = lazy(() => import('./pages/AnalyzeTransaction'));
const UploadDataset = lazy(() => import('./pages/UploadDataset'));
const CaseManagement = lazy(() => import('./pages/CaseManagement').then(m => ({ default: m.CaseManagement })));
const RulesEngine = lazy(() => import('./pages/RulesEngine').then(m => ({ default: m.RulesEngine })));
const FraudAnalytics = lazy(() => import('./pages/FraudAnalytics'));
const TransactionExplorer = lazy(() => import('./pages/TransactionExplorer'));
const RiskMonitoring = lazy(() => import('./pages/RiskMonitoring'));
const ModelPerformance = lazy(() => import('./pages/ModelPerformance'));
const ExplainableAI = lazy(() => import('./pages/ExplainableAI'));
const Reports = lazy(() => import('./pages/Reports'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));

function PageLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-8 w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyze" element={<AnalyzeTransaction />} />
              <Route path="/upload" element={<UploadDataset />} />
              <Route path="/cases" element={<CaseManagement />} />
              <Route path="/rules" element={<RulesEngine />} />
              <Route path="/fraud-analytics" element={<FraudAnalytics />} />
              <Route path="/transactions" element={<TransactionExplorer />} />
              <Route path="/risk-monitoring" element={<RiskMonitoring />} />
              <Route path="/model-performance" element={<ModelPerformance />} />
              <Route path="/explainable-ai" element={<ExplainableAI />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
