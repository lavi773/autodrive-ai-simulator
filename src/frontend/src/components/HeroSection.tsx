import { useEffect, useRef } from "react";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: 5 + i * 5,
  top: 10 + (i % 5) * 20,
  dur: 2 + (i % 3),
  delay: i * 0.3,
}));

export default function HeroSection() {
  const carRef = useRef<HTMLDivElement>(null);

  // Animated car svg
  useEffect(() => {
    let frame = 0;
    let raf: number;
    const animate = () => {
      frame++;
      if (carRef.current) {
        const y = Math.sin(frame * 0.02) * 8;
        carRef.current.style.transform = `translateY(${y}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-autodrive.dim_1200x600.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />

      {/* Animated scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent pointer-events-none"
        style={{ animation: "scan-line 4s linear infinite" }}
      />

      {/* Particle dots */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute w-1 h-1 bg-neon-cyan/30 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `pulse-glow ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-neon-cyan/30 rounded-full bg-neon-cyan/5 text-neon-cyan text-xs font-mono">
          <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
          BCA DATA SCIENCE · FINAL YEAR PROJECT · 2026
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black mb-4 leading-tight">
          <span
            className="block text-white animate-float-up"
            style={{ animationDelay: "0s" }}
          >
            Autonomous
          </span>
          <span
            className="block text-transparent bg-clip-text animate-float-up"
            style={{
              animationDelay: "0.15s",
              backgroundImage:
                "linear-gradient(135deg, #00f5ff 0%, #0066ff 50%, #00ff88 100%)",
              backgroundSize: "200% 200%",
              animation:
                "float-up 0.8s ease-out 0.15s both, gradient-x 4s ease infinite",
            }}
          >
            Intelligence
          </span>
          <span
            className="block text-white/80 text-3xl sm:text-4xl md:text-5xl font-normal animate-float-up"
            style={{ animationDelay: "0.3s" }}
          >
            on the Road
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 font-mono leading-relaxed animate-float-up"
          style={{ animationDelay: "0.45s" }}
        >
          A real-time autonomous driving simulator powered by AI decision logic.
          Watch neural networks navigate traffic, avoid obstacles, and make
          split-second decisions.
        </p>

        {/* CTA buttons */}
        <div
          className="flex items-center justify-center gap-4 flex-wrap animate-float-up"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            href="#simulation"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-neon-cyan text-background font-display font-bold text-sm rounded overflow-hidden transition-all duration-300 hover:scale-105"
            style={{ boxShadow: "0 0 30px #00f5ff55, 0 0 60px #00f5ff22" }}
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Start Simulation
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 border border-neon-cyan/40 text-neon-cyan font-mono text-sm rounded transition-all duration-300 hover:bg-neon-cyan/10 hover:border-neon-cyan/60"
          >
            How It Works
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* Animated car icon */}
        <div
          ref={carRef}
          className="mt-16 flex justify-center"
          style={{ transition: "transform 0.1s ease" }}
        >
          <div className="relative">
            {/* Radar rings */}
            {[1, 2, 3].map((i) => (
              <div
                key={`radar-ring-${i}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-cyan/30"
                style={{
                  width: `${i * 60}px`,
                  height: `${i * 60}px`,
                  animation: `radar-pulse 2s ease-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
            {/* Car top view SVG */}
            <svg
              aria-hidden="true"
              width="48"
              height="72"
              viewBox="0 0 48 72"
              fill="none"
            >
              <rect
                x="8"
                y="4"
                width="32"
                height="64"
                rx="8"
                fill="#00f5ff"
                opacity="0.15"
              />
              <rect
                x="8"
                y="4"
                width="32"
                height="64"
                rx="8"
                stroke="#00f5ff"
                strokeWidth="1.5"
              />
              <rect
                x="12"
                y="12"
                width="24"
                height="28"
                rx="4"
                fill="#00f5ff"
                opacity="0.3"
              />
              <rect
                x="4"
                y="16"
                width="6"
                height="12"
                rx="2"
                fill="#00f5ff"
                opacity="0.5"
              />
              <rect
                x="38"
                y="16"
                width="6"
                height="12"
                rx="2"
                fill="#00f5ff"
                opacity="0.5"
              />
              <rect
                x="4"
                y="52"
                width="6"
                height="12"
                rx="2"
                fill="#ff2244"
                opacity="0.8"
              />
              <rect
                x="38"
                y="52"
                width="6"
                height="12"
                rx="2"
                fill="#ff2244"
                opacity="0.8"
              />
              <circle cx="24" cy="36" r="4" fill="#00f5ff" opacity="0.6" />
              <line
                x1="24"
                y1="4"
                x2="24"
                y2="0"
                stroke="#00f5ff"
                strokeWidth="1"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-12 flex items-center justify-center gap-8 sm:gap-16 flex-wrap animate-float-up"
          style={{ animationDelay: "0.75s" }}
        >
          {[
            { label: "AI Decisions/sec", value: "60" },
            { label: "Sensor Range", value: "200m" },
            { label: "Reaction Time", value: "<10ms" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-neon-cyan text-glow-cyan">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">
          SCROLL DOWN
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-neon-cyan/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
