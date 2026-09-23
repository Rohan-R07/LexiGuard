import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { getDocuments, askDocumentQuestion, getChatHistory, clearChatHistory } from '../services/api';
import SourcePageBadge from '../components/common/SourcePageBadge';
import LegalDisclaimer from '../components/common/LegalDisclaimer';

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(searchParams.get('doc') || '');
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState('');

  // Load available documents list
  useEffect(() => {
    async function loadDocs() {
      try {
        setLoadingDocs(true);
        const docs = await getDocuments();
        setDocuments(docs || []);
        if (docs && docs.length > 0) {
          const requestedDoc = searchParams.get('doc');
          if (requestedDoc && docs.some(d => d.id === requestedDoc)) {
            setSelectedDocId(requestedDoc);
          } else if (!selectedDocId) {
            setSelectedDocId(docs[0].id);
          }
        }
      } catch (err) {
        setError('Unable to load document library.');
      } finally {
        setLoadingDocs(false);
      }
    }

    loadDocs();
  }, [searchParams]);

  // Load chat history when selected document changes
  useEffect(() => {
    async function loadHistory() {
      if (!selectedDocId) {
        setMessages([]);
        return;
      }

      try {
        const history = await getChatHistory(selectedDocId);
        setMessages(history || []);
      } catch {
        setMessages([]);
      }
    }

    loadHistory();
  }, [selectedDocId]);

  // Auto scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAnswering]);

  const handleDocumentChange = (docId) => {
    setSelectedDocId(docId);
    setSearchParams({ doc: docId });
    setError('');
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    const query = inputQuestion.trim();
    if (!query || !selectedDocId || isAnswering) return;

    setError('');
    setInputQuestion('');
    
    // Add user message to UI immediately
    const userMsg = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsAnswering(true);

    try {
      const response = await askDocumentQuestion(selectedDocId, query);
      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        grounded: response.grounded,
        timestamp: response.created_at || new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.message || 'Failed to generate answer. Please try again.');
    } finally {
      setIsAnswering(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClearChat = async () => {
    if (!selectedDocId) return;
    await clearChatHistory(selectedDocId);
    setMessages([]);
  };

  const selectedDocument = documents.find(d => d.id === selectedDocId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header & Document Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
              </span>
              <span>Document Q&A Assistant</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Ask questions grounded strictly in the active legal document with page citations.
            </p>
          </div>

          {/* Document Picker */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="doc-select" className="text-xs font-semibold text-slate-600 shrink-0">
                Active Document:
              </label>
              <select
                id="doc-select"
                value={selectedDocId}
                onChange={(e) => handleDocumentChange(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 max-w-[220px] truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.page_count}p)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Document Info Bar */}
        {selectedDocument && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-900 truncate">{selectedDocument.filename}</span>
              <span>&bull;</span>
              <span>{selectedDocument.page_count} Pages</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={`/documents/${selectedDocument.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>View Full Document</span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No Documents Uploaded State */}
      {!loadingDocs && documents.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900">No documents available for Q&amp;A</h2>
            <p className="text-sm text-slate-500">
              Please upload a legal document first to ask grounded questions.
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

      {/* Chat Workspace */}
      {selectedDocument && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[600px] overflow-hidden">
          
          {/* Messages Feed */}
          <div 
            tabIndex={0}
            role="region"
            aria-label="Conversation message history"
            className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Grounded Legal Q&amp;A</h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Ask questions about notice periods, indemnities, payment schedules, or party obligations in <strong className="text-slate-800">{selectedDocument.filename}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputQuestion('What is the required notice period for termination?')}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    "What is the notice period for termination?"
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputQuestion('What are the key obligations of the parties?')}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    "What are the key obligations?"
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <span className="text-[11px] font-semibold text-slate-400 px-1">
                    {isUser ? 'You' : 'LexiGuard AI'}
                  </span>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-900 rounded-bl-xs space-y-3'
                    }`}
                  >
                    {/* Assistant Status Badge */}
                    {!isUser && msg.grounded !== undefined && (
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                        {msg.grounded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                            Grounded in Document
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                            <HelpCircle className="w-3 h-3 text-amber-600" aria-hidden="true" />
                            Insufficient Information in Document
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Source Citations */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Verified Sources:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {msg.sources.map((src, sIdx) => (
                            <SourcePageBadge
                              key={sIdx}
                              pageNumber={src.page_number}
                              onSelectPage={(pageNum) => navigate(`/documents/${selectedDocId}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAnswering && (
              <div className="flex flex-col items-start space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 px-1">LexiGuard AI</span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-xs p-4 flex items-center gap-2.5 text-xs text-slate-600 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" aria-hidden="true" />
                  <span>Searching document chunks and verifying citations...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Box */}
          <form 
            onSubmit={handleSubmitQuestion}
            className="p-3 sm:p-4 bg-slate-50/70 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Ask a question about ${selectedDocument.filename}...`}
              disabled={isAnswering}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-50 shadow-inner"
              aria-label="Ask a question about the document"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isAnswering}
              className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-1.5">Ask</span>
            </button>
          </form>

        </div>
      )}

      {/* Legal Disclaimer */}
      <LegalDisclaimer />

    </div>
  );
}
