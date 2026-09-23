import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import UploadPage from './UploadPage';
import * as api from '../services/api';

describe('UploadPage Component', () => {
  const renderUploadPage = () => {
    return render(
      <BrowserRouter>
        <UploadPage />
      </BrowserRouter>
    );
  };

  it('renders upload page title and drop area', () => {
    renderUploadPage();
    expect(screen.getByRole('heading', { name: /upload legal document/i })).toBeInTheDocument();
    expect(screen.getByText(/drag and drop your legal pdf here/i)).toBeInTheDocument();
  });

  it('rejects invalid non-pdf files with an accessible error alert', async () => {
    renderUploadPage();

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const dropArea = screen.getByRole('button', { name: /upload pdf document drop area/i });

    fireEvent.drop(dropArea, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/invalid file format/i);
    });
  });

  it('accepts valid PDF file and shows file preview with upload button', async () => {
    renderUploadPage();

    const file = new File(['%PDF-1.4 sample content'], 'contract.pdf', { type: 'application/pdf' });
    const dropArea = screen.getByRole('button', { name: /upload pdf document drop area/i });

    fireEvent.drop(dropArea, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('contract.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload & process document/i })).toBeInTheDocument();
    });
  });
});
