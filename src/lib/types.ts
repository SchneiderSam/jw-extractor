// Type definitions for content extraction

// Enhanced error types for better debugging
export type ErrorType = 
  | 'INVALID_URL'
  | 'CONTENT_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'FETCH_ERROR'      // Network connection failed
  | 'TIMEOUT_ERROR'    // Request timed out
  | 'PARSE_ERROR'      // HTML parsing failed
  | 'CONVERSION_ERROR'; // Markdown conversion failed

// Extraction stage identifiers
export type ExtractionStage = 'fetch' | 'parse' | 'convert';

// Enhanced error interface with optional context fields
export interface ExtractionError {
  type: ErrorType;
  message: string;
  stage?: ExtractionStage;
  attemptNumber?: number;
  timing?: number; // milliseconds
}

export interface ExtractionResult {
  success: boolean;
  html?: string;
  markdown?: string;
  error?: ExtractionError;
}

export interface ExtractionRequest {
  url: string;
}

/**
 * Generate a descriptive error message based on error type and context
 */
export function generateErrorMessage(
  type: ErrorType,
  context?: {
    stage?: ExtractionStage;
    attemptNumber?: number;
    timing?: number;
    url?: string;
  }
): string {
  const attempt = context?.attemptNumber 
    ? ` (attempt ${context.attemptNumber})` 
    : '';
  const stage = context?.stage ? ` during ${context.stage} stage` : '';
  const timing = context?.timing ? ` after ${(context.timing / 1000).toFixed(1)}s` : '';

  switch (type) {
    case 'INVALID_URL':
      return 'Invalid URL format. Please enter a valid jw.org or wol.jw.org link.';
    
    case 'FETCH_ERROR':
      return `Failed to fetch content from URL${stage}${attempt}. Please check your internet connection.`;
    
    case 'TIMEOUT_ERROR':
      return `Request timed out${timing}${stage}${attempt}. The page took too long to respond.`;
    
    case 'PARSE_ERROR':
      return `Failed to parse HTML content${stage}${attempt}. The page structure may have changed.`;
    
    case 'CONVERSION_ERROR':
      return `Failed to convert content to Markdown${stage}${attempt}. The content format may be unsupported.`;
    
    case 'CONTENT_NOT_FOUND':
      return `Content could not be found on the page${attempt}. The page structure may have changed.`;
    
    case 'NETWORK_ERROR':
    default:
      return `Network error occurred${stage}${attempt}. Please try again.`;
  }
}

