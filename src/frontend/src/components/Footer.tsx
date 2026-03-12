export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 relative">
            <div className="absolute inset-0 bg-neon-cyan/20 rounded-sm rotate-45" />
            <div className="absolute inset-1 bg-neon-cyan rounded-sm rotate-45" />
          </div>
          <span className="font-display font-bold text-sm text-neon-cyan">
            AutoDrive AI
          </span>
        </div>
        <p className="text-xs font-mono text-muted-foreground text-center">
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
          System v1.0.0
        </div>
      </div>
    </footer>
  );
}
