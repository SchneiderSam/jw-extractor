// Type definitions for content extraction

export type ErrorType = 'INVALID_URL' | 'CONTENT_NOT_FOUND' | 'NETWORK_ERROR';

export interface ExtractionResult {
  success: boolean;
  html?: string;
  markdown?: string;
  error?: {
    type: ErrorType;
    message: string;
  };
}

export interface ExtractionRequest {
  url: string;
}

