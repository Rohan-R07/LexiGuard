import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatPage from './ChatPage';
import * as api from '../services/api';

describe('ChatPage Component', () => {
  const mockDocs = [
    {
      id: 'doc-1',
      filename: 'employment_agreement.pdf',
      page_count: 3,
      size_bytes: 20480,
      status: 'processed',
      has_analysis: true,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderChatPage = () => {
    return render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );
  };

  it('renders chat interface with document selection', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getChatHistory').mockResolvedValue([]);

    renderChatPage();

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(screen.getAllByText(/employment_agreement\.pdf/i).length).toBeGreaterThan(0);
      expect(screen.getByPlaceholderText(/ask a question about/i)).toBeInTheDocument();
    });
  });

  it('submits a question and renders a grounded answer with source page citation', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getChatHistory').mockResolvedValue([]);
    vi.spyOn(api, 'askDocumentQuestion').mockResolvedValue({
      document_id: 'doc-1',
      question: 'What is the notice period?',
      answer: 'The required notice period is 30 days as stated in Section 4.',
      sources: [
        { page_number: 2, chunk_id: 'doc-1-p2-c0', source_text: 'Notice period is 30 days.' }
      ],
      grounded: true,
      created_at: new Date().toISOString(),
    });

    renderChatPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question about/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/ask a question about/i);
    const sendButton = screen.getByRole('button', { name: /send question/i });

    fireEvent.change(input, { target: { value: 'What is the notice period?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/the required notice period is 30 days/i)).toBeInTheDocument();
      expect(screen.getByText(/grounded in document/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /jump to source page 2/i })).toBeInTheDocument();
    });
  });

  it('displays insufficient information state when answer is not in document', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getChatHistory').mockResolvedValue([]);
    vi.spyOn(api, 'askDocumentQuestion').mockResolvedValue({
      document_id: 'doc-1',
      question: 'What is the tax rate?',
      answer: 'The uploaded document does not provide enough information to answer this confidently.',
      sources: [],
      grounded: false,
      created_at: new Date().toISOString(),
    });

    renderChatPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question about/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/ask a question about/i);
    const sendButton = screen.getByRole('button', { name: /send question/i });

    fireEvent.change(input, { target: { value: 'What is the tax rate?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/insufficient information in document/i)).toBeInTheDocument();
      expect(screen.getByText(/does not provide enough information/i)).toBeInTheDocument();
    });
  });
});
