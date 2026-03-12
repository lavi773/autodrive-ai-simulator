import { useEffect, useRef, useState } from "react";

const techStack = [
  { name: "React 19 + TypeScript", role: "Frontend UI", color: "#00f5ff" },
  { name: "HTML5 Canvas API", role: "Simulation Engine", color: "#4488ff" },
  { name: "Internet Computer (ICP)", role: "AI Backend", color: "#aa44ff" },
  { name: "Motoko", role: "Decision Logic", color: "#ffcc00" },
  { name: "React Query", role: "State Management", color: "#00ff88" },
  { name: "Tailwind CSS", role: "Styling", color: "#ff6644" },
];

const teamMembers = [
  {
    name: "Autonomous AI Module",
    role: "Decision & Pathfinding",
    initials: "AI",
  },
  {
    name: "Sensor Fusion Engine",
    role: "LiDAR & Camera Processing",
    initials: "SF",
  },
  { name: "Motion Planner", role: "Route Optimization", initials: "MP" },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ background: "#050a12" }}
    >
      {/* Decorative lines */}
      <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />
      <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-neon-green text-xs font-mono mb-4">
            <span className="w-8 h-px bg-neon-green/50" />
            ABOUT PROJECT
            <span className="w-8 h-px bg-neon-green/50" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            BCA Data Science
            <span className="text-neon-cyan"> Final Year Project</span>
          </h2>
          <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto leading-relaxed">
            An immersive, interactive simulation demonstrating core autonomous
            vehicle technology concepts — built as a capstone project for the
            Bachelor of Computer Applications programme, specializing in Data
            Science.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Project Info */}
          <div
            className="lg:col-span-2 p-8 bg-card rounded"
            style={{
              border: "1px solid rgba(0,245,255,0.2)",
              boxShadow: "0 0 40px rgba(0,245,255,0.05)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease",
            }}
          >
            <h3 className="font-display font-bold text-xl text-neon-cyan mb-6">
              Project Overview
            </h3>
            <div className="space-y-4 text-sm font-mono text-muted-foreground leading-relaxed">
              <p>
                AutoDrive AI simulates a real-time autonomous vehicle navigating
                a 2D top-view road environment. The simulation showcases how
                modern self-driving systems combine sensor data, perception
                algorithms, and decision models to safely navigate complex
                traffic scenarios.
              </p>
              <p>
                The AI decision engine is deployed as a canister smart contract
                on the Internet Computer blockchain, demonstrating how
                decentralized AI can power next-generation transportation
                systems with full transparency and auditability.
              </p>
              <p>
                Key algorithms implemented: obstacle proximity detection,
                traffic light state machines, lane-change maneuver planning,
                speed regulation based on road conditions, and real-time
                decision logging for analysis.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Lines of Code", value: "2,500+" },
                { label: "AI Decisions/min", value: "100+" },
                { label: "Simulation FPS", value: "60" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 bg-background rounded border border-border"
                >
                  <div className="font-display font-bold text-xl text-neon-cyan">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div
            className="p-6 bg-card rounded"
            style={{
              border: "1px solid rgba(0,102,255,0.2)",
              boxShadow: "0 0 30px rgba(0,102,255,0.05)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.15s",
            }}
          >
            <h3 className="font-display font-bold text-lg text-neon-blue mb-5">
              Tech Stack
            </h3>
            <div className="space-y-3">
              {techStack.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: t.color,
                      boxShadow: `0 0 6px ${t.color}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-foreground truncate">
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System modules */}
        <div className="mb-16">
          <h3 className="font-display font-bold text-xl text-white mb-6 text-center">
            System Modules
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {teamMembers.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center gap-4 p-4 bg-card rounded border border-border"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s ease ${0.3 + i * 0.1}s`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0"
                  style={{
                    background: "rgba(0,245,255,0.1)",
                    color: "#00f5ff",
                    border: "1px solid rgba(0,245,255,0.3)",
                  }}
                >
                  {m.initials}
                </div>
                <div>
                  <div className="font-mono text-sm text-white font-bold">
                    {m.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="text-center p-6 rounded border"
          style={{
            borderColor: "rgba(0,245,255,0.15)",
            background: "rgba(0,245,255,0.03)",
          }}
        >
          <p className="text-xs font-mono text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            This project is an educational simulation for academic purposes. It
            demonstrates fundamental principles of autonomous vehicle technology
            using web technologies and ICP blockchain infrastructure. Not
            intended for actual vehicle deployment.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-neon-cyan/60">
            <span className="w-4 h-px bg-neon-cyan/40" />
            BCA Data Science · Autonomous Systems Track · 2026
            <span className="w-4 h-px bg-neon-cyan/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
