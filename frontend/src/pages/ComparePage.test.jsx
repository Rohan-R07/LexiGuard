import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComparePage from './ComparePage';
import * as api from '../services/api';

describe('ComparePage Component', () => {
  const mockDocs = [
    { id: 'doc-1', filename: 'contract_v1.pdf', page_count: 2, size_bytes: 1000 },
    { id: 'doc-2', filename: 'contract_v2.pdf', page_count: 2, size_bytes: 1200 },
  ];

  const mockComparison = {
    document_a_id: 'doc-1',
    document_b_id: 'doc-2',
    document_a_filename: 'contract_v1.pdf',
    document_b_filename: 'contract_v2.pdf',
    summary: 'Identified 2 key contractual modifications.',
    changes: [
      {
        change_type: 'modified',
        category: 'Termination Notice',
        description: 'Notice increased from 30 to 60 days.',
        document_a_page: 1,
        document_b_page: 1,
        document_a_text: '30 days notice required.',
        document_b_text: '60 days notice required.',
        significance_explanation: 'Extends termination notice requirements.',
      },
      {
        change_type: 'added',
        category: 'Indemnification',
        description: 'New indemnity clause added.',
        document_a_page: null,
        document_b_page: 2,
        document_a_text: null,
        document_b_text: 'Provider agrees to indemnify Client.',
        significance_explanation: 'New risk allocation introduced.',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComparePage = () => {
    return render(
      <BrowserRouter>
        <ComparePage />
      </BrowserRouter>
    );
  };

  it('renders compare page with document selectors', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    renderComparePage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByLabelText(/document a/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/document b/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /compare documents/i })).toBeInTheDocument();
    });
  });

  it('executes comparison and renders added and modified changes', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'compareDocuments').mockResolvedValue(mockComparison);

    renderComparePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /compare documents/i })).toBeInTheDocument();
    });

    const compareBtn = screen.getByRole('button', { name: /compare documents/i });
    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(screen.getByText('Comparative Synthesis')).toBeInTheDocument();
      expect(screen.getByText(/Notice increased from 30 to 60 days/i)).toBeInTheDocument();
      expect(screen.getByText('Termination Notice')).toBeInTheDocument();
      expect(screen.getByText('Indemnification')).toBeInTheDocument();
      expect(screen.getByText(/Doc A: Page 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Doc B: Page 1/i)).toBeInTheDocument();
    });
  });
});
