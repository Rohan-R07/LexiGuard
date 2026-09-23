import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HomePage from './HomePage';

describe('HomePage Component', () => {
  const renderHomePage = (status = 'connected') => {
    return render(
      <BrowserRouter>
        <HomePage backendStatus={status} />
      </BrowserRouter>
    );
  };

  it('renders the main headline and branding', () => {
    renderHomePage();

    // Verify main headline is present
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveTextContent(/Understand your legal documents with/i);
    expect(headline).toHaveTextContent(/AI-powered document intelligence/i);
  });

  it('renders primary call-to-action buttons with correct links', () => {
    renderHomePage();

    // Upload Document CTA
    const uploadButton = screen.getByRole('link', { name: /upload document/i });
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('href', '/upload');

    // Compare Documents CTA
    const compareButton = screen.getByRole('link', { name: /compare documents/i });
    expect(compareButton).toBeInTheDocument();
    expect(compareButton).toHaveAttribute('href', '/compare');
  });

  it('renders the legal information disclaimer prominently', () => {
    renderHomePage();

    const disclaimer = screen.getByLabelText(/legal disclaimer/i);
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer).toHaveTextContent(/does not provide legal advice or legal representation/i);
    expect(disclaimer).toHaveTextContent(/consult a qualified legal professional/i);
  });

  it('renders the backend connectivity status indicator', () => {
    renderHomePage('connected');
    expect(screen.getByRole('status', { name: /backend status: connected/i })).toBeInTheDocument();
  });
});
