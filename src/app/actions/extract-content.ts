'use server';

import * as cheerio from 'cheerio';
import type { ExtractionResult } from '@/lib/types';
import { convertHtmlToMarkdown } from '@/lib/markdown-converter';

/**
 * Server Action to extract content from jw.org/wol.jw.org URLs
 * Fetches HTML, parses with Cheerio, extracts the #content div, and converts to Markdown
 */
export async function extractContent(url: string): Promise<ExtractionResult> {
  try {
    // Validate URL format
    const jwOrgPattern = /^https?:\/\/(www\.)?jw\.org\/.+/i;
    const wolJwOrgPattern = /^https?:\/\/wol\.jw\.org\/.+/i;

    if (!jwOrgPattern.test(url) && !wolJwOrgPattern.test(url)) {
      return {
        success: false,
        error: {
          type: 'INVALID_URL',
          message: 'Invalid URL format. Please enter a valid jw.org or wol.jw.org link.',
        },
      };
    }

    // Fetch HTML from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: `The page is not reachable. Status: ${response.status}`,
        },
      };
    }

    const html = await response.text();

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract the article title (H1 from header)
    let articleTitle = '';
    const headerH1 = $('header h1');
    if (headerH1.length) {
      articleTitle = headerH1.text().trim();
    }

    // Extract the #content div
    const contentDiv = $('#content.content');

    if (!contentDiv.length) {
      return {
        success: false,
        error: {
          type: 'CONTENT_NOT_FOUND',
          message: 'Content could not be loaded. The page structure may have changed.',
        },
      };
    }

    // Get the HTML content
    const extractedHtml = contentDiv.html();

    if (!extractedHtml) {
      return {
        success: false,
        error: {
          type: 'CONTENT_NOT_FOUND',
          message: 'Content could not be loaded. The #content div is empty.',
        },
      };
    }

    // Convert HTML to Markdown
    let markdown = convertHtmlToMarkdown(extractedHtml);

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
            type: 'NETWORK_ERROR',
            message: 'The page is not reachable. Request timed out.',
          },
        };
      }

      // Check for fetch errors
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: {
            type: 'NETWORK_ERROR',
            message: 'The page is not reachable. Please check your internet connection.',
          },
        };
      }
    }

    // Generic error fallback
    return {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    };
  }
}

