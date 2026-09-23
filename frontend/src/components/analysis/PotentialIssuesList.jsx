import React from 'react';
import { AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react';
import SourcePageBadge from '../common/SourcePageBadge';

export default function PotentialIssuesList({ potentialIssues, onSelectPage }) {
  if (!potentialIssues || potentialIssues.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Potential Issues Requiring Review
            </h2>
            <p className="text-xs text-slate-500">
              Clauses with unilateral terms, ambiguities, or high-risk exposure
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800">
          {potentialIssues.length} flagged
        </span>
      </div>

      <div className="space-y-4">
        {potentialIssues.map((issue, index) => (
          <article
            key={index}
            className="rounded-lg border border-amber-200/70 bg-amber-50/20 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  <ShieldAlert className="w-3 h-3 text-amber-700" aria-hidden="true" />
                  {issue.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">Requires Legal Review</span>
              </div>
              <SourcePageBadge pageNumber={issue.page_number} onSelectPage={onSelectPage} />
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {issue.description}
            </p>

            <div className="bg-white/80 rounded-md p-3 border border-amber-200/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-950">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Why Attention is Needed:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {issue.why_attention_is_needed}
              </p>
            </div>

            {issue.source_text && (
              <div className="text-xs text-slate-500 bg-white/60 p-2 rounded border border-slate-100 font-mono italic">
                Source (Page {issue.page_number}): "{issue.source_text}"
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
