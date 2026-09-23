import React from 'react';
import { FileText } from 'lucide-react';

/**
 * SourcePageBadge
 * Accessible button linking an AI-generated finding to its exact source page in the document reader.
 */
export default function SourcePageBadge({ pageNumber, onSelectPage, className = '' }) {
  if (!pageNumber) return null;

  return (
    <button
      type="button"
      onClick={() => onSelectPage && onSelectPage(pageNumber)}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${className}`}
      title={`Jump to Page ${pageNumber} in document text`}
      aria-label={`Jump to source Page ${pageNumber}`}
    >
      <FileText className="w-3 h-3 text-indigo-500" aria-hidden="true" />
      <span>Page {pageNumber}</span>
    </button>
  );
}
