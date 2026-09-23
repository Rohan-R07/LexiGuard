import React from 'react';
import { CalendarClock, UserCheck, Clock } from 'lucide-react';
import SourcePageBadge from '../common/SourcePageBadge';

export default function ObligationsTable({ obligations, onSelectPage }) {
  if (!obligations || obligations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CalendarClock className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Obligations &amp; Deadlines</h2>
            <p className="text-xs text-slate-500">Action items, deliverables, and notice timelines</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {obligations.length} items
        </span>
      </div>

      <div className="space-y-3">
        {obligations.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-200/80 p-4 space-y-2.5 bg-white hover:border-indigo-200 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                  <UserCheck className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  {item.party || 'Designated Party'}
                </span>
                {item.deadline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                    <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
                    Deadline: {item.deadline}
                  </span>
                )}
              </div>
              <SourcePageBadge pageNumber={item.page_number} onSelectPage={onSelectPage} />
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {item.obligation}
            </p>

            {item.source_text && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                Source: "{item.source_text}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
