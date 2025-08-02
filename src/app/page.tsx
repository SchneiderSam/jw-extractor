import Link from "next/link";
import { 
  Container, 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button 
} from '@radix-ui/themes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRightIcon, FileTextIcon, Link2Icon } from '@radix-ui/react-icons';

export default function Home() {
  return (
    <Container size="4" className="min-h-screen">
      <Flex direction="column" align="center" justify="center" gap="6" style={{ minHeight: '100vh', padding: '2rem 0' }}>
        {/* Header Section */}
        <Box className="text-center" mb="4">
          <Heading size="9" mb="3" style={{ fontWeight: 'bold' }}>
            JW Extractor
          </Heading>
          <Text size="5" style={{ color: 'var(--gray-11)', maxWidth: '600px', lineHeight: '1.6' }}>
            Extract and convert JW.org content to clean, formatted Markdown for easy reading and sharing
          </Text>
        </Box>

        {/* Feature Cards */}
        <Flex gap="4" direction={{ initial: 'column', md: 'row' }} style={{ maxWidth: '800px', width: '100%' }} mb="6">
          <Card className="flex-1">
            <CardHeader className="text-center">
              <Flex direction="column" align="center" gap="3">
                <FileTextIcon width="32" height="32" style={{ color: 'var(--blue-9)' }} />
                <CardTitle>Content Extraction</CardTitle>
              </Flex>
            </CardHeader>
            <CardContent>
              <Text size="2" style={{ color: 'var(--gray-11)', textAlign: 'center', lineHeight: '1.5' }}>
                Automatically extract text content from JW.org articles and convert them to clean Markdown format
              </Text>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="text-center">
              <Flex direction="column" align="center" gap="3">
                <Link2Icon width="32" height="32" style={{ color: 'var(--green-9)' }} />
                <CardTitle>Simple URL Input</CardTitle>
              </Flex>
            </CardHeader>
            <CardContent>
              <Text size="2" style={{ color: 'var(--gray-11)', textAlign: 'center', lineHeight: '1.5' }}>
                Just paste any JW.org URL and get formatted content with proper headings, paragraphs, and structure
              </Text>
            </CardContent>
          </Card>
        </Flex>

        {/* CTA Section */}
        <Box className="text-center">
          <Link href="/wt-extractor" passHref>
            <Button size="4" style={{ fontSize: '16px', padding: '12px 24px' }}>
              <Flex align="center" gap="2">
                Start Extracting Content
                <ArrowRightIcon width="16" height="16" />
              </Flex>
            </Button>
          </Link>
          
          <Text size="2" style={{ color: 'var(--gray-10)', marginTop: '1rem', display: 'block' }}>
            Transform JW.org articles into readable Markdown format
          </Text>
        </Box>

        {/* Footer */}
        <Box style={{ marginTop: 'auto', paddingTop: '3rem' }}>
          <Text size="1" style={{ color: 'var(--gray-9)', textAlign: 'center' }}>
            Built for extracting and formatting JW.org content
          </Text>
        </Box>
      </Flex>
    </Container>
  );
}
