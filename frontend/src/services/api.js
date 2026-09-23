import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

/**
 * Handle API error responses safely without leaking internal details.
 */
function handleApiError(error, defaultMessage) {
  if (error.response && error.response.data && error.response.data.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return new Error(detail);
    }
    if (Array.isArray(detail)) {
      return new Error(detail.map(d => d.msg || d).join(', '));
    }
  }
  return new Error(defaultMessage);
}

/**
 * Fetch health status of the backend API.
 */
export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Unable to connect to LexiGuard API service.');
  }
};

/**
 * Upload a legal PDF document.
 */
export const uploadDocument = async (file, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to upload document. Please ensure it is a valid PDF within size limits.');
  }
};

/**
 * List all uploaded documents.
 */
export const getDocuments = async () => {
  try {
    const response = await apiClient.get('/documents');
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to retrieve documents list.');
  }
};

/**
 * Retrieve document details by ID.
 */
export const getDocument = async (documentId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Failed to retrieve document ${documentId}.`);
  }
};

/**
 * Retrieve page-by-page extracted text for a document.
 */
export const getDocumentPages = async (documentId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}/pages`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to retrieve document pages.');
  }
};

/**
 * Trigger structured AI analysis for a document.
 */
export const analyzeDocument = async (documentId) => {
  try {
    const response = await apiClient.post(`/analysis/${documentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to analyze document. Please try again.');
  }
};

/**
 * Retrieve previously generated analysis for a document.
 */
export const getDocumentAnalysis = async (documentId) => {
  try {
    const response = await apiClient.get(`/analysis/${documentId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw handleApiError(error, 'Failed to load document analysis.');
  }
};

/**
 * Ask a document-grounded question via RAG.
 * @param {string} documentId
 * @param {string} question
 */
export const askDocumentQuestion = async (documentId, question) => {
  try {
    const response = await apiClient.post(`/chat/${documentId}`, { question });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to answer question. Please try again.');
  }
};

/**
 * Get in-memory chat history for a document.
 * @param {string} documentId
 */
export const getChatHistory = async (documentId) => {
  try {
    const response = await apiClient.get(`/chat/${documentId}/history`);
    return response.data;
  } catch (error) {
    return [];
  }
};

/**
 * Clear in-memory chat history for a document.
 * @param {string} documentId
 */
export const clearChatHistory = async (documentId) => {
  try {
    await apiClient.delete(`/chat/${documentId}/history`);
  } catch (error) {
    // Ignore clear failures
  }
};

/**
 * Compare two legal documents.
 * @param {string} documentIdA
 * @param {string} documentIdB
 */
export const compareDocuments = async (documentIdA, documentIdB) => {
  try {
    const response = await apiClient.post('/comparison', {
      document_id_a: documentIdA,
      document_id_b: documentIdB,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to compare documents. Please ensure both documents exist.');
  }
};

export default apiClient;
