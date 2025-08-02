'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  TextArea, 
  Button, 
  Container, 
  Flex, 
  Heading,
  Callout
} from '@radix-ui/themes';
import { SymbolIcon, CopyIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ParseJWResponse {
  success: boolean;
  markdown?: string;
  error?: string;
}

export default function WTExtractorPage() {
  const [inputUrl, setInputUrl] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJWUrl = async () => {
    if (!inputUrl.trim()) {
      setError('Please enter a JW.org URL');
      return;
    }

    // Validate URL format
    if (!inputUrl.includes('wol.jw.org')) {
      setError('Please enter a valid JW.org URL (must contain wol.jw.org)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const response = await fetch('/api/parse-jw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data: ParseJWResponse = await response.json();

      if (data.success && data.markdown) {
        setOutputText(data.markdown);
        toast.success('Content extracted successfully!');
      } else {
        setError(data.error || 'Failed to parse the URL');
      }
    } catch (err) {
      setError('Network error: Failed to connect to the server');
      console.error('Error parsing JW URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText);
        toast.success('Markdown copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="8" mb="2">JW Content Extractor</Heading>
        <p style={{ color: 'var(--gray-11)', marginBottom: '1rem' }}>
          Extract and convert JW.org content to Markdown format
        </p>
      </Box>
      
      <Flex gap="6" direction={{ initial: 'column', md: 'row' }} style={{ minHeight: '70vh' }}>
        {/* Left Column - URL Input */}
        <Box style={{ flex: '1' }}>
          <Card className="h-full">
            <CardHeader>
              <Flex align="center" gap="2">
                <CardTitle>JW.org URL</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoCircledIcon style={{ color: 'var(--gray-9)', cursor: 'help' }} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div style={{ maxWidth: '300px' }}>
                      <p><strong>Content will be converted with proper formatting:</strong></p>
                      <ul style={{ marginTop: '8px', paddingLeft: '16px' }}>
                        <li>h1 → # Hauptthema, h2 → ## Unterthema</li>
                        <li>Questions → "Frage: 6. Was können wir lernen?"</li>
                        <li>Paragraphs → "Absatz: 1. Der erste Punkt erklärt..."</li>
                        <li>Study prompts like "Deine Antwort" will be filtered out</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </Flex>
              <p style={{ color: 'var(--gray-11)', fontSize: '14px' }}>
                Enter a JW.org URL (e.g., https://wol.jw.org/de/wol/d/r10/lp-x/2025403)
              </p>
            </CardHeader>
            <CardContent>
            
            <Flex direction="column" gap="3">
              <TextField.Root
                size="3"
                placeholder="https://wol.jw.org/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    parseJWUrl();
                  }
                }}
              >
                <TextField.Slot>
                  <SymbolIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
              
              <Button
                size="3"
                onClick={parseJWUrl}
                disabled={isLoading || !inputUrl.trim()}
                style={{ alignSelf: 'flex-start' }}
              >
                {isLoading ? 'Extracting...' : 'Extract Content'}
              </Button>
              
              {error && (
                <Callout.Root color="red" size="1">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}
            </Flex>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Markdown Output */}
        <Box style={{ flex: '1' }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Markdown Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex direction="column" gap="3" style={{ height: 'calc(100vh - 300px)' }}>
              <TextArea
                size="3"
                placeholder="Extracted markdown content will appear here..."
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                style={{ 
                  minHeight: '400px',
                  flex: '1',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--gray-2)',
                  border: '1px solid var(--gray-6)'
                }}
                readOnly={isLoading}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="3"
                    variant="soft"
                    onClick={handleCopy}
                    disabled={!outputText || isLoading}
                  >
                    <CopyIcon width="16" height="16" />
                    Copy Markdown
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy the formatted markdown content to clipboard</p>
                </TooltipContent>
              </Tooltip>
              </Flex>
            </CardContent>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
}