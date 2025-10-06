import TurndownService from 'turndown';

/**
 * Convert HTML to Markdown with custom rules for JW.org content
 */
export function convertHtmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx', // Use # for headings
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    preformattedCode: false,
  });

  // Remove images completely (text-only focus) - no ![alt] syntax
  turndownService.remove(['img', 'picture', 'figure']);

  // Remove scripts, styles, and other unwanted elements
  turndownService.remove(['script', 'style', 'noscript', 'iframe', 'svg']);

  // Remove navigation, sidebars, and other non-content elements
  turndownService.addRule('removeNav', {
    filter: ['nav', 'header', 'footer', 'aside'],
    replacement: () => '',
  });

  // Remove hidden elements and metadata
  turndownService.addRule('removeHidden', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      const style = element.getAttribute('style') || '';
      return (
        element.classList.contains('hidden') ||
        style.includes('display: none') ||
        style.includes('display:none') ||
        element.getAttribute('aria-hidden') === 'true'
      );
    },
    replacement: () => '',
  });

  // Remove "Your Answer" / "Deine Antwort" textarea fields
  turndownService.addRule('removeAnswerFields', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      // Remove .gen-field divs that contain textareas for reader notes
      return (
        node.nodeName === 'DIV' &&
        element.classList.contains('gen-field')
      );
    },
    replacement: () => '',
  });

  // Handle JW.org specific question boxes (both DIV and P tags)
  turndownService.addRule('questionBox', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      return (
        (node.nodeName === 'DIV' || node.nodeName === 'P') &&
        (element.classList.contains('questionBox') ||
          element.classList.contains('qu') ||
          element.classList.contains('question') ||
          element.classList.contains('q'))
      );
    },
    replacement: (content) => {
      // Format questions cleanly with extra line breaks for separation
      const trimmed = content.trim();
      // Remove excessive bold markers from the question content
      const cleanContent = trimmed.replace(/\*\*/g, '');
      // Add extra line breaks to ensure separation from next element
      return cleanContent ? `\n\n${cleanContent}\n\n` : '';
    },
  });

  // Handle scripture citations (common classes: b, cite, scriptureCitation)
  turndownService.addRule('scriptureCitation', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      return (
        (node.nodeName === 'A' || node.nodeName === 'SPAN') &&
        (element.classList.contains('b') ||
          element.classList.contains('cite') ||
          element.classList.contains('scripture') ||
          element.classList.contains('scriptureCitation'))
      );
    },
    replacement: (content) => {
      // Keep scripture references as plain text (parentheses are enough emphasis)
      const trimmed = content.trim();
      return trimmed || '';
    },
  });

  // Handle paragraph numbers (common in JW.org articles)
  turndownService.addRule('paragraphNumber', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      return (
        (node.nodeName === 'SPAN' || node.nodeName === 'SUP') &&
        (element.classList.contains('parNum') ||
          element.classList.contains('paragraphNumber') ||
          element.classList.contains('pNum'))
      );
    },
    replacement: (content, node) => {
      // ONLY use data-pnum attribute (ignore HTML content which may contain bold/sup tags)
      const element = node as Element;
      const parNum = element.getAttribute('data-pnum');
      
      // Format paragraph numbers inline directly before paragraph text
      // No brackets, no line breaks, just bold number with space after
      return parNum ? `**${parNum}** ` : '';
    },
  });

  // Handle emphasized text (em, i tags)
  turndownService.addRule('emphasis', {
    filter: ['em', 'i'],
    replacement: (content) => {
      const trimmed = content.trim();
      return trimmed ? `*${trimmed}*` : '';
    },
  });

  // Handle strong text (strong, b tags not in scripture citations)
  // Only apply bold to truly important text, not everything
  turndownService.addRule('strong', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      
      // Skip if this strong tag is inside a paragraph number span
      let parent = element.parentElement;
      while (parent) {
        if (
          parent.classList?.contains('parNum') ||
          parent.classList?.contains('paragraphNumber') ||
          parent.classList?.contains('pNum')
        ) {
          return false;
        }
        parent = parent.parentElement;
      }
      
      // Skip if already handled by scripture citation rules
      if (
        element.classList.contains('b') ||
        element.classList.contains('cite') ||
        element.classList.contains('scripture')
      ) {
        return false;
      }
      
      // Only apply bold to actual STRONG tags, not all B tags
      return node.nodeName === 'STRONG';
    },
    replacement: (content) => {
      const trimmed = content.trim();
      // Return plain text instead of bold to reduce ** clutter
      return trimmed || '';
    },
  });

  // Handle blockquotes and quoted text
  turndownService.addRule('blockquote', {
    filter: 'blockquote',
    replacement: (content) => {
      const trimmed = content.trim();
      if (!trimmed) return '';
      // Format as proper markdown blockquote
      const lines = trimmed.split('\n').map(line => `> ${line}`);
      return `\n\n${lines.join('\n')}\n\n`;
    },
  });

  // Handle captions and figure descriptions
  turndownService.addRule('caption', {
    filter: (node) => {
      if (node.nodeType !== 1) return false;
      const element = node as Element;
      return (
        node.nodeName === 'FIGCAPTION' ||
        element.classList.contains('caption') ||
        element.classList.contains('figcaption')
      );
    },
    replacement: (content) => {
      const trimmed = content.trim();
      return trimmed ? `\n\n*${trimmed}*\n\n` : '';
    },
  });

  // Clean up excessive whitespace
  turndownService.addRule('cleanWhitespace', {
    filter: (node) => {
      return node.nodeType === 3; // Text nodes
    },
    replacement: (content) => {
      // Collapse multiple spaces but preserve paragraph breaks
      return content.replace(/\s+/g, ' ');
    },
  });

  // Convert HTML to Markdown
  let markdown = turndownService.turndown(html);

  // Post-processing cleanup
  markdown = markdown
    // Remove any remaining image markdown syntax
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove excessive asterisks (more than 2 consecutive)
    .replace(/\*{3,}/g, '')
    // Fix broken bold markers (** ** -> space)
    .replace(/\*\*\s+\*\*/g, ' ')
    // Remove empty bold markers
    .replace(/\*\*\*\*/g, '')
    // Clean up spaces before punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    // Clean up multiple spaces (before adding line breaks)
    .replace(/ {2,}/g, ' ')
    // Fix spacing around remaining bold/italic markers (but preserve newlines and paragraph numbers!)
    .replace(/\*\* +(?!\d)/g, '**')        // Remove spaces after ** but not before digits (paragraph numbers)
    .replace(/ +\*\*(?!\d)/g, '**')        // Remove spaces before ** but not for paragraph numbers
    .replace(/\* +/g, '*')                 // Remove spaces after * but not newlines
    .replace(/ +\*/g, '*')                 // Remove spaces before * but not newlines
    // CRITICAL: Ensure line breaks after questions (sentences ending with ?)
    // Must run AFTER bold/italic cleanup to work properly
    .replace(/\?(\*\*\d)/g, '?\n\n$1')     // Question directly before paragraph number **2**
    .replace(/\?\s+(\*\*\d)/g, '?\n\n$1')  // Question with spaces before paragraph number
    .replace(/\?([A-Z])/g, '?\n\n$1')      // Question directly before capital letter
    // Ensure proper spacing after list markers
    .replace(/^([-*+])\s*/gm, '$1 ')
    // Clean up blockquote formatting
    .replace(/>\s+$/gm, '>')
    // Remove excessive blank lines (max 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map((line) => {
      // Convert H2 headings from UPPERCASE to normal case (title case)
      if (line.startsWith('## ')) {
        const heading = line.substring(3);
        // Convert all-caps headings to title case
        if (heading === heading.toUpperCase()) {
          const words = heading.toLowerCase().split(' ');
          const titleCase = words.map(word => {
            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');
          return `## ${titleCase}`;
        }
      }
      return line.trimEnd();
    })
    .join('\n')
    // Trim start and end
    .trim();

  return markdown;
}

