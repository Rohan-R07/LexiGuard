import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  BookOpen
} from 'lucide-react';
import { getDocument, analyzeDocument, getDocumentAnalysis } from '../services/api';
import SummaryCard from '../components/analysis/SummaryCard';
import ClausesList from '../components/analysis/ClausesList';
import ObligationsTable from '../components/analysis/ObligationsTable';
import PotentialIssuesList from '../components/analysis/PotentialIssuesList';
import LegalDisclaimer from '../components/common/LegalDisclaimer';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const readerRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'analysis' | 'pages'
  const [error, setError] = useState('');

  // Fetch document details & initial analysis
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoadingDoc(true);
        setError('');
        const docData = await getDocument(id);
        setDocument(docData);
        if (docData && docData.pages && docData.pages.length > 0) {
          setActivePageNumber(1);
        }

        // Check if analysis exists
        const analysisData = await getDocumentAnalysis(id);
        if (analysisData) {
          setAnalysis(analysisData);
        }
      } catch (err) {
        setError(err.message || 'Failed to load document.');
      } finally {
        setLoadingDoc(false);
      }
    }

    loadData();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!id) return;
    try {
      setIsAnalyzing(true);
      setError('');
      const analysisResult = await analyzeDocument(id);
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err.message || 'Analysis generation failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPage = (pageNumber) => {
    setActivePageNumber(pageNumber);
    // Smooth scroll reader into view on mobile
    if (readerRef.current && typeof readerRef.current.scrollIntoView === 'function') {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loadingDoc) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">Loading document workspace...</p>
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Document Unavailable</h1>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="pt-2">
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            &larr; Return to Documents
          </Link>
        </div>
      </div>
    );
  }

  const currentPageText = document?.pages?.find(p => p.page_number === activePageNumber)?.text || '';
  const totalPages = document?.page_count || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Breadcrumb & Metadata Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-start gap-3">
            <Link
              to="/documents"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 shrink-0 mt-0.5"
              aria-label="Back to documents list"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
                  {document.filename}
                </h1>
                {analysis ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    AI Intelligence Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" aria-hidden="true" />
                    Text Extracted
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                <span>{document.page_count} Pages</span>
                <span>&bull;</span>
                <span>{formatFileSize(document.size_bytes)}</span>
                <span>&bull;</span>
                <span className="font-mono text-[11px] text-slate-400">ID: {document.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Action Button: Trigger Analysis */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{analysis ? 'Re-Analyze Document' : 'Generate AI Analysis'}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* View Toggle on smaller screens */}
        <div className="flex lg:hidden border-t border-slate-100 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'analysis' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Analysis &amp; Findings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'pages' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Page Reader ({activePageNumber}/{totalPages})
          </button>
        </div>
      </div>

      {/* Error alert if analysis fails */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm font-medium">
            <strong className="block font-semibold">Operation Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Dual Workspace: Analysis + Page Text Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Main Column: Structured AI Findings */}
        <div className={`lg:col-span-7 space-y-6 ${activeTab === 'pages' ? 'hidden lg:block' : 'block'}`}>
          
          {analysis ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <SummaryCard summary={analysis.summary} />

              {/* Clauses List */}
              <ClausesList clauses={analysis.important_clauses} onSelectPage={handleSelectPage} />

              {/* Obligations & Deadlines */}
              <ObligationsTable obligations={analysis.obligations} onSelectPage={handleSelectPage} />

              {/* Potential Issues Requiring Review */}
              <PotentialIssuesList potentialIssues={analysis.potential_issues} onSelectPage={handleSelectPage} />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-base font-bold text-slate-900">AI Analysis Ready</h2>
                <p className="text-sm text-slate-500">
                  Click the button below to extract plain-language summaries, key clauses, obligations, and potential issues.
                </p>
              </div>
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleRunAnalysis}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Generate AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Legal Disclaimer */}
          <LegalDisclaimer />
        </div>

        {/* Right Column: Page-Aware Document Text Viewer */}
        <div 
          ref={readerRef}
          className={`lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sticky top-20 max-h-[85vh] ${
            activeTab === 'analysis' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Reader Header / Controls */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 rounded-t-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">Extracted Page Text</h2>
            </div>

            {/* Page Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePageNumber <= 1}
                onClick={() => setActivePageNumber(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <span className="text-xs font-semibold text-slate-700 font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                Page {activePageNumber} of {totalPages}
              </span>

              <button
                type="button"
                disabled={activePageNumber >= totalPages}
                onClick={() => setActivePageNumber(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Quick Page Jump Pills (if multi-page) */}
          {totalPages > 1 && (
            <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium shrink-0">Jump:</span>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActivePageNumber(num)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                    activePageNumber === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  P.{num}
                </button>
              ))}
            </div>
          )}

          {/* Page Text Viewer Body */}
          <div 
            tabIndex={0}
            role="region"
            aria-label={`Page ${activePageNumber} text content`}
            className="p-5 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-800 font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            {currentPageText}
          </div>

          {/* Reader Footer Note */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-center text-[11px] text-slate-400">
            Source text preserved with page boundaries by PyMuPDF
          </div>
        </div>

      </div>

    </div>
  );
}
