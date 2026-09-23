import React from 'react';
import { BookmarkCheck, Quote } from 'lucide-react';
import SourcePageBadge from '../common/SourcePageBadge';

export default function ClausesList({ clauses, onSelectPage }) {
  if (!clauses || clauses.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Important Clauses</h2>
            <p className="text-xs text-slate-500">Key legal provisions &amp; terms identified</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {clauses.length} {clauses.length === 1 ? 'clause' : 'clauses'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clauses.map((clause, index) => (
          <article
            key={index}
            className="rounded-lg border border-slate-200/80 p-4 space-y-3 bg-white hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">{clause.title}</h3>
              <SourcePageBadge pageNumber={clause.page_number} onSelectPage={onSelectPage} />
            </div>

            {/* AI Explanation */}
            <div className="text-xs sm:text-sm text-slate-700 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                AI Explanation
              </span>
              <p className="leading-relaxed">{clause.explanation}</p>
            </div>

            {/* Source Document Excerpt */}
            {clause.source_text && (
              <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/60 text-xs text-slate-600">
                <div className="flex items-center gap-1 text-slate-500 font-medium mb-1">
                  <Quote className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>Document says (Page {clause.page_number}):</span>
                </div>
                <blockquote className="italic text-slate-700 font-mono text-[11px] leading-relaxed">
                  "{clause.source_text}"
                </blockquote>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
