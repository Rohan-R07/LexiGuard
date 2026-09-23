import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { getDocuments } from '../services/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      try {
        setLoading(true);
        setError('');
        const data = await getDocuments();
        setDocuments(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load documents.');
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Legal Documents</h1>
          <p className="mt-1 text-slate-600 text-sm">
            Ingested agreements, extracted text pages, and structured AI intelligence reports.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          <span>Upload New Document</span>
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">Loading document library...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && !loading && (
        <div 
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm font-medium">
            <strong className="block font-semibold">Unable to Load Documents</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && documents.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No documents uploaded yet</h2>
            <p className="text-sm text-slate-500">
              Upload your first legal document (PDF) to begin page extraction and AI clause analysis.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      )}

      {/* Document Grid / List */}
      {!loading && !error && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between p-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  {doc.has_analysis ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      Analyzed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      Parsed
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 truncate" title={doc.filename}>
                    {doc.filename}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                    <span>{doc.page_count} {doc.page_count === 1 ? 'Page' : 'Pages'}</span>
                    <span>&bull;</span>
                    <span>{formatFileSize(doc.size_bytes)}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  to={`/documents/${doc.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <span>View Details &amp; Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
