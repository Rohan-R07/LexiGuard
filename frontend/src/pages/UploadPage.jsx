import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { uploadDocument } from '../services/api';
import LegalDisclaimer from '../components/common/LegalDisclaimer';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelection = (file) => {
    setErrorMessage('');
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      setErrorMessage('Invalid file format. Please select a valid PDF (.pdf) document.');
      setSelectedFile(null);
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25MB limit. Please upload a smaller document.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a PDF document before uploading.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const response = await uploadDocument(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (response && response.document_id) {
        navigate(`/documents/${response.document_id}`);
      } else {
        navigate('/documents');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Legal Document</h1>
        <p className="mt-1.5 text-slate-600 text-sm">
          Upload contracts, agreements, or terms in PDF format for structured AI analysis and page-level extraction.
        </p>
      </div>

      {/* Error Announcement */}
      {errorMessage && (
        <div 
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm font-medium">
            <strong className="block font-semibold">Upload Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Drag and Drop Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current && fileInputRef.current.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload PDF document drop area. Press Enter or Space to open file picker."
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelection(e.target.files[0]);
            }
          }}
          aria-hidden="true"
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
          <UploadCloud className="w-8 h-8" aria-hidden="true" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">
          Drag and drop your legal PDF here
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          or <span className="text-indigo-600 font-semibold underline underline-offset-2">browse from your computer</span>
        </p>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
          <span>Supported Format: <strong>PDF only</strong></span>
          <span>&bull;</span>
          <span>Max Size: <strong>25 MB</strong></span>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} &bull; Ready for parsing
                </p>
              </div>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                aria-label="Remove selected file"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Uploading and extracting page text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Action Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleUpload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <span>Upload &amp; Process Document</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Legal Information Disclaimer */}
      <LegalDisclaimer />

    </div>
  );
}
