import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

interface ParseJWRequest {
  url: string;
}

interface ParseJWResponse {
  success: boolean;
  markdown?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ParseJWResponse>> {
  try {
    const { url }: ParseJWRequest = await request.json();

    // Validate URL format
    if (!url || !url.includes('wol.jw.org')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JW.org URL provided'
      });
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch content: ${response.status} ${response.statusText}`
      });
    }

    const html = await response.text();

    // Parse HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Find the article element
    const articleElement = document.querySelector('article#article');
    if (!articleElement) {
      return NextResponse.json({
        success: false,
        error: 'Could not find article content on the page'
      });
    }

    // Clean up the content - remove navigation, footer, and other unwanted elements
    const unwantedSelectors = [
      'nav',
      'footer', 
      '.header',
      '.navigation',
      '.breadcrumb',
      '.sidebar',
      'script',
      'style',
      '.advertisement',
      '.social-share',
      '.pagenavBox',
      '.contextNav',
      '.pubNavigation',
      '.studyNotesNav',
      '.audioPlayer',
      '.videoPlayer',
      '.relatedContent',
      '.studyNotes'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = articleElement.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Remove elements containing study prompts like "Deine Antwort" or "Your Answer"
    const studyPrompts = [
      'Deine Antwort',
      'Your Answer',
      'Votre réponse',
      'Su respuesta',
      'Sua resposta',
      'La tua risposta',
      'あなたの答え',
      '당신의 대답'
    ];

    // Find and remove elements containing these phrases
    const allElements = articleElement.querySelectorAll('*');
    allElements.forEach(element => {
      const textContent = element.textContent?.trim() || '';
      
      // Check if element contains any of the study prompts
      const containsPrompt = studyPrompts.some(prompt => 
        textContent.toLowerCase().includes(prompt.toLowerCase())
      );
      
      if (containsPrompt) {
        // Check if this is a small element (likely just the prompt)
        const isSmallElement = textContent.length < 100;
        
        if (isSmallElement) {
          element.remove();
        } else {
          // For larger elements, try to remove just the prompt text
          studyPrompts.forEach(prompt => {
            if (textContent.includes(prompt)) {
              element.innerHTML = element.innerHTML.replace(
                new RegExp(prompt, 'gi'), 
                ''
              );
            }
          });
        }
      }
    });

    // Configure Turndown for HTML to Markdown conversion
    const turndownService = new TurndownService({
      headingStyle: 'atx', // Use # style headings
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined'
    });

    // Custom rule for proper heading mapping
    turndownService.addRule('properHeadings', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function (content, node) {
        const tagName = node.nodeName.toLowerCase();
        const level = parseInt(tagName.charAt(1));
        const hashes = '#'.repeat(level);
        
        // Clean up content - remove extra whitespace and line breaks
        const cleanContent = content.trim().replace(/\s+/g, ' ');
        
        // Apply the mapping for German headings
        let mappedContent = cleanContent;
        if (level === 1 && cleanContent && !cleanContent.includes('Hauptthema')) {
          mappedContent = `Hauptthema: ${cleanContent}`;
        } else if (level === 2 && cleanContent && !cleanContent.includes('Unterthema')) {
          mappedContent = `Unterthema: ${cleanContent}`;
        } else {
          mappedContent = cleanContent;
        }
        
        // Ensure proper spacing around headings
        return mappedContent ? `\n\n${hashes} ${mappedContent}\n\n` : '';
      }
    });

    // Custom rule for preserving paragraphs
    turndownService.addRule('preserveParagraphs', {
      filter: 'p',
      replacement: function (content) {
        return content ? `\n\n${content}\n\n` : '';
      }
    });

    // Custom rule for lists
    turndownService.addRule('preserveLists', {
      filter: ['ul', 'ol'],
      replacement: function (content) {
        return `\n\n${content}\n\n`;
      }
    });

    // Final cleanup - remove empty elements
    const emptyElements = articleElement.querySelectorAll('*');
    emptyElements.forEach(element => {
      const text = element.textContent?.trim() || '';
      const hasChildren = element.children.length > 0;
      
      // Remove elements that are empty or only contain whitespace
      if (!text && !hasChildren) {
        element.remove();
      }
    });

    // Convert the article content to Markdown
    const markdown = turndownService.turndown(articleElement.innerHTML);

    // Clean up extra whitespace and normalize line breaks
    let cleanedMarkdown = markdown
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize spacing
      .replace(/^[\s\n]*|[\s\n]*$/g, '') // Trim leading/trailing whitespace
      .replace(/\*\*\s*\*\*/g, '') // Remove empty bold formatting
      .replace(/\*\s*\*/g, '') // Remove empty italic formatting
      // Fix headings that got concatenated with following content
      .replace(/(#{1,6}\s+[^#\n]+?)(\d+\.\s)/g, '$1\n\n$2'); // Add line break between heading and numbered content

    // Post-process to add Question: and Absatz: prefixes
    cleanedMarkdown = cleanedMarkdown.replace(/^(\d+)\.\s+(.+?)$/gm, (match, number, text) => {
      // Check if it's a question (ends with ? or common question words)
      const isQuestion = (
        text.endsWith('?') ||
        /^Was (?:können|denken|lernen|bedeutet|ist|sind|war|waren|sollten|würden)/i.test(text) ||
        /^Wie (?:können|würden|sollten|ist|sind|war|waren|kann)/i.test(text) ||
        /^Warum (?:ist|sind|sollten|können|war|waren|haben|hatte)/i.test(text) ||
        /^Welche (?:Lehren|Grundsätze|Rolle|Art|Bedeutung)/i.test(text) ||
        /^Wer (?:war|ist|sind|kann|könnte|sollte)/i.test(text) ||
        /^Wo (?:ist|sind|war|waren|können|sollten)/i.test(text) ||
        /^Wann (?:ist|war|werden|sollten|können)/i.test(text) ||
        /^What (?:does|can|would|should|is|are|was|were)/i.test(text) ||
        /^How (?:can|would|should|is|are|was|were|does)/i.test(text) ||
        /^Why (?:is|are|should|would|was|were|do|does)/i.test(text) ||
        /^Which (?:principles|lessons|role|kind|meaning)/i.test(text) ||
        /^Who (?:was|is|are|can|could|should)/i.test(text) ||
        /^Where (?:is|are|was|were|can|should)/i.test(text) ||
        /^When (?:is|was|will|should|can)/i.test(text)
      );

      // Check if it's a paragraph reference (short text, often just references)
      const isParagraphRef = (
        text.length < 50 &&
        (/(?:siehe|lesen|vergleiche|vgl\.)/i.test(text) ||
         /(?:see|read|compare|cf\.)/i.test(text) ||
         /^\w+\s+\d+[:\d]*[-–—]\d*[:\d]*/.test(text) || // Bible references
         /^[A-Z][a-z]+\s+\d+/.test(text)) // Book chapter patterns
      );

      if (isQuestion) {
        return `Frage: ${number}. ${text}`;
      } else if (isParagraphRef) {
        return `Absatz: ${number}. ${text}`;
      }
      
      // For longer content that's not clearly a question, assume it's a paragraph
      if (text.length > 100 && !isQuestion) {
        return `Absatz: ${number}. ${text}`;
      }
      
      return match; // Keep original if unsure
    });

    return NextResponse.json({
      success: true,
      markdown: cleanedMarkdown
    });

  } catch (error) {
    console.error('Error parsing JW content:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}