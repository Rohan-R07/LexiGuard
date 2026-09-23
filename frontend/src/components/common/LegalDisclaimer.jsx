import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Legal Disclaimer component
 * Complies with strict legal disclosure requirements and accessibility standards.
 */
export default function LegalDisclaimer({ className = '' }) {
  return (
    <aside 
      className={`rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-amber-900 shadow-sm ${className}`}
      aria-label="Legal Disclaimer"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-sm leading-relaxed">
          <strong className="font-semibold text-amber-950 block mb-0.5">
            Important Legal Information &amp; Disclaimer
          </strong>
          <p className="text-amber-900/90">
            LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation. AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.
          </p>
        </div>
      </div>
    </aside>
  );
}
