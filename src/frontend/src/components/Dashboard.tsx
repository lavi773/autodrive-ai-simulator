import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { useDecisionLog, useResetLog, useStats } from "../hooks/useQueries";

interface DecisionEntry {
  distanceToObstacle: number;
  action: string;
  speed: number;
  timestamp: bigint;
  reason: string;
}

interface StatsData {
  slowDownCount: bigint;
  totalDecisions: bigint;
  stopCount: bigint;
  changeLaneCount: bigint;
  goCount: bigint;
}

interface DashboardProps {
  speed: number;
  distance: number;
  decision: { action: string; reason: string };
}

const ACTION_STYLES: Record<
  string,
  { bg: string; text: string; shadow: string; label: string }
> = {
  STOP: {
    bg: "rgba(255,34,68,0.15)",
    text: "#ff2244",
    shadow: "0 0 20px rgba(255,34,68,0.4)",
    label: "⏹ STOP",
  },
  SLOW_DOWN: {
    bg: "rgba(255,204,0,0.15)",
    text: "#ffcc00",
    shadow: "0 0 20px rgba(255,204,0,0.4)",
    label: "⬇ SLOW DOWN",
  },
  CHANGE_LANE: {
    bg: "rgba(0,102,255,0.15)",
    text: "#4488ff",
    shadow: "0 0 20px rgba(0,102,255,0.4)",
    label: "↔ CHANGE LANE",
  },
  GO: {
    bg: "rgba(0,255,136,0.15)",
    text: "#00ff88",
    shadow: "0 0 20px rgba(0,255,136,0.4)",
    label: "▶ GO",
  },
};

function SpeedGauge({ speed }: { speed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 + 10;
    const r = W / 2 - 12;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const progress = speed / 100;
    const angle = startAngle + (endAngle - startAngle) * progress;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Speed arc gradient
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    if (speed > 70) {
      grad.addColorStop(0, "#00ff88");
      grad.addColorStop(0.5, "#ffcc00");
      grad.addColorStop(1, "#ff2244");
    } else if (speed > 30) {
      grad.addColorStop(0, "#00f5ff");
      grad.addColorStop(1, "#ffcc00");
    } else {
      grad.addColorStop(0, "#00f5ff");
      grad.addColorStop(1, "#00ff88");
    }

    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, angle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.shadowColor = "#00f5ff";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const tickAngle = startAngle + ((endAngle - startAngle) * i) / 10;
      const inner = i % 5 === 0 ? r - 14 : r - 8;
      const outer = r - 2;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(tickAngle) * inner,
        cy + Math.sin(tickAngle) * inner,
      );
      ctx.lineTo(
        cx + Math.cos(tickAngle) * outer,
        cy + Math.sin(tickAngle) * outer,
      );
      ctx.strokeStyle =
        i % 5 === 0 ? "rgba(0,245,255,0.6)" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Needle
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * (r - 18),
      cy + Math.sin(angle) * (r - 18),
    );
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 8;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#00f5ff";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [speed]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={130} height={100} className="block" />
      <div className="font-display font-bold text-2xl text-neon-cyan text-glow-cyan -mt-4">
        {speed}
      </div>
      <div className="text-xs font-mono text-muted-foreground">km/h</div>
    </div>
  );
}

function DistanceBar({ distance }: { distance: number }) {
  const pct = Math.min(100, (distance / 300) * 100);
  const color =
    distance < 50 ? "#ff2244" : distance < 120 ? "#ffcc00" : "#00ff88";
  const label = distance >= 999 ? "CLEAR" : `${distance}m`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-muted-foreground">
          DISTANCE TO OBSTACLE
        </span>
        <span className="font-mono-num text-sm font-bold" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-muted-foreground/50">
        <span>DANGER</span>
        <span>SAFE</span>
      </div>
    </div>
  );
}

export default function Dashboard({
  speed,
  distance,
  decision,
}: DashboardProps) {
  const { data: logData } = useDecisionLog();
  const { data: statsData } = useStats();
  const resetLogMutation = useResetLog();
  const log = (logData ?? []).slice(-10).reverse() as DecisionEntry[];
  const stats = (statsData ?? null) as StatsData | null;
  const [prevDecision, setPrevDecision] = useState("");
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (decision.action !== prevDecision) {
      setPrevDecision(decision.action);
      setBadgeKey((k) => k + 1);
    }
  }, [decision.action, prevDecision]);

  const handleReset = () => {
    resetLogMutation.mutate();
  };

  const decisionStyle = ACTION_STYLES[decision.action] || ACTION_STYLES.GO;

  return (
    <div
      className="xl:w-80 flex flex-col gap-4"
      data-ocid="dashboard.decision.panel"
    >
      {/* Speed Gauge */}
      <div className="bg-card border border-border rounded p-4">
        <div className="text-xs font-mono text-muted-foreground mb-2">
          SPEED GAUGE
        </div>
        <SpeedGauge speed={speed} />
      </div>

      {/* Distance Bar */}
      <div className="bg-card border border-border rounded p-4">
        <DistanceBar distance={distance} />
      </div>

      {/* AI Decision Badge */}
      <div
        key={badgeKey}
        className="rounded p-4 badge-pop"
        style={{
          background: decisionStyle.bg,
          border: `1px solid ${decisionStyle.text}40`,
          boxShadow: decisionStyle.shadow,
        }}
      >
        <div className="text-xs font-mono text-muted-foreground mb-2">
          AI DECISION
        </div>
        <div
          className="font-display font-bold text-xl mb-1"
          style={{
            color: decisionStyle.text,
            textShadow: `0 0 10px ${decisionStyle.text}80`,
          }}
        >
          {decisionStyle.label}
        </div>
        <div className="text-xs font-mono text-muted-foreground leading-relaxed">
          {decision.reason}
        </div>
      </div>

      {/* Stats Panel */}
      <div
        className="bg-card border border-border rounded p-4"
        data-ocid="stats.panel"
      >
        <div className="text-xs font-mono text-muted-foreground mb-3">
          DECISION STATS
        </div>
        {stats ? (
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { label: "TOTAL", val: stats.totalDecisions, color: "#00f5ff" },
                { label: "GO", val: stats.goCount, color: "#00ff88" },
                { label: "STOP", val: stats.stopCount, color: "#ff2244" },
                { label: "SLOW", val: stats.slowDownCount, color: "#ffcc00" },
                {
                  label: "CHANGE",
                  val: stats.changeLaneCount,
                  color: "#4488ff",
                },
              ] as { label: string; val: bigint; color: string }[]
            ).map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-1"
              >
                <span className="text-xs font-mono text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className="font-mono-num text-sm font-bold"
                  style={{ color: item.color }}
                >
                  {item.val.toString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-muted-foreground/50 text-center py-2">
            Awaiting backend data...
          </div>
        )}
      </div>

      {/* Decision Log */}
      <div className="bg-card border border-border rounded p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-muted-foreground">
            DECISION LOG
          </div>
          <button
            type="button"
            data-ocid="log.reset.button"
            onClick={handleReset}
            className="text-xs font-mono text-muted-foreground hover:text-neon-red transition-colors px-2 py-0.5 border border-border rounded hover:border-red-500/40"
          >
            RESET
          </button>
        </div>
        <ScrollArea className="h-40">
          <div className="space-y-1" data-ocid="dashboard.log.list">
            {log.length === 0 ? (
              <div
                className="text-xs font-mono text-muted-foreground/50 text-center py-4"
                data-ocid="dashboard.log.empty_state"
              >
                No decisions recorded yet
              </div>
            ) : (
              log.map((entry, i) => {
                const style = ACTION_STYLES[entry.action] || ACTION_STYLES.GO;
                return (
                  <div
                    key={`log-${Number(entry.timestamp)}-${i}`}
                    className="flex items-start gap-2 text-xs font-mono py-1 border-b border-border/30"
                    data-ocid={`dashboard.log.item.${i + 1}`}
                  >
                    <span
                      className="font-bold shrink-0"
                      style={{ color: style.text }}
                    >
                      {entry.action.substring(0, 2)}
                    </span>
                    <span className="text-muted-foreground truncate flex-1">
                      {entry.reason}
                    </span>
                    <span className="text-muted-foreground/40 shrink-0">
                      {Math.round(entry.speed)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
