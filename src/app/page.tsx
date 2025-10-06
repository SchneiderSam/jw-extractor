'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Download, Copy, Check, Loader2 } from 'lucide-react';
import { extractContent } from './actions/extract-content';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [extractedHtml, setExtractedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to extract
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (url && !error && !isLoading) {
          handleExtract();
        }
      }
      // Ctrl/Cmd + K to copy (when markdown is present)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (markdown && !isLoading) {
          handleCopy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, error, isLoading, markdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // Regex to validate jw.org and wol.jw.org URLs
  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setError('');
      return false;
    }

    const jwOrgPattern = /^https?:\/\/(www\.)?jw\.org\/.+/i;
    const wolJwOrgPattern = /^https?:\/\/wol\.jw\.org\/.+/i;

    if (!jwOrgPattern.test(urlString) && !wolJwOrgPattern.test(urlString)) {
      setError('Invalid URL format. Please enter a valid jw.org or wol.jw.org link.');
      return false;
    }

    setError('');
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const handleClear = () => {
    setUrl('');
    setError('');
    setMarkdown('');
    setExtractedHtml('');
    setIsCopied(false);
  };

  const handleCopy = async () => {
    if (!markdown) return;

    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      toast.success('Copied to clipboard!', {
        description: 'Markdown content has been copied successfully.',
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy', {
        description: 'Please try again or copy manually.',
      });
    }
  };

  const handleExtract = async () => {
    if (!validateUrl(url)) {
      return;
    }

    setIsLoading(true);
    setError('');
    setMarkdown('');
    setExtractedHtml('');

    try {
      const result = await extractContent(url);

      if (result.success && result.markdown) {
        setExtractedHtml(result.html || '');
        setMarkdown(result.markdown);
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Theme Toggle */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1 text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              JW Content Extractor
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Extract clean Markdown content from jw.org and wol.jw.org articles
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* URL Input Section */}
        <section className="space-y-2" aria-labelledby="url-input-label">
          <label id="url-input-label" htmlFor="url-input" className="text-sm font-medium">
            Article URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="url-input"
                type="url"
                placeholder="https://wol.jw.org/en/wol/..."
                value={url}
                onChange={handleUrlChange}
                className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                aria-invalid={!!error}
                aria-describedby={error ? "url-error" : undefined}
                autoComplete="url"
              />
              {url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClear}
                  type="button"
                  aria-label="Clear URL input"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
            <Button
              onClick={handleExtract}
              disabled={!url || !!error || isLoading}
              className="shrink-0"
              aria-label="Extract content from URL"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Extracting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Extract
                </>
              )}
            </Button>
          </div>
          {error && (
            <p id="url-error" className="text-sm text-red-500 font-medium" role="alert">
              {error}
            </p>
          )}
        </section>

        {/* Keyboard Shortcuts Help */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd> to extract • {' '}
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">K</kbd> to copy
          </p>
        </div>

        {/* Markdown Output Section */}
        {(markdown || isLoading) && (
          <section className="space-y-2" aria-labelledby="markdown-output-label" aria-live="polite">
            <div className="flex items-center justify-between">
              <label id="markdown-output-label" htmlFor="markdown-output" className="text-sm font-medium">
                {isLoading ? 'Extracting Content...' : 'Extracted Markdown'}
              </label>
              {markdown && !isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                  aria-label={isCopied ? "Markdown copied to clipboard" : "Copy markdown to clipboard"}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-4/5 mt-2" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </div>
                <div className="pt-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
              </div>
            ) : (
              <Textarea
                id="markdown-output"
                placeholder="Your extracted content will appear here..."
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                aria-label="Extracted markdown content (editable)"
                spellCheck="false"
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}
