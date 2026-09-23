import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Document Q&amp;A Chat</h1>
        <p className="mt-1 text-slate-600 text-sm">
          Phase 1 architectural route for conversational document analysis.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Interactive Assistant Workspace</h2>
          <p className="text-sm text-slate-500">
            Conversational RAG queries, clause context retrieval, and professional question preparation will be integrated in future phases.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            &larr; Back to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
