'use server';

import * as cheerio from 'cheerio';
import type { ExtractionResult } from '@/lib/types';
import { generateErrorMessage } from '@/lib/types';
import { convertHtmlToMarkdown } from '@/lib/markdown-converter';
import { withRetry } from '@/lib/extraction/retry-handler';
import { logger } from '@/lib/extraction/logger';

/**
 * Server Action to extract content from jw.org/wol.jw.org URLs
 * Fetches HTML, parses with Cheerio, extracts the #content div, and converts to Markdown
 * Includes automatic retry logic with exponential backoff
 */
export async function extractContent(url: string): Promise<ExtractionResult> {
  // Log extraction start
  logger.logExtractionStart(url);
  const extractionStart = Date.now();

  // Wrap extraction in retry handler
  const result = await withRetry(async (attemptNumber: number) => {
    return performExtraction(url, attemptNumber);
  });

  // Log extraction result
  const extractionDuration = Date.now() - extractionStart;
  if (result.success) {
    logger.logExtractionSuccess(url, extractionDuration);
  } else if (result.error) {
    logger.logExtractionFailure(url, result.error.type, extractionDuration);
  }

  return result;
}

/**
 * Internal extraction function (called by retry handler)
 */
async function performExtraction(url: string, attemptNumber: number): Promise<ExtractionResult> {
  try {
    // Validate URL format
    const jwOrgPattern = /^https?:\/\/(www\.)?jw\.org\/.+/i;
    const wolJwOrgPattern = /^https?:\/\/wol\.jw\.org\/.+/i;

    if (!jwOrgPattern.test(url) && !wolJwOrgPattern.test(url)) {
      return {
        success: false,
        error: {
          type: 'INVALID_URL',
          message: generateErrorMessage('INVALID_URL'),
        },
      };
    }

    // Fetch HTML from the URL
    logger.timeStart('fetch');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    const fetchDuration = logger.timeEnd('fetch');

    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'FETCH_ERROR',
          message: generateErrorMessage('FETCH_ERROR', { stage: 'fetch', timing: fetchDuration, attemptNumber }),
          stage: 'fetch',
          timing: fetchDuration,
          attemptNumber,
        },
      };
    }

    const html = await response.text();

    // Parse HTML with Cheerio
    logger.timeStart('parse');
    const $ = cheerio.load(html);

    // Extract the article title (H1 from header)
    let articleTitle = '';
    const headerH1 = $('header h1');
    if (headerH1.length) {
      articleTitle = headerH1.text().trim();
    }

    // Extract content using fallback selectors
    // Try multiple selectors in order of preference
    const FALLBACK_SELECTORS = [
      '#content.content',  // Primary selector (current)
      '#content',          // Without .content class
      'article',           // Article tag
      '.article-content',  // Alternative class
      'main',              // Main content tag
    ];

    let extractedHtml: string | null = null;
    let usedSelector = '';

    for (const selector of FALLBACK_SELECTORS) {
      const element = $(selector);
      if (element.length) {
        const html = element.html();
        if (html && html.trim()) {
          extractedHtml = html;
          usedSelector = selector;
          break;
        }
      }
    }

    if (!extractedHtml) {
      logger.timeEnd('parse');
      return {
        success: false,
        error: {
          type: 'PARSE_ERROR',
          message: generateErrorMessage('PARSE_ERROR', { stage: 'parse', attemptNumber }),
          stage: 'parse',
          attemptNumber,
        },
      };
    }

    // Log parsing success
    const parseDuration = logger.timeEnd('parse');
    logger.info(`Content found using selector: ${usedSelector}`, { selector: usedSelector, duration: parseDuration });

    // Convert HTML to Markdown with fallback
    logger.timeStart('convert');
    let markdown: string;
    try {
      markdown = convertHtmlToMarkdown(extractedHtml);
      logger.timeEnd('convert');
    } catch (conversionError) {
      logger.warn('Markdown conversion failed, using plain text fallback', { error: conversionError });
      
      // Fallback: strip HTML tags for plain text
      markdown = extractedHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, '') // Remove all HTML tags
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
      
      logger.timeEnd('convert');
      logger.info('Used plain text fallback for conversion');
    }

    // Prepend the article title if found
    if (articleTitle) {
      markdown = `# ${articleTitle}\n\n${markdown}`;
    }

    return {
      success: true,
      html: extractedHtml,
      markdown,
    };

  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      // Check for timeout or network errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          error: {
            type: 'TIMEOUT_ERROR',
            message: generateErrorMessage('TIMEOUT_ERROR', { stage: 'fetch', timing: 10000, attemptNumber }),
            stage: 'fetch',
            timing: 10000,
            attemptNumber,
          },
        };
      }

      // Check for fetch errors
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: {
            type: 'FETCH_ERROR',
            message: generateErrorMessage('FETCH_ERROR', { stage: 'fetch', attemptNumber }),
            stage: 'fetch',
            attemptNumber,
          },
        };
      }
    }

    // Generic error fallback
    return {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: generateErrorMessage('NETWORK_ERROR'),
      },
    };
  }
}

