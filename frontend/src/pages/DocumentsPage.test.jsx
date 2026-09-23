import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentsPage from './DocumentsPage';
import * as api from '../services/api';

describe('DocumentsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderDocumentsPage = () => {
    return render(
      <BrowserRouter>
        <DocumentsPage />
      </BrowserRouter>
    );
  };

  it('renders empty state when no documents exist', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    renderDocumentsPage();

    await waitFor(() => {
      expect(screen.getByText(/no documents uploaded yet/i)).toBeInTheDocument();
    });
  });

  it('renders document cards when documents exist', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([
      {
        id: 'doc-123',
        filename: 'service_agreement.pdf',
        page_count: 5,
        size_bytes: 54321,
        status: 'processed',
        has_analysis: true,
        created_at: new Date().toISOString(),
      },
    ]);

    renderDocumentsPage();

    await waitFor(() => {
      expect(screen.getByText('service_agreement.pdf')).toBeInTheDocument();
      expect(screen.getByText(/5 Pages/i)).toBeInTheDocument();
      expect(screen.getByText(/Analyzed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view details & analysis/i })).toBeInTheDocument();
    });
  });
});
