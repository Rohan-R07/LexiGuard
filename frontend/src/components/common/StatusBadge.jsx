import React from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * StatusBadge Component
 * Accessible status indicator displaying connectivity with both text and visual icon.
 */
export default function StatusBadge({ status }) {
  if (status === 'connected') {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
        role="status"
        aria-label="Backend status: Connected"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
        <span>Backend: Connected</span>
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
        role="status"
        aria-label="Backend status: Disconnected"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
        <span>Backend: Disconnected</span>
      </div>
    );
  }

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
      role="status"
      aria-label="Backend status: Checking"
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" aria-hidden="true" />
      <span>Backend: Checking...</span>
    </div>
  );
}
