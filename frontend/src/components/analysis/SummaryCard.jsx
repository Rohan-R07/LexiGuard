import React from 'react';
import { FileText, CheckCircle2, Sparkles } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Document Summary</h2>
          <p className="text-xs text-slate-500">AI-assisted plain language synthesis</p>
        </div>
      </div>

      <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 block mb-1.5">
          AI Plain-Language Overview
        </span>
        <p className="text-slate-800 text-sm leading-relaxed">{summary.summary}</p>
      </div>

      {summary.key_points && summary.key_points.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Highlights</h3>
          <ul className="space-y-2">
            {summary.key_points.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
