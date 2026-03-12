import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: "📡",
    title: "Sensors & Radar",
    subtitle: "Step 01",
    color: "#00f5ff",
    description:
      "LiDAR, cameras, radar, and ultrasonic sensors continuously scan a 360° field. The car perceives its environment in real-time up to 200 meters away.",
    detail: "Range: 200m · Scan rate: 10Hz · Accuracy: ±2cm",
  },
  {
    icon: "👁️",
    title: "Perception",
    subtitle: "Step 02",
    color: "#4488ff",
    description:
      "Deep neural networks classify objects — cars, pedestrians, signs, lane markings. Each detection is assigned a confidence score and tracked over time.",
    detail: "Objects detected: 250+ types · Confidence: >97%",
  },
  {
    icon: "🗺️",
    title: "Path Planning",
    subtitle: "Step 03",
    color: "#aa44ff",
    description:
      "A motion planner calculates safe routes using HD maps, real-time obstacles, traffic rules, and predicted paths of other road users.",
    detail: "Horizon: 5s · Update rate: 20Hz · A* + Bezier curves",
  },
  {
    icon: "🤖",
    title: "AI Decision",
    subtitle: "Step 04",
    color: "#ffcc00",
    description:
      "The decision module selects actions: GO, SLOW DOWN, CHANGE LANE, or STOP. It balances safety, comfort, and efficiency using reinforcement learning.",
    detail: "Latency: <10ms · Actions: 4 primary states",
  },
  {
    icon: "⚙️",
    title: "Vehicle Control",
    subtitle: "Step 05",
    color: "#00ff88",
    description:
      "Control signals are sent to throttle, brakes, and steering. A PID controller ensures smooth acceleration and precise lane-following.",
    detail: "Steering precision: 0.1° · Brake response: 5ms",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex-1 min-w-[220px] max-w-[260px] p-6 rounded bg-card border border-border transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 0.12}s`,
        borderColor: `${step.color}30`,
      }}
    >
      {/* Number */}
      <div
        className="absolute top-4 right-4 font-display font-black text-4xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ color: step.color }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 30px ${step.color}15`,
          border: `1px solid ${step.color}50`,
        }}
      />

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `${step.color}15`,
          border: `1px solid ${step.color}30`,
        }}
      >
        {step.icon}
      </div>

      {/* Subtitle */}
      <div
        className="text-xs font-mono mb-1"
        style={{ color: `${step.color}80` }}
      >
        {step.subtitle}
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-lg text-white mb-3">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-3">
        {step.description}
      </p>

      {/* Technical detail */}
      <div
        className="text-xs font-mono px-2 py-1.5 rounded"
        style={{
          background: `${step.color}10`,
          color: `${step.color}cc`,
          border: `1px solid ${step.color}20`,
        }}
      >
        {step.detail}
      </div>

      {/* Connector line (except last) */}
      {index < steps.length - 1 && (
        <div
          className="hidden xl:block absolute -right-4 top-1/2 w-8 h-px z-10"
          style={{
            background: `linear-gradient(to right, ${step.color}60, ${steps[index + 1].color}60)`,
          }}
        />
      )}
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-neon-blue text-xs font-mono mb-4">
            <span className="w-8 h-px bg-neon-blue/50" />
            TECHNOLOGY
            <span className="w-8 h-px bg-neon-blue/50" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            How <span className="text-neon-cyan">Self-Driving</span> Works
          </h2>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto leading-relaxed">
            Five interconnected systems working in perfect harmony, making
            thousands of decisions per second to navigate safely.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-wrap justify-center gap-6 xl:gap-4">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>

        {/* ML explanation */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div
            className="p-6 bg-card border border-neon-cyan/20 rounded"
            style={{ boxShadow: "0 0 30px rgba(0,245,255,0.05)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-neon-cyan/20 rounded flex items-center justify-center text-neon-cyan text-sm">
                🧠
              </div>
              <h3 className="font-display font-bold text-white">
                Machine Learning Core
              </h3>
            </div>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              The autonomous system uses a combination of supervised learning
              (trained on millions of driving miles), reinforcement learning
              (reward for safe/efficient driving), and imitation learning
              (learning from human expert drivers). Neural networks with 50+
              layers process sensor fusion data in real-time.
            </p>
          </div>
          <div
            className="p-6 bg-card border border-neon-green/20 rounded"
            style={{ boxShadow: "0 0 30px rgba(0,255,136,0.05)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-neon-green/20 rounded flex items-center justify-center text-neon-green text-sm">
                📊
              </div>
              <h3 className="font-display font-bold text-white">
                Decision Logic (ICP Backend)
              </h3>
            </div>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              This simulation's AI backend runs on the Internet Computer
              Protocol. The Motoko canister evaluates speed, obstacle proximity,
              traffic light state, and lane availability to produce one of four
              actions — achieving sub-10ms decision latency with full on-chain
              auditability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
