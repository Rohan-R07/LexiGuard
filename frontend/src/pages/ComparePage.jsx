import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GitCompare, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  CheckCircle2,
  UploadCloud,
  FileSearch,
  ChevronRight
} from 'lucide-react';
import { getDocuments, compareDocuments } from '../services/api';
import SourcePageBadge from '../components/common/SourcePageBadge';
import LegalDisclaimer from '../components/common/LegalDisclaimer';

export default function ComparePage() {
  const [documents, setDocuments] = useState([]);
  const [docIdA, setDocIdA] = useState('');
  const [docIdB, setDocIdB] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'added' | 'removed' | 'modified'
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState('');

  // Load available documents
  useEffect(() => {
    async function loadDocs() {
      try {
        setLoadingDocs(true);
        const docs = await getDocuments();
        setDocuments(docs || []);
        if (docs && docs.length >= 2) {
          setDocIdA(docs[0].id);
          setDocIdB(docs[1].id);
        } else if (docs && docs.length === 1) {
          setDocIdA(docs[0].id);
        }
      } catch (err) {
        setError('Failed to load document library.');
      } finally {
        setLoadingDocs(false);
      }
    }

    loadDocs();
  }, []);

  const handleCompare = async () => {
    if (!docIdA || !docIdB) {
      setError('Please select both Document A and Document B to compare.');
      return;
    }

    if (docIdA === docIdB) {
      setError('Cannot compare a document to itself. Please select two distinct documents.');
      return;
    }

    setIsComparing(true);
    setError('');

    try {
      const result = await compareDocuments(docIdA, docIdB);
      setComparisonResult(result);
    } catch (err) {
      setError(err.message || 'Comparison failed. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const docA = documents.find(d => d.id === docIdA);
  const docB = documents.find(d => d.id === docIdB);

  const filteredChanges = comparisonResult?.changes?.filter(change => {
    if (selectedFilter === 'all') return true;
    return change.change_type === selectedFilter;
  }) || [];

  const addedCount = comparisonResult?.changes?.filter(c => c.change_type === 'added').length || 0;
  const removedCount = comparisonResult?.changes?.filter(c => c.change_type === 'removed').length || 0;
  const modifiedCount = comparisonResult?.changes?.filter(c => c.change_type === 'modified').length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GitCompare className="w-5 h-5" aria-hidden="true" />
          </span>
          <span>Contract &amp; Document Comparison</span>
        </h1>
        <p className="mt-2 text-slate-600 text-sm max-w-3xl leading-relaxed">
          Compare two versions of an agreement side-by-side to highlight added clauses, removed conditions, and modified terms with dual source page references.
        </p>
      </div>

      {/* Insufficient Documents State (<2 docs) */}
      {!loadingDocs && documents.length < 2 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900">At least two documents required</h2>
            <p className="text-sm text-slate-500">
              You currently have {documents.length} document uploaded. Please upload a second contract to perform comparative analysis.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              <span>Upload Second Document</span>
            </Link>
          </div>
        </div>
      )}

      {/* Comparison Selector Card */}
      {documents.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Document A Selector */}
            <div className="space-y-2">
              <label htmlFor="doc-a-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Document A (Base Version)
              </label>
              <select
                id="doc-a-select"
                value={docIdA}
                onChange={(e) => setDocIdA(e.target.value)}
                className="w-full text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.page_count} Pages)
                  </option>
                ))}
              </select>
              {docA && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  <span>{docA.filename} &bull; {docA.page_count} Pages</span>
                </p>
              )}
            </div>

            {/* Document B Selector */}
            <div className="space-y-2">
              <label htmlFor="doc-b-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Document B (Comparison Target)
              </label>
              <select
                id="doc-b-select"
                value={docIdB}
                onChange={(e) => setDocIdB(e.target.value)}
                className="w-full text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.page_count} Pages)
                  </option>
                ))}
              </select>
              {docB && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  <span>{docB.filename} &bull; {docB.page_count} Pages</span>
                </p>
              )}
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isComparing || docIdA === docIdB}
              onClick={handleCompare}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Aligning Clauses &amp; Comparing...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" aria-hidden="true" />
                  <span>Compare Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Comparison Results View */}
      {comparisonResult && (
        <div className="space-y-6">
          
          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              <h2 className="text-lg font-bold">Comparative Synthesis</h2>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {comparisonResult.summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 text-center">
                <span className="text-2xl font-extrabold text-emerald-700 block">{addedCount}</span>
                <span className="text-xs font-semibold text-emerald-900">Added in B</span>
              </div>
              <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-3 text-center">
                <span className="text-2xl font-extrabold text-rose-700 block">{removedCount}</span>
                <span className="text-xs font-semibold text-rose-900">Removed from A</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-center">
                <span className="text-2xl font-extrabold text-amber-700 block">{modifiedCount}</span>
                <span className="text-xs font-semibold text-amber-900">Modified Terms</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Differences ({comparisonResult.changes.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('added')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFilter === 'added'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Added ({addedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('removed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFilter === 'removed'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              Removed ({removedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('modified')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFilter === 'modified'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              Modified ({modifiedCount})
            </button>
          </div>

          {/* Differences List */}
          <div className="space-y-4">
            {filteredChanges.map((change, index) => {
              const isAdded = change.change_type === 'added';
              const isRemoved = change.change_type === 'removed';
              const isModified = change.change_type === 'modified';

              let badgeColor = 'bg-amber-100 text-amber-900 border-amber-200';
              let typeIcon = <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />;
              let label = 'Modified Clause';

              if (isAdded) {
                badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-200';
                typeIcon = <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />;
                label = 'Added in Document B';
              } else if (isRemoved) {
                badgeColor = 'bg-rose-100 text-rose-900 border-rose-200';
                typeIcon = <MinusCircle className="w-3.5 h-3.5" aria-hidden="true" />;
                label = 'Removed from Document A';
              }

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${badgeColor}`}>
                        {typeIcon}
                        <span>{label}</span>
                      </span>
                      <span className="text-sm font-bold text-slate-900">{change.category}</span>
                    </div>

                    {/* Source Page Badges for Doc A and Doc B */}
                    <div className="flex items-center gap-2 text-xs">
                      {change.document_a_page && (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Doc A: Page {change.document_a_page}
                        </span>
                      )}
                      {change.document_b_page && (
                        <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium border border-indigo-100">
                          Doc B: Page {change.document_b_page}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {change.description}
                  </p>

                  {/* Side-by-Side Excerpts (if available) */}
                  {(change.document_a_text || change.document_b_text) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {change.document_a_text && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 space-y-1">
                          <strong className="text-slate-600 block text-[11px] uppercase tracking-wider">
                            Document A Excerpt (Page {change.document_a_page || 1}):
                          </strong>
                          <p className="font-mono text-slate-700 italic leading-relaxed">
                            "{change.document_a_text}"
                          </p>
                        </div>
                      )}
                      {change.document_b_text && (
                        <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-100 space-y-1">
                          <strong className="text-indigo-800 block text-[11px] uppercase tracking-wider">
                            Document B Excerpt (Page {change.document_b_page || 1}):
                          </strong>
                          <p className="font-mono text-indigo-950 italic leading-relaxed">
                            "{change.document_b_text}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Neutral Significance Explanation */}
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                      Significance for Legal Review:
                    </span>
                    <p className="leading-relaxed">{change.significance_explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Legal Disclaimer */}
      <LegalDisclaimer />

    </div>
  );
}
