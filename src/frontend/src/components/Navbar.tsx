import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home", ocid: "nav.home.link" },
  { label: "Simulation", href: "#simulation", ocid: "nav.simulation.link" },
  { label: "How It Works", href: "#how-it-works", ocid: "nav.howitworks.link" },
  { label: "About", href: "#about", ocid: "nav.about.link" },
];

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ["home", "simulation", "how-it-works", "about"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-neon-cyan/20 shadow-[0_0_30px_rgba(0,245,255,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 bg-neon-cyan/20 rounded-sm rotate-45" />
              <div className="absolute inset-1 bg-neon-cyan/40 rounded-sm rotate-45" />
              <div className="absolute inset-2 bg-neon-cyan rounded-sm rotate-45" />
            </div>
            <span className="font-display font-bold text-lg text-neon-cyan text-glow-cyan animate-neon-flicker">
              AutoDrive<span className="text-white"> AI</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid={link.ocid}
                  className={`relative px-4 py-2 text-sm font-mono transition-all duration-200 ${
                    isActive
                      ? "text-neon-cyan text-glow-cyan"
                      : "text-foreground/70 hover:text-neon-cyan"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-neon-cyan/5 border border-neon-cyan/20 rounded" />
                  )}
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-cyan rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neon-green">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            SYSTEM ONLINE
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-neon-cyan"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-neon-cyan transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-6 h-0.5 bg-neon-cyan transition-all ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-6 h-0.5 bg-neon-cyan transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-neon-cyan/20">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-ocid={link.ocid}
                className="block px-4 py-3 text-sm font-mono text-foreground/80 hover:text-neon-cyan"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
