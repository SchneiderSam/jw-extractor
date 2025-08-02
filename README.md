# JW Content Extractor

A modern web application built with Next.js 15 that extracts and converts JW.org content into well-formatted Markdown. This tool is specifically designed to help users transform online content from wol.jw.org into clean, structured Markdown format.

## Features

- **Smart Content Extraction**: Automatically extracts content from JW.org articles while removing unnecessary elements like navigation, footers, and study prompts
- **Intelligent Formatting**:
  - Converts headings with proper hierarchy (Hauptthema/Unterthema)
  - Automatically detects and formats questions ("Frage: ...")
  - Properly formats paragraphs ("Absatz: ...")
  - Maintains clean spacing and structure
- **User-Friendly Interface**:
  - Modern, responsive design using Radix UI components
  - Real-time error handling and validation
  - Copy-to-clipboard functionality
  - Loading states and toast notifications
  - Helpful tooltips and instructions

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: 
  - Radix UI Themes
  - shadcn/ui components
- **Content Processing**:
  - JSDOM for HTML parsing
  - Turndown for HTML to Markdown conversion
- **Styling**: Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to the WT Extractor page
2. Paste a valid wol.jw.org URL into the input field
3. Click "Extract Content" or press Enter
4. The converted Markdown content will appear in the right panel
5. Use the copy button to copy the formatted content to your clipboard

## Project Structure

- `/src/app/wt-extractor`: Main extractor page component
- `/src/app/api/parse-jw`: API route for content parsing
- `/src/components/ui`: Reusable UI components
- `/src/lib`: Utility functions and helpers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT license.
