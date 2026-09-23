import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentDetailPage from './DocumentDetailPage';
import * as api from '../services/api';

describe('DocumentDetailPage Component', () => {
  const mockDoc = {
    id: 'test-doc-id',
    filename: 'nda_sample.pdf',
    page_count: 2,
    size_bytes: 10240,
    status: 'processed',
    has_analysis: true,
    pages: [
      { page_number: 1, text: 'This is page one NDA text.', character_count: 26 },
      { page_number: 2, text: 'This is page two termination clause text.', character_count: 40 },
    ],
  };

  const mockAnalysis = {
    document_id: 'test-doc-id',
    summary: {
      summary: 'A standard NDA agreement between parties.',
      key_points: ['Mutual confidentiality obligations', 'Term is 2 years'],
    },
    important_clauses: [
      {
        title: 'Confidentiality Clause',
        explanation: 'Requires non-disclosure of trade secrets.',
        page_number: 1,
        source_text: 'Recipient shall protect confidential info.',
      },
    ],
    obligations: [
      {
        party: 'Recipient',
        obligation: 'Return all confidential records upon termination.',
        deadline: 'Within 30 days',
        page_number: 2,
        source_text: 'Records returned within 30 days.',
      },
    ],
    potential_issues: [
      {
        category: 'Unilateral Discretion',
        description: 'Discloser may audit without advance notice.',
        why_attention_is_needed: 'Audit window should specify reasonable business hours.',
        page_number: 1,
        source_text: 'Discloser may inspect at sole discretion.',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderDetailPage = () => {
    return render(
      <MemoryRouter initialEntries={['/documents/test-doc-id']}>
        <Routes>
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders document metadata and extracted text', async () => {
    vi.spyOn(api, 'getDocument').mockResolvedValue(mockDoc);
    vi.spyOn(api, 'getDocumentAnalysis').mockResolvedValue(null);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /nda_sample\.pdf/i })).toBeInTheDocument();
      expect(screen.getByText(/2 Pages/i)).toBeInTheDocument();
      expect(screen.getByText('This is page one NDA text.')).toBeInTheDocument();
    });
  });

  it('renders structured AI analysis cards when analysis is present', async () => {
    vi.spyOn(api, 'getDocument').mockResolvedValue(mockDoc);
    vi.spyOn(api, 'getDocumentAnalysis').mockResolvedValue(mockAnalysis);

    renderDetailPage();

    await waitFor(() => {
      // Summary
      expect(screen.getByText('Document Summary')).toBeInTheDocument();
      expect(screen.getByText(/A standard NDA agreement between parties/i)).toBeInTheDocument();

      // Important Clause
      expect(screen.getByText('Confidentiality Clause')).toBeInTheDocument();

      // Obligations
      expect(screen.getByText(/Return all confidential records/i)).toBeInTheDocument();

      // Potential Issue
      expect(screen.getByText(/Unilateral Discretion/i)).toBeInTheDocument();
    });
  });

  it('updates page reader when a source page badge is clicked', async () => {
    vi.spyOn(api, 'getDocument').mockResolvedValue(mockDoc);
    vi.spyOn(api, 'getDocumentAnalysis').mockResolvedValue(mockAnalysis);

    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByText('This is page one NDA text.')).toBeInTheDocument();
    });

    // Find the jump badge for page 2 (from the obligation)
    const page2Badges = screen.getAllByRole('button', { name: /jump to source page 2/i });
    expect(page2Badges.length).toBeGreaterThan(0);

    fireEvent.click(page2Badges[0]);

    await waitFor(() => {
      expect(screen.getByText('This is page two termination clause text.')).toBeInTheDocument();
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });
  });
});
