import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import Dashboard from "./Dashboard";

// Canvas color constants (can't use CSS vars in canvas)
const COLORS = {
  bg: "#050a12",
  roadDark: "#0d1520",
  roadMid: "#111c2a",
  roadLight: "#142030",
  laneDiv: "rgba(255,255,255,0.35)",
  sidewalk: "#0a1018",
  grass: "#071510",
  cyan: "#00f5ff",
  blue: "#0066ff",
  green: "#00ff88",
  red: "#ff2244",
  yellow: "#ffcc00",
  white: "#ffffff",
  treeDark: "#0d2214",
  treeLight: "#1a4028",
  buildingA: "#0e1a28",
  buildingB: "#0a1520",
  buildingC: "#121e30",
};

const CANVAS_W = 800;
const CANVAS_H = 500;
const ROAD_LEFT = 160;
const ROAD_RIGHT = 640;
const ROAD_W = ROAD_RIGHT - ROAD_LEFT; // 480
const LANE_W = ROAD_W / 3; // 160
const LANE_CENTERS = [
  ROAD_LEFT + LANE_W * 0.5,
  ROAD_LEFT + LANE_W * 1.5,
  ROAD_LEFT + LANE_W * 2.5,
];
const PLAYER_Y = 380;
const PLAYER_W = 36;
const PLAYER_H = 60;

interface NPC {
  lane: number;
  y: number;
  speed: number;
  color: string;
  w: number;
  h: number;
}

interface Pedestrian {
  y: number;
  x: number;
  dir: 1 | -1;
  active: boolean;
  speed: number;
  color: string;
}

interface SceneryTree {
  x: number;
  y: number;
  size: number;
  side: "left" | "right";
}

interface SceneryBuilding {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  lit: boolean[];
  side: "left" | "right";
}

interface SimState {
  running: boolean;
  speed: number;
  targetSpeed: number;
  scrollOffset: number;
  playerLane: number;
  playerX: number;
  playerTargetX: number;
  laneChangeProgress: number;
  radarPhase: number;
  trafficLight: { color: "red" | "yellow" | "green"; timer: number };
  npcs: NPC[];
  pedestrians: Pedestrian[];
  trees: SceneryTree[];
  buildings: SceneryBuilding[];
  currentDecision: { action: string; reason: string };
  distanceToObstacle: number;
  obstaclesEnabled: boolean;
  lastDecisionTime: number;
  decisionBadgeAlpha: number;
}

function initNPCs(): NPC[] {
  const colors = ["#ff6644", "#aacc44", "#cc44aa", "#4488ff", "#ffaa00"];
  return [
    { lane: 0, y: 80, speed: 1.5, color: colors[0], w: 32, h: 54 },
    { lane: 2, y: 140, speed: 2.0, color: colors[1], w: 32, h: 54 },
    { lane: 1, y: -100, speed: 1.0, color: colors[2], w: 32, h: 54 },
    { lane: 0, y: -220, speed: 1.8, color: colors[3], w: 32, h: 54 },
    { lane: 2, y: -50, speed: 2.2, color: colors[4], w: 32, h: 54 },
  ];
}

function initTrees(): SceneryTree[] {
  const trees: SceneryTree[] = [];
  for (let i = 0; i < 20; i++) {
    trees.push({
      x: 20 + Math.random() * (ROAD_LEFT - 60),
      y: i * 80 - 400,
      size: 14 + Math.random() * 12,
      side: "left",
    });
    trees.push({
      x: ROAD_RIGHT + 20 + Math.random() * (CANVAS_W - ROAD_RIGHT - 60),
      y: i * 80 - 400,
      size: 14 + Math.random() * 12,
      side: "right",
    });
  }
  return trees;
}

function initBuildings(): SceneryBuilding[] {
  const buildings: SceneryBuilding[] = [];
  const colors = [COLORS.buildingA, COLORS.buildingB, COLORS.buildingC];
  for (let i = 0; i < 8; i++) {
    const w = 40 + Math.random() * 50;
    const h = 60 + Math.random() * 80;
    buildings.push({
      x: 10 + Math.random() * (ROAD_LEFT - 80),
      y: i * 140 - 500,
      w,
      h,
      color: colors[Math.floor(Math.random() * colors.length)],
      lit: Array.from({ length: 12 }, () => Math.random() > 0.5),
      side: "left",
    });
    buildings.push({
      x: ROAD_RIGHT + 10 + Math.random() * (CANVAS_W - ROAD_RIGHT - 80),
      y: i * 140 - 500,
      w,
      h,
      color: colors[Math.floor(Math.random() * colors.length)],
      lit: Array.from({ length: 12 }, () => Math.random() > 0.5),
      side: "right",
    });
  }
  return buildings;
}

function initPedestrians(): Pedestrian[] {
  return [
    {
      y: 200,
      x: ROAD_LEFT,
      dir: 1,
      active: false,
      speed: 1.2,
      color: "#ffeecc",
    },
    {
      y: 350,
      x: ROAD_RIGHT,
      dir: -1,
      active: false,
      speed: 1.0,
      color: "#ffccee",
    },
  ];
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  isPlayer = false,
) {
  ctx.save();
  const hw = w / 2;
  const hh = h / 2;
  // Body shadow/glow
  if (isPlayer) {
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 20;
  }
  // Main body
  ctx.fillStyle = isPlayer ? "#0d2a3a" : "#1a1a2a";
  drawRoundRect(ctx, x - hw, y - hh, w, h, 6);
  ctx.fill();
  // Body outline
  ctx.strokeStyle = isPlayer ? COLORS.cyan : color;
  ctx.lineWidth = isPlayer ? 1.5 : 1;
  ctx.stroke();
  // Roof
  ctx.fillStyle = isPlayer ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.08)";
  drawRoundRect(ctx, x - hw + 5, y - hh + 10, w - 10, h * 0.45, 4);
  ctx.fill();
  // Windshield
  ctx.strokeStyle = isPlayer ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.2)";
  ctx.lineWidth = 0.5;
  ctx.stroke();
  // Hood detail
  ctx.fillStyle = isPlayer ? "rgba(0,245,255,0.3)" : `${color}55`;
  drawRoundRect(ctx, x - hw + 6, y - hh + 14, w - 12, 20, 3);
  ctx.fill();
  // Wheels
  const wheelColor = isPlayer ? "rgba(0,245,255,0.6)" : "rgba(255,255,255,0.3)";
  ctx.fillStyle = wheelColor;
  ctx.fillRect(x - hw - 3, y - hh + 6, 5, 12);
  ctx.fillRect(x + hw - 2, y - hh + 6, 5, 12);
  ctx.fillRect(x - hw - 3, y + hh - 18, 5, 12);
  ctx.fillRect(x + hw - 2, y + hh - 18, 5, 12);
  // Headlights
  if (isPlayer) {
    ctx.fillStyle = "rgba(255,255,200,0.9)";
    ctx.shadowColor = "#ffffaa";
    ctx.shadowBlur = 8;
    ctx.fillRect(x - hw + 6, y - hh + 2, 8, 4);
    ctx.fillRect(x + hw - 14, y - hh + 2, 8, 4);
    // Taillights
    ctx.shadowColor = COLORS.red;
    ctx.fillStyle = "rgba(255,50,80,0.9)";
    ctx.fillRect(x - hw + 6, y + hh - 6, 8, 4);
    ctx.fillRect(x + hw - 14, y + hh - 6, 8, 4);
  } else {
    // NPC headlights
    ctx.fillStyle = "rgba(255,255,200,0.7)";
    ctx.shadowColor = "#ffffaa";
    ctx.shadowBlur = 5;
    ctx.fillRect(x - hw + 5, y + hh - 6, 7, 3);
    ctx.fillRect(x + hw - 12, y + hh - 6, 7, 3);
    ctx.shadowColor = COLORS.red;
    ctx.fillStyle = "rgba(255,50,80,0.8)";
    ctx.fillRect(x - hw + 5, y - hh + 2, 7, 3);
    ctx.fillRect(x + hw - 12, y - hh + 2, 7, 3);
  }
  ctx.restore();
}

function drawRadarRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  phase: number,
) {
  for (let i = 0; i < 3; i++) {
    const p = (phase + i / 3) % 1;
    const radius = 40 + p * 80;
    const alpha = (1 - p) * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // LIDAR rays
  const numRays = 12;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 - Math.PI / 2;
    const rayLen = 100;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
    ctx.strokeStyle = `rgba(0,245,255,${0.12 + Math.sin(phase * Math.PI * 2 + i) * 0.05})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

function drawTrafficLight(
  ctx: CanvasRenderingContext2D,
  color: "red" | "yellow" | "green",
) {
  const x = ROAD_LEFT + ROAD_W / 2 - 16;
  const y = 10;
  // Box
  ctx.fillStyle = "#0a1018";
  ctx.strokeStyle = "#1a2a3a";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, x, y, 32, 86, 6);
  ctx.fill();
  ctx.stroke();
  // Lights
  const lightData: {
    cy: number;
    c: "red" | "yellow" | "green";
    col: string;
    glowCol: string;
  }[] = [
    { cy: y + 18, c: "red", col: "#ff2244", glowCol: "rgba(255,34,68,0.7)" },
    { cy: y + 43, c: "yellow", col: "#ffcc00", glowCol: "rgba(255,204,0,0.7)" },
    { cy: y + 68, c: "green", col: "#00ff88", glowCol: "rgba(0,255,136,0.7)" },
  ];
  for (const ld of lightData) {
    const isActive = ld.c === color;
    ctx.beginPath();
    ctx.arc(x + 16, ld.cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? ld.col : `${ld.col}22`;
    if (isActive) {
      ctx.shadowColor = ld.glowCol;
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.strokeStyle = isActive ? ld.col : `${ld.col}44`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawPedestrian(ctx: CanvasRenderingContext2D, ped: Pedestrian) {
  if (!ped.active) return;
  ctx.save();
  // Body
  ctx.fillStyle = ped.color;
  ctx.shadowColor = ped.color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(ped.x, ped.y - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(ped.x - 3, ped.y - 3, 6, 12);
  // Legs
  ctx.fillRect(ped.x - 4, ped.y + 8, 3, 8);
  ctx.fillRect(ped.x + 1, ped.y + 8, 3, 8);
  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, t: SceneryTree) {
  ctx.save();
  // Trunk
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(t.x - 2, t.y, 4, 12);
  // Canopy
  ctx.fillStyle = COLORS.treeLight;
  ctx.shadowColor = COLORS.treeLight;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(t.x, t.y - t.size * 0.3, t.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.treeDark;
  ctx.beginPath();
  ctx.arc(t.x - 3, t.y - t.size * 0.2, t.size * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: SceneryBuilding,
  scrollOffset: number,
) {
  ctx.save();
  ctx.fillStyle = b.color;
  ctx.strokeStyle = "rgba(0,180,220,0.15)";
  ctx.lineWidth = 0.5;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  // Windows
  const cols = 3;
  const rows = 4;
  const padX = 5;
  const padY = 8;
  const ww = (b.w - padX * 2) / cols - 3;
  const wh = (b.h - padY * 2) / rows - 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = b.x + padX + c * ((b.w - padX * 2) / cols);
      const wy = b.y + padY + r * ((b.h - padY * 2) / rows);
      const idx = r * cols + c;
      const isLit = b.lit[idx % b.lit.length];
      ctx.fillStyle = isLit
        ? `rgba(0,${180 + (Math.floor(scrollOffset * 0.01) % 75)},255,0.6)`
        : "rgba(10,20,30,0.8)";
      ctx.fillRect(wx, wy, ww, wh);
    }
  }
  ctx.restore();
}

const ACTION_COLORS: Record<string, string> = {
  STOP: COLORS.red,
  SLOW_DOWN: COLORS.yellow,
  CHANGE_LANE: COLORS.blue,
  GO: COLORS.green,
};

export default function SimulationSection() {
  const { actor } = useActor();
  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<SimState>({
    running: false,
    speed: 0,
    targetSpeed: 60,
    scrollOffset: 0,
    playerLane: 1,
    playerX: LANE_CENTERS[1],
    playerTargetX: LANE_CENTERS[1],
    laneChangeProgress: 1,
    radarPhase: 0,
    trafficLight: { color: "green", timer: 0 },
    npcs: initNPCs(),
    pedestrians: initPedestrians(),
    trees: initTrees(),
    buildings: initBuildings(),
    currentDecision: { action: "GO", reason: "Road clear, proceeding" },
    distanceToObstacle: 999,
    obstaclesEnabled: true,
    lastDecisionTime: 0,
    decisionBadgeAlpha: 0,
  });

  // UI state (re-renders allowed)
  const [uiSpeed, setUiSpeed] = useState(0);
  const [uiDistance, setUiDistance] = useState(999);
  const [uiDecision, setUiDecision] = useState({
    action: "GO",
    reason: "System initializing...",
  });
  const [uiRunning, setUiRunning] = useState(false);
  const [targetSpeed, setTargetSpeed] = useState(60);
  const [obstaclesEnabled, setObstaclesEnabled] = useState(true);

  // Sync UI state to sim state
  useEffect(() => {
    stateRef.current.targetSpeed = targetSpeed;
  }, [targetSpeed]);

  useEffect(() => {
    stateRef.current.obstaclesEnabled = obstaclesEnabled;
  }, [obstaclesEnabled]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const spd = s.speed;
    const scrollDelta = (spd / 60) * 4; // pixels per frame

    // Update scroll
    s.scrollOffset += scrollDelta;

    // Traffic light timer
    s.trafficLight.timer += scrollDelta;
    const phases = { red: 300, yellow: 60, green: 300 };
    const currentPhaseLen = phases[s.trafficLight.color];
    if (s.trafficLight.timer >= currentPhaseLen) {
      s.trafficLight.timer = 0;
      if (s.trafficLight.color === "green") s.trafficLight.color = "yellow";
      else if (s.trafficLight.color === "yellow") s.trafficLight.color = "red";
      else s.trafficLight.color = "green";
    }

    // Update NPCs
    if (s.obstaclesEnabled) {
      for (const npc of s.npcs) {
        npc.y += npc.speed - scrollDelta * 0.5;
        if (npc.y > CANVAS_H + 80) npc.y = -120;
        if (npc.y < -200) npc.y = CANVAS_H + 80;
      }
    }

    // Update pedestrians
    for (const ped of s.pedestrians) {
      if (!ped.active) {
        if (s.obstaclesEnabled && Math.random() < 0.001) {
          ped.active = true;
          ped.y = 100 + Math.random() * 300;
          ped.x = ped.dir === 1 ? ROAD_LEFT - 10 : ROAD_RIGHT + 10;
        }
      } else {
        ped.x += ped.dir * ped.speed;
        if (ped.dir === 1 && ped.x > ROAD_RIGHT + 20) ped.active = false;
        if (ped.dir === -1 && ped.x < ROAD_LEFT - 20) ped.active = false;
      }
    }

    // Update trees & buildings
    for (const t of s.trees) {
      t.y += scrollDelta;
      if (t.y > CANVAS_H + 30) t.y = -80;
    }
    for (const b of s.buildings) {
      b.y += scrollDelta * 0.7;
      if (b.y > CANVAS_H + 50) b.y = -200;
    }

    // Player lane change
    if (s.laneChangeProgress < 1) {
      s.laneChangeProgress = Math.min(1, s.laneChangeProgress + 0.06);
      const t = s.laneChangeProgress;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const startX =
        s.playerTargetX === LANE_CENTERS[s.playerLane]
          ? s.playerX
          : LANE_CENTERS[s.playerLane === 0 ? 1 : s.playerLane === 2 ? 1 : 0];
      s.playerX = startX + (s.playerTargetX - startX) * ease;
    } else {
      s.playerX = s.playerTargetX;
    }

    // Compute distance to obstacle
    let minDist = 999;
    if (s.obstaclesEnabled) {
      for (const npc of s.npcs) {
        if (npc.lane === s.playerLane && npc.y < PLAYER_Y && npc.y > 0) {
          const dist = PLAYER_Y - npc.y;
          if (dist < minDist) minDist = dist;
        }
      }
      for (const ped of s.pedestrians) {
        if (ped.active) {
          const pedLane = Math.floor((ped.x - ROAD_LEFT) / LANE_W);
          if (pedLane === s.playerLane) {
            const dist = Math.abs(ped.y - PLAYER_Y);
            if (dist < minDist) minDist = dist;
          }
        }
      }
    }
    s.distanceToObstacle = Math.round(minDist);

    // AI decision every 600ms
    const now = Date.now();
    if (now - s.lastDecisionTime > 600 && s.running) {
      s.lastDecisionTime = now;
      const laneBlocked = minDist < 80;
      const dist = s.distanceToObstacle;
      const spd2 = s.speed;
      const light = s.trafficLight.color;

      // Inline JS fallback decision logic
      const fallback = () => {
        if (light === "red" && PLAYER_Y < 100) {
          return { action: "STOP", reason: "Red light — stopping" };
        }
        if (dist < 50) {
          if (laneBlocked) {
            const nextLane =
              s.playerLane === 1 ? 0 : s.playerLane === 0 ? 1 : 1;
            s.playerLane = nextLane;
            s.playerTargetX = LANE_CENTERS[nextLane];
            s.laneChangeProgress = 0;
            return {
              action: "CHANGE_LANE",
              reason: "Obstacle too close — changing lane",
            };
          }
          return { action: "STOP", reason: "Obstacle detected — stopping" };
        }
        if (dist < 120 || light === "yellow") {
          return {
            action: "SLOW_DOWN",
            reason:
              dist < 120
                ? "Obstacle nearby — slowing down"
                : "Yellow light — slowing",
          };
        }
        return {
          action: "GO",
          reason: "Path clear — proceeding at full speed",
        };
      };

      if (!actorRef.current) throw new Error("no actor");
      actorRef.current
        .makeDecision(spd2, dist, light, laneBlocked)
        .then((result) => {
          s.currentDecision = result;
          s.decisionBadgeAlpha = 1;
          applyDecision(result.action);
        })
        .catch(() => {
          const result = fallback();
          s.currentDecision = result;
          s.decisionBadgeAlpha = 1;
          applyDecision(result.action);
        });
    }

    // Apply current speed to target
    if (s.running) {
      switch (s.currentDecision.action) {
        case "STOP":
          s.speed = Math.max(0, s.speed - 2);
          break;
        case "SLOW_DOWN":
          s.speed =
            s.speed > s.targetSpeed * 0.4
              ? Math.max(s.targetSpeed * 0.4, s.speed - 1)
              : s.speed;
          break;
        default:
          s.speed =
            s.speed < s.targetSpeed
              ? Math.min(s.targetSpeed, s.speed + 1.5)
              : s.targetSpeed;
      }
    } else {
      s.speed = Math.max(0, s.speed - 2);
    }

    // Radar phase
    s.radarPhase = (s.radarPhase + 0.008) % 1;
    // Badge fade
    s.decisionBadgeAlpha = Math.max(0, s.decisionBadgeAlpha - 0.005);

    // === DRAW ===
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background (sides)
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Side grass/sidewalk
    ctx.fillStyle = "#080e0c";
    ctx.fillRect(0, 0, ROAD_LEFT, CANVAS_H);
    ctx.fillRect(ROAD_RIGHT, 0, CANVAS_W - ROAD_RIGHT, CANVAS_H);

    // Sidewalk strips
    ctx.fillStyle = "#0d1820";
    ctx.fillRect(ROAD_LEFT - 20, 0, 20, CANVAS_H);
    ctx.fillRect(ROAD_RIGHT, 0, 20, CANVAS_H);

    // Draw buildings (behind trees)
    for (const b of s.buildings) drawBuilding(ctx, b, s.scrollOffset);

    // Draw trees
    for (const t of s.trees) drawTree(ctx, t);

    // Road surface
    const roadGrad = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
    roadGrad.addColorStop(0, "#0c1824");
    roadGrad.addColorStop(0.5, "#111e2c");
    roadGrad.addColorStop(1, "#0c1824");
    ctx.fillStyle = roadGrad;
    ctx.fillRect(ROAD_LEFT, 0, ROAD_W, CANVAS_H);

    // Road edge lines
    ctx.strokeStyle = "rgba(255,200,0,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.lineDashOffset = -s.scrollOffset % 35;
    ctx.beginPath();
    ctx.moveTo(ROAD_LEFT + 2, 0);
    ctx.lineTo(ROAD_LEFT + 2, CANVAS_H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ROAD_RIGHT - 2, 0);
    ctx.lineTo(ROAD_RIGHT - 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lane dividers (dashed white)
    ctx.strokeStyle = COLORS.laneDiv;
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -s.scrollOffset % 50;
    for (let i = 1; i <= 2; i++) {
      const lx = ROAD_LEFT + LANE_W * i;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, CANVAS_H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Traffic light
    drawTrafficLight(ctx, s.trafficLight.color);

    // Pedestrians
    for (const ped of s.pedestrians) drawPedestrian(ctx, ped);

    // NPC cars
    if (s.obstaclesEnabled) {
      for (const npc of s.npcs) {
        const nx = LANE_CENTERS[npc.lane];
        drawCar(ctx, nx, npc.y, npc.w, npc.h, npc.color);
      }
    }

    // Radar rings (behind player car)
    drawRadarRings(ctx, s.playerX, PLAYER_Y, s.radarPhase);

    // Player car
    drawCar(ctx, s.playerX, PLAYER_Y, PLAYER_W, PLAYER_H, COLORS.cyan, true);

    // Speed streaks (motion blur effect at high speed)
    if (s.speed > 40) {
      const streakAlpha = ((s.speed - 40) / 60) * 0.15;
      ctx.strokeStyle = `rgba(0,245,255,${streakAlpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const sx = s.playerX - 10 + i * 5;
        ctx.beginPath();
        ctx.moveTo(sx, PLAYER_Y + PLAYER_H / 2);
        ctx.lineTo(sx, PLAYER_Y + PLAYER_H / 2 + 20 + i * 5);
        ctx.stroke();
      }
    }

    // Distance indicator line to nearest obstacle
    if (s.distanceToObstacle < 200 && s.obstaclesEnabled) {
      const alpha = Math.max(0, 1 - s.distanceToObstacle / 200);
      const dangerColor =
        s.distanceToObstacle < 50
          ? `rgba(255,34,68,${alpha})`
          : s.distanceToObstacle < 100
            ? `rgba(255,204,0,${alpha * 0.6})`
            : `rgba(0,245,255,${alpha * 0.4})`;
      ctx.strokeStyle = dangerColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(s.playerX, PLAYER_Y - PLAYER_H / 2);
      ctx.lineTo(s.playerX, PLAYER_Y - s.distanceToObstacle);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Decision badge overlay
    if (s.decisionBadgeAlpha > 0.05) {
      const ac = ACTION_COLORS[s.currentDecision.action] || COLORS.green;
      const r = Number.parseInt(ac.slice(1, 3), 16);
      const g = Number.parseInt(ac.slice(3, 5), 16);
      const b = Number.parseInt(ac.slice(5, 7), 16);
      const ba = s.decisionBadgeAlpha * 0.9;
      ctx.fillStyle = `rgba(${r},${g},${b},${ba * 0.15})`;
      ctx.strokeStyle = `rgba(${r},${g},${b},${ba})`;
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, s.playerX - 60, PLAYER_Y - 90, 120, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(${r},${g},${b},${ba})`;
      ctx.font = "bold 11px 'Orbitron', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = ac;
      ctx.shadowBlur = 8;
      ctx.fillText(s.currentDecision.action, s.playerX, PLAYER_Y - 78);
      ctx.shadowBlur = 0;
    }

    // HUD: Speed in corner
    ctx.fillStyle = "rgba(0,245,255,0.8)";
    ctx.font = "bold 14px 'Orbitron', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${Math.round(s.speed)} km/h`, 10, 10);
    ctx.fillStyle = "rgba(0,245,255,0.4)";
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.fillText(`LANE: ${s.playerLane + 1}/3`, 10, 28);

    // HUD: Traffic light status
    const tlColors: Record<string, string> = {
      red: "#ff2244",
      yellow: "#ffcc00",
      green: "#00ff88",
    };
    ctx.fillStyle = tlColors[s.trafficLight.color];
    ctx.font = "10px 'Share Tech Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `TL: ${s.trafficLight.color.toUpperCase()}`,
      CANVAS_W - 10,
      10,
    );

    // Update UI state (throttled)
    // We update on every frame but React batches
  }, []);

  function applyDecision(action: string) {
    const s = stateRef.current;
    if (action === "CHANGE_LANE") {
      const nextLane =
        s.playerLane === 1
          ? Math.random() > 0.5
            ? 0
            : 2
          : s.playerLane === 0
            ? 1
            : 1;
      s.playerLane = nextLane;
      s.playerTargetX = LANE_CENTERS[nextLane];
      s.laneChangeProgress = 0;
    }
  }

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastUiUpdate = 0;

    const loop = () => {
      drawFrame(ctx);
      const now = Date.now();
      if (now - lastUiUpdate > 100) {
        lastUiUpdate = now;
        const s = stateRef.current;
        setUiSpeed(Math.round(s.speed));
        setUiDistance(s.distanceToObstacle);
        setUiDecision({ ...s.currentDecision });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  const handleStartStop = () => {
    const running = !stateRef.current.running;
    stateRef.current.running = running;
    setUiRunning(running);
    if (running) {
      stateRef.current.currentDecision = {
        action: "GO",
        reason: "Simulation started",
      };
      stateRef.current.decisionBadgeAlpha = 1;
    }
  };

  const handleSpeedChange = (val: number) => {
    setTargetSpeed(val);
    stateRef.current.targetSpeed = val;
  };

  const handleToggleObstacles = () => {
    const enabled = !stateRef.current.obstaclesEnabled;
    stateRef.current.obstaclesEnabled = enabled;
    setObstaclesEnabled(enabled);
    if (!enabled) {
      stateRef.current.currentDecision = {
        action: "GO",
        reason: "Obstacles cleared — highway mode",
      };
      stateRef.current.decisionBadgeAlpha = 1;
    }
  };

  return (
    <section id="simulation" className="py-20 road-hex relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-neon-cyan text-xs font-mono mb-4">
            <span className="w-8 h-px bg-neon-cyan/50" />
            LIVE SIMULATION
            <span className="w-8 h-px bg-neon-cyan/50" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            Autonomous Driving
            <span className="text-neon-cyan"> Simulator</span>
          </h2>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
            Real-time AI decision-making with obstacle detection, lane
            management, and traffic signal compliance
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Canvas + Controls */}
          <div className="flex-1 min-w-0">
            {/* Canvas */}
            <div
              className="relative border-glow-cyan rounded overflow-hidden bg-background"
              style={{
                boxShadow:
                  "0 0 40px rgba(0,245,255,0.15), 0 0 80px rgba(0,245,255,0.05)",
              }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                data-ocid="sim.canvas_target"
                className="w-full block"
                style={{ imageRendering: "pixelated", maxWidth: "100%" }}
              />
              {/* Running indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    uiRunning ? "bg-neon-green" : "bg-red-500"
                  }`}
                  style={{
                    boxShadow: uiRunning
                      ? "0 0 8px #00ff88"
                      : "0 0 8px #ff2244",
                  }}
                />
                <span className="text-xs font-mono text-white/60">
                  {uiRunning ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap items-center gap-4 p-4 bg-card rounded border border-border">
              {/* Start/Stop */}
              <button
                type="button"
                data-ocid="sim.primary_button"
                onClick={handleStartStop}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 font-display font-bold text-sm rounded transition-all duration-200 ${
                  uiRunning
                    ? "bg-red-500/20 text-neon-red border border-red-500/50 hover:bg-red-500/30"
                    : "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30"
                }`}
                style={{
                  boxShadow: uiRunning
                    ? "0 0 15px rgba(255,34,68,0.3)"
                    : "0 0 15px rgba(0,245,255,0.3)",
                }}
              >
                {uiRunning ? (
                  <>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
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
                    Start
                  </>
                )}
              </button>

              {/* Speed slider */}
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  SPEED LIMIT
                </span>
                <input
                  data-ocid="sim.speed_slider"
                  type="range"
                  min={0}
                  max={100}
                  value={targetSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00f5ff ${targetSpeed}%, #1a2a3a ${targetSpeed}%)`,
                  }}
                />
                <span className="font-mono-num text-neon-cyan text-sm font-bold w-8 text-right">
                  {targetSpeed}
                </span>
              </div>

              {/* Toggle obstacles */}
              <button
                type="button"
                data-ocid="sim.toggle_button"
                onClick={handleToggleObstacles}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs rounded border transition-all duration-200 ${
                  obstaclesEnabled
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/20"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                {obstaclesEnabled ? "Obstacles: ON" : "Obstacles: OFF"}
              </button>
            </div>
          </div>

          {/* Dashboard */}
          <Dashboard
            speed={uiSpeed}
            distance={uiDistance}
            decision={uiDecision}
          />
        </div>
      </div>
    </section>
  );
}
