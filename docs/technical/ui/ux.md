import React, { useMemo, useState } from "react";

// TriHabit Health Dashboard (Fixed build)
// One-screen, unified UI for Steps (pedometer-only), Hydration, Sleep + AI Coach & Diagnostics
// TailwindCSS styling; no external chart libs.
// Notes:
// - Steps are read-only: fed by phone pedometer/health source. No manual increment controls.
// - This version fixes a JSX comment typo and mismatched closing </div> that caused a syntax error.
// - Includes lightweight inline tests for core utility functions (see bottom).

// -----------------------
// Utilities
// -----------------------
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Life score favored slightly toward hydration & sleep (recovery)
export function computeLifeScore(stepsPct: number, waterPct: number, sleepPct: number): number {
  const s = clamp01(stepsPct);
  const w = clamp01(waterPct);
  const sl = clamp01(sleepPct);
  const score = s * 0.33 + w * 0.34 + sl * 0.33;
  return Math.round(score * 100);
}

// Helper to compute strokeDasharray for a circular progress ring
export function ringDasharray(percent: number, r: number) {
  const clamped = clamp01(percent);
  const C = 2 * Math.PI * r;
  return `${C * clamped} ${C * (1 - clamped)}`;
}

// -----------------------
// UI Atoms
// -----------------------
const Badge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 border border-white/10">
    {label}
  </span>
);

const Bar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full bg-white/80"
      style={{ width: `${Math.max(0, Math.min(100, percent * 100))}%` }}
    />
  </div>
);

const KPICard: React.FC<{
  title: string;
  value: string;
  sub: string;
  percent: number;
  onAdd?: () => void;
  addLabel?: string;
  onLog?: () => void;
}> = ({ title, value, sub, percent, onAdd, addLabel, onLog }) => (
  <div className="flex-1 min-w-[220px] max-w-[280px] rounded-2xl p-4 bg-white/10 backdrop-blur border border-white/10 text-white">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm opacity-90">{title}</h3>
      <Badge label={`${Math.round(percent * 100)}%`} />
    </div>
    <div className="text-2xl font-semibold mb-1">{value}</div>
    <div className="text-xs opacity-80 mb-3">{sub}</div>
    <Bar percent={percent} />
    <div className="flex gap-2 mt-3">
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-3 py-2 text-xs rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition"
        >
          {addLabel ?? "+ Add"}
        </button>
      )}
      {onLog && (
        <button
          onClick={onLog}
          className="px-3 py-2 text-xs rounded-xl border border-white/30 hover:bg-white/10 transition"
        >
          Log
        </button>
      )}
    </div>
  </div>
);

// -----------------------
// Rings Visualization
// -----------------------
const TriRings: React.FC<{
  stepsPct: number;
  waterPct: number;
  sleepPct: number;
}> = ({ stepsPct, waterPct, sleepPct }) => {
  const size = 260;
  const center = size / 2;
  const rings = [
    { r: 110, pct: stepsPct, color: "#ffffff" },
    { r: 90, pct: waterPct, color: "#A3E635" }, // lime-400
    { r: 70, pct: sleepPct, color: "#22D3EE" }, // cyan-400
  ];

  const lifeScore = useMemo(() => computeLifeScore(stepsPct, waterPct, sleepPct), [stepsPct, waterPct, sleepPct]);

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rings */}
        {rings.map((r, i) => (
          <circle
            key={`bg-${i}`}
            cx={center}
            cy={center}
            r={r.r}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={10}
            fill="none"
          />
        ))}

        {/* Progress rings (start at -90deg) */}
        {rings.map((r, i) => (
          <g key={`fg-${i}`} transform={`rotate(-90 ${center} ${center})`}>
            <circle
              cx={center}
              cy={center}
              r={r.r}
              stroke={r.color}
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={ringDasharray(r.pct, r.r)}
              filter="url(#glow)"
            />
          </g>
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xs uppercase tracking-widest opacity-80">Life Score</div>
          <div className="text-5xl font-semibold leading-tight">{lifeScore}</div>
          <div className="text-xs opacity-80">Personalized from steps • water • sleep</div>
        </div>
      </div>
    </div>
  );
};

const Divider = () => <div className="h-px w-full bg-white/10" />;

// -----------------------
// App
// -----------------------
export default function App() {
  // Mock personalized targets (computed from profile: age, height, weight, activity, climate, etc.)
  const [targets] = useState({
    steps: 8000, // dynamic range 6k–12k
    waterOz: 80, // based on body mass & climate
    sleepHr: 8, // chronotype-aware
  });

  // State (steps are read-only in UI; assume pedometer sets this via native integration)
  const [state, setState] = useState({
    steps: 4200,
    waterOz: 48,
    sleepHr: 6.5,
  });

  const stepsPct = state.steps / targets.steps;
  const waterPct = state.waterOz / targets.waterOz;
  const sleepPct = state.sleepHr / targets.sleepHr;

  const now = new Date();
  const dateFmt = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Simple coach logic for demo
  const nextAction = useMemo(() => {
    const deficits = [
      { key: "Steps", pct: stepsPct, tip: "Take a 10‑min brisk walk (~1k steps)." },
      { key: "Hydration", pct: waterPct, tip: "Drink a glass of water now (8oz)." },
      { key: "Sleep", pct: sleepPct, tip: "Plan a wind‑down alarm 30 min earlier tonight." },
    ].sort((a, b) => a.pct - b.pct);
    return deficits[0];
  }, [stepsPct, waterPct, sleepPct]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-700 via-emerald-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
          <div>
            <div className="text-xs opacity-80">{dateFmt}</div>
            <div className="text-xl font-semibold">Your Daily Health</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge label="AI Coach" />
            <Badge label="Pedometer" />
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/20" />
          </div>
        </div>

        {/* TriRings */}
        <div className="flex justify-center mb-2">
          <TriRings stepsPct={stepsPct} waterPct={waterPct} sleepPct={sleepPct} />
        </div>

        {/* Quick actions (no steps manual input) */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setState((s) => ({ ...s, waterOz: s.waterOz + 8 }))}
            className="flex-1 rounded-xl p-3 bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition"
          >
            +8 oz water
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, sleepHr: Math.min(s.sleepHr + 0.25, targets.sleepHr) }))}
            className="flex-1 rounded-xl p-3 bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition"
          >
            +15m sleep
          </button>
        </div>

        {/* KPI row */}
        <div className="flex gap-3 overflow-x-auto pb-1 mb-5 no-scrollbar">
          <KPICard
            title="Steps"
            value={`${state.steps.toLocaleString()} / ${targets.steps.toLocaleString()}`}
            sub="Auto from phone pedometer"
            percent={stepsPct}
          />
          <KPICard
            title="Hydration"
            value={`${state.waterOz} / ${targets.waterOz} oz`}
            sub="Personalized by weight & climate"
            percent={waterPct}
            onAdd={() => setState((s) => ({ ...s, waterOz: s.waterOz + 12 }))}
            addLabel={"+12 oz"}
          />
          <KPICard
            title="Sleep"
            value={`${state.sleepHr.toFixed(1)} / ${targets.sleepHr} hr`}
            sub="Chronotype & recovery‑aware"
            percent={sleepPct}
            onAdd={() => setState((s) => ({ ...s, sleepHr: Math.min(s.sleepHr + 0.5, targets.sleepHr) }))}
            addLabel={"+30 min"}
          />
        </div>

        {/* Coach card */}
        <div className="rounded-2xl p-4 bg-white/10 border border-white/10 text-white backdrop-blur mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm opacity-90">Next Best Action</div>
              <div className="text-lg font-semibold">Focus: {nextAction.key}</div>
              <p className="text-sm opacity-85 mt-1">{nextAction.tip}</p>
            </div>
            <button className="px-3 py-2 text-sm rounded-xl bg-white text-gray-900 hover:bg-gray-100 h-fit">
              Do it now
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <Badge label="Adaptive targets" />
            <Badge label="Recovery‑aware" />
            <Badge label="Micro‑habits" />
          </div>
        </div>

        {/* Diagnostics */}
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-white backdrop-blur">
          <div className="text-sm font-semibold mb-2">Diagnostics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs opacity-80 mb-1">Hydration gap</div>
              <div className="text-lg font-semibold">{Math.max(0, targets.waterOz - state.waterOz)} oz left</div>
              <div className="text-xs opacity-75">Aim for steady sips each hour</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs opacity-80 mb-1">Sleep debt</div>
              <div className="text-lg font-semibold">{Math.max(0, targets.sleepHr - state.sleepHr).toFixed(1)} hr</div>
              <div className="text-xs opacity-75">Wind‑down 30m earlier today</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs opacity-80 mb-1">Step pace</div>
              <div className="text-lg font-semibold">{Math.round((state.steps / targets.steps) * 100)}% of today</div>
              <div className="text-xs opacity-75">Add 1–2 short walks</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs opacity-80 mb-1">Streaks</div>
              <div className="text-lg font-semibold">🔥 3‑day hydration</div>
              <div className="text-xs opacity-75">Keep it going!</div>
            </div>
          </div>
        </div>

        <div className="py-6" />
      </div>
    </div>
  );
}

// -----------------------
// Inline Tests (dev aid)
// These are simple runtime checks (console logs). They do not affect UI.
// -----------------------
(function runInlineTests() {
  try {
    const approx = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;

    // computeLifeScore tests
    const t1 = computeLifeScore(0, 0, 0) === 0;
    const t2 = computeLifeScore(1, 1, 1) === 100;
    const t3 = computeLifeScore(1.5, -0.5, 0.5) === computeLifeScore(1, 0, 0.5); // clamps

    // ringDasharray tests
    const C = 2 * Math.PI * 100;
    const [a1, b1] = ringDasharray(1, 100).split(" ").map(Number);
    const [a0, b0] = ringDasharray(0, 100).split(" ").map(Number);
    const r1 = approx(a1, C) && approx(b1, 0);
    const r0 = approx(a0, 0) && approx(b0, C);

    // percent bounds
    const [ap, bp] = ringDasharray(1.5, 50).split(" ").map(Number);
    const Cp = 2 * Math.PI * 50;
    const rb = approx(ap, Cp) && approx(bp, 0);

    const all = t1 && t2 && t3 && r1 && r0 && rb;
    // eslint-disable-next-line no-console
    console.log("TriHabit inline tests:", {
      computeLifeScore: { t1, t2, t3 },
      ringDasharray: { r1, r0, rb },
      allPassed: all,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("TriHabit inline tests encountered an error", e);
  }
})();
 