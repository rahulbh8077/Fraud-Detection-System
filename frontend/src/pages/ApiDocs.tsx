import React, { useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { Code, Copy, Check, ExternalLink, Server } from 'lucide-react';

export default function ApiDocs() {
  usePageMeta('API Documentation', 'Developer reference for integrating with FraudShield REST endpoints.');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/predict',
      title: 'Analyze Single Transaction',
      description: 'Run real-time ML inference on a single transaction payload.',
      curl: `curl -X POST "http://localhost:8000/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "step": 1,
    "type": "TRANSFER",
    "amount": 150000.0,
    "oldbalanceOrg": 150000.0,
    "newbalanceOrig": 0.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 150000.0
  }'`,
      response: `{
  "prediction": "FRAUDULENT",
  "fraud_probability": 0.9412,
  "risk_score": 94,
  "risk_level": "CRITICAL",
  "explanation": [
    {
      "feature": "Origin Balance Drain",
      "value": "Before: 150,000.00 → After: 0.00",
      "direction": "increases",
      "description": "Origin balance completely drained."
    }
  ],
  "recommended_action": "Immediately flag for manual review."
}`,
    },
    {
      method: 'POST',
      path: '/upload/analyze',
      title: 'Batch Dataset Analysis',
      description: 'Upload a CSV or XLSX dataset file for complete bulk fraud screening.',
      curl: `curl -X POST "http://localhost:8000/upload/analyze" \\
  -F "file=@transactions.csv" \\
  -F 'column_mapping={}'`,
      response: `{
  "filename": "transactions.csv",
  "has_labels": true,
  "analytics": {
    "total": 1000,
    "predicted_fraud": 14,
    "avg_fraud_probability": 0.0142
  }
}`,
    },
    {
      method: 'GET',
      path: '/health',
      title: 'System Telemetry & Health',
      description: 'Check service availability, model loading state, and latency benchmark.',
      curl: `curl -X GET "http://localhost:8000/health"`,
      response: `{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0",
  "api_version": "1.0.0",
  "model_latency_ms": 3.42
}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border-navy-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100">Interactive OpenAPI Specification</h3>
          </div>
          <p className="text-xs text-slate-400">
            Access live Swagger UI documentation, interactive request testing, and schema validation.
          </p>
        </div>
        <a
          href="http://localhost:8000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
        >
          Open Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Endpoint Cards */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="card p-6 space-y-4 border-navy-700">
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                    ep.method === 'POST' ? 'bg-brand-500/20 text-brand-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-200">{ep.path}</span>
              </div>
              <span className="text-xs font-medium text-slate-400">{ep.title}</span>
            </div>

            <p className="text-xs text-slate-300">{ep.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Curl Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Code className="w-3.5 h-3.5" /> cURL Example
                  </span>
                  <button
                    onClick={() => handleCopy(ep.curl, idx * 2)}
                    className="hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedIndex === idx * 2 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedIndex === idx * 2 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-navy-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-navy-800">
                  <code>{ep.curl}</code>
                </pre>
              </div>

              {/* Response Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">Response Preview (200 OK)</span>
                  <button
                    onClick={() => handleCopy(ep.response, idx * 2 + 1)}
                    className="hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedIndex === idx * 2 + 1 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedIndex === idx * 2 + 1 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-navy-950 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-navy-800">
                  <code>{ep.response}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

