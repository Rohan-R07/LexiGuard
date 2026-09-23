import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  GitCompare, 
  FileSearch, 
  BookmarkCheck, 
  CalendarClock, 
  AlertTriangle, 
  MessageSquareText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import LegalDisclaimer from '../components/common/LegalDisclaimer';
import StatusBadge from '../components/common/StatusBadge';

export default function HomePage({ backendStatus }) {
  const plannedCapabilities = [
    {
      title: 'Understand Documents',
      desc: 'Translate dense legal jargon into plain, clear language with structured summaries.',
      icon: FileSearch,
    },
    {
      title: 'Find Important Clauses',
      desc: 'Instantly pinpoint key terms including indemnification, termination, liability, and governing law.',
      icon: BookmarkCheck,
    },
    {
      title: 'Identify Obligations',
      desc: 'Extract actionable requirements, deliverables, and time-sensitive deadlines accurately.',
      icon: CalendarClock,
    },
    {
      title: 'Detect Potential Issues',
      desc: 'Highlight unusual clauses, ambiguities, and potential legal or business inconsistencies.',
      icon: AlertTriangle,
    },
    {
      title: 'Ask Questions',
      desc: 'Query your legal documents interactively to obtain cited, contextualized answers.',
      icon: MessageSquareText,
    },
    {
      title: 'Compare Documents',
      desc: 'Compare contracts side-by-side to highlight differences, omissions, and modified clauses.',
      icon: GitCompare,
    },
  ];

  return (
    <div className="space-y-12 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section aria-labelledby="hero-title" className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Development Connectivity Badge */}
        <div className="flex justify-center mb-6">
          <StatusBadge status={backendStatus} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Next-Generation Legal Intelligence</span>
        </div>

        <h1 
          id="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
        >
          Understand your legal documents with <span className="text-indigo-600">AI-powered document intelligence</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
          LexiGuard helps users understand, compare, and navigate legal documents by identifying important clauses, obligations, potential issues, and actionable information.
        </p>

        {/* Primary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <UploadCloud className="w-5 h-5" aria-hidden="true" />
            <span>Upload Document</span>
          </Link>
          <Link
            to="/compare"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <GitCompare className="w-5 h-5 text-slate-500" aria-hidden="true" />
            <span>Compare Documents</span>
          </Link>
        </div>
      </section>

      {/* Prominent Legal Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <LegalDisclaimer />
      </section>

      {/* Planned Capabilities Preview Grid */}
      <section aria-labelledby="capabilities-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 id="capabilities-title" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Planned Capabilities
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Architected for comprehensive document understanding and risk mitigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plannedCapabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-indigo-600">
                  <span>Phase Roadmap Feature</span>
                  <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
