import{t as e}from"./server-BbYpkWMt.js";import{G as t,J as n,U as r,b as i,i as a}from"./index-D5CeDiVm.js";var o={name:`check`,size:24,node:[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]};o.node;var s=r(o),c={name:`code`,size:24,node:[[`path`,{d:`m16 18 6-6-6-6`,key:`eg8j8`}],[`path`,{d:`m8 6-6 6 6 6`,key:`ppft3o`}]]};c.node;var l=r(c),u={name:`copy`,size:24,node:[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]};u.node;var d=r(u),f={name:`external-link`,size:24,node:[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`M10 14 21 3`,key:`gplh6r`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`,key:`a6xqqp`}]]};f.node;var p=r(f),m=n(t(),1),h=i();function g(){a(`API Documentation`,`Developer reference for integrating with FraudShield REST endpoints.`);let[t,n]=(0,m.useState)(null),r=(e,t)=>{navigator.clipboard.writeText(e),n(t),setTimeout(()=>n(null),2e3)};return(0,h.jsxs)(`div`,{className:`space-y-6`,children:[(0,h.jsxs)(`div`,{className:`card p-6 bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border-navy-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`,children:[(0,h.jsxs)(`div`,{className:`space-y-1`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(e,{className:`w-5 h-5 text-brand-400`}),(0,h.jsx)(`h3`,{className:`text-base font-bold text-slate-100`,children:`Interactive OpenAPI Specification`})]}),(0,h.jsx)(`p`,{className:`text-xs text-slate-400`,children:`Access live Swagger UI documentation, interactive request testing, and schema validation.`})]}),(0,h.jsxs)(`a`,{href:`http://localhost:8000/api/docs`,target:`_blank`,rel:`noopener noreferrer`,className:`btn-primary py-2 px-4 text-xs flex items-center gap-2`,children:[`Open Swagger Docs `,(0,h.jsx)(p,{className:`w-3.5 h-3.5`})]})]}),(0,h.jsx)(`div`,{className:`space-y-6`,children:[{method:`POST`,path:`/predict`,title:`Analyze Single Transaction`,description:`Run real-time ML inference on a single transaction payload.`,curl:`curl -X POST "http://localhost:8000/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "step": 1,
    "type": "TRANSFER",
    "amount": 150000.0,
    "oldbalanceOrg": 150000.0,
    "newbalanceOrig": 0.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 150000.0
  }'`,response:`{
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
}`},{method:`POST`,path:`/upload/analyze`,title:`Batch Dataset Analysis`,description:`Upload a CSV or XLSX dataset file for complete bulk fraud screening.`,curl:`curl -X POST "http://localhost:8000/upload/analyze" \\
  -F "file=@transactions.csv" \\
  -F 'column_mapping={}'`,response:`{
  "filename": "transactions.csv",
  "has_labels": true,
  "analytics": {
    "total": 1000,
    "predicted_fraud": 14,
    "avg_fraud_probability": 0.0142
  }
}`},{method:`GET`,path:`/health`,title:`System Telemetry & Health`,description:`Check service availability, model loading state, and latency benchmark.`,curl:`curl -X GET "http://localhost:8000/health"`,response:`{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0",
  "api_version": "1.0.0",
  "model_latency_ms": 3.42
}`}].map((e,n)=>(0,h.jsxs)(`div`,{className:`card p-6 space-y-4 border-navy-700`,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between border-b border-navy-700 pb-3`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,h.jsx)(`span`,{className:`px-2.5 py-1 rounded text-xs font-bold font-mono ${e.method===`POST`?`bg-brand-500/20 text-brand-400`:`bg-emerald-500/20 text-emerald-400`}`,children:e.method}),(0,h.jsx)(`span`,{className:`font-mono text-sm font-semibold text-slate-200`,children:e.path})]}),(0,h.jsx)(`span`,{className:`text-xs font-medium text-slate-400`,children:e.title})]}),(0,h.jsx)(`p`,{className:`text-xs text-slate-300`,children:e.description}),(0,h.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-4`,children:[(0,h.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between text-xs text-slate-400`,children:[(0,h.jsxs)(`span`,{className:`flex items-center gap-1 font-mono text-[11px]`,children:[(0,h.jsx)(l,{className:`w-3.5 h-3.5`}),` cURL Example`]}),(0,h.jsxs)(`button`,{onClick:()=>r(e.curl,n*2),className:`hover:text-slate-200 flex items-center gap-1`,children:[t===n*2?(0,h.jsx)(s,{className:`w-3.5 h-3.5 text-emerald-400`}):(0,h.jsx)(d,{className:`w-3.5 h-3.5`}),t===n*2?`Copied!`:`Copy`]})]}),(0,h.jsx)(`pre`,{className:`p-3 bg-navy-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-navy-800`,children:(0,h.jsx)(`code`,{children:e.curl})})]}),(0,h.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between text-xs text-slate-400`,children:[(0,h.jsx)(`span`,{className:`flex items-center gap-1 font-mono text-[11px]`,children:`Response Preview (200 OK)`}),(0,h.jsxs)(`button`,{onClick:()=>r(e.response,n*2+1),className:`hover:text-slate-200 flex items-center gap-1`,children:[t===n*2+1?(0,h.jsx)(s,{className:`w-3.5 h-3.5 text-emerald-400`}):(0,h.jsx)(d,{className:`w-3.5 h-3.5`}),t===n*2+1?`Copied!`:`Copy`]})]}),(0,h.jsx)(`pre`,{className:`p-3 bg-navy-950 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-navy-800`,children:(0,h.jsx)(`code`,{children:e.response})})]})]})]},n))})]})}export{g as default};