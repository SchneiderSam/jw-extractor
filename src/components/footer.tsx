export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-2">
        <p className="text-xs text-muted-foreground text-center">
          Entwickelt von{' '}
          <a
            href="https://github.com/SchneiderSam"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Samuel Schneider
          </a>
        </p>
      </div>
    </footer>
  );
}

