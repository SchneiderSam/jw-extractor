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
  Card
} from '@radix-ui/themes';
import { MagnifyingGlassIcon, CopyIcon } from '@radix-ui/react-icons';

export default function WTExtractorPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleCopy = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="8" mb="2">WT Extractor</Heading>
      </Box>
      
      <Flex gap="6" direction={{ initial: 'column', md: 'row' }} style={{ minHeight: '70vh' }}>
        {/* Left Column - Input TextField */}
        <Box style={{ flex: '1' }}>
          <Card p="4" style={{ height: '100%' }}>
            <Box mb="3">
              <Heading size="4" mb="3">Input</Heading>
            </Box>
            <TextField.Root
              size="3"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </Card>
        </Box>

        {/* Right Column - Output TextArea and Copy Button */}
        <Box style={{ flex: '1' }}>
          <Card p="4" style={{ height: '100%' }}>
            <Box mb="3">
              <Heading size="4" mb="3">Output</Heading>
            </Box>
            <Flex direction="column" gap="3" style={{ height: 'calc(100% - 80px)' }}>
              <TextArea
                size="3"
                placeholder="Extracted text will appear here..."
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                style={{ 
                  minHeight: '400px',
                  flex: '1',
                  resize: 'vertical'
                }}
              />
              <Button
                size="3"
                variant="soft"
                onClick={handleCopy}
                disabled={!outputText}
              >
                <CopyIcon width="16" height="16" />
                Copy to Clipboard
              </Button>
            </Flex>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
}