# AutoDrive AI Simulator

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full single-page app with sections: Home, Simulation, How It Works, About
- Top-view Canvas-based road simulation with lanes, traffic signals, obstacles, pedestrians, other cars
- Self-driving car with radar/sensor animation, lane-change logic, obstacle avoidance, red-light stopping
- Animated dashboard: speed indicator, distance from obstacle, AI decision log, chart-style indicators
- Interactive controls: Start/Stop button, speed slider, toggle obstacles
- Futuristic neon/glowing UI theme with CSS animations
- Motoko backend acting as AI decision API (replaces Python Flask): receives car state, returns AI decision (stop/go/change-lane) and logs decisions
- Real-time decision log panel
- Explanation section about self-driving technology and ML

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko backend: `makeDecision(speed, distanceToObstacle, trafficLight, laneBlocked)` -> returns `{action, reason}`. Also stores last 20 decision logs retrievable via `getDecisionLog()`.
2. Frontend React app:
   - Nav with smooth-scroll sections
   - Hero/Home section with animated tagline and glowing CTA
   - Simulation section: Canvas renderer with road, lanes, dashed lane markers, moving trees/buildings, player car with radar pulse, NPC cars, pedestrians, traffic lights
   - JS simulation loop: obstacle detection, lane change, red-light stop; calls backend API for decision every ~500ms
   - Dashboard panel: speed gauge, distance bar, decision badge, decision log list
   - How It Works section: illustrated steps
   - About section: project info
