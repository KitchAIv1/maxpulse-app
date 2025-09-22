# TriHabit – Unified Health Habits App (PRD)

Single‑screen daily health dashboard that unifies **Steps (pedometer)**, **Hydration**, and **Sleep** with an **AI Coach** and **Diagnostics**, plus a **Rewards** layer that reinforces healthy behavior without toxic competition.

*Last updated: 2025‑09‑08*

---

## 1) Executive Summary

TriHabit delivers a friction‑less, one‑screen experience so users can glance, act, and get back to life. Steps auto‑ingest from the phone’s pedometer/health source; hydration and sleep are tracked with minimal taps or device sync. A Life Indicator summarizes daily status (already implemented in the current UI) and drives a single Next Best Action. Rewards convert consistency into points and streaks—designed for sustainability, not late‑night gaming.

**Primary KPI (MVP):** Day‑7 retention; % of users completing at least one Next Best Action per day; Hydration compliance rate.

---

## 2) Goals & Non‑Goals

**Goals**

* One‑screen habit control: steps, water, sleep with immediate feedback.
* Auto steps via device pedometer (no manual step edit UI).
* Clear Life Indicator + one actionable nudge.
* Gentle, non‑competitive rewards: daily points, streak multipliers, weekly badges.
* iOS/Android parity using React Native with Expo.

**Non‑Goals (MVP)**

* Social leaderboards/competitions.
* Nutrition/calorie tracking.
* Wearable‑specific deep integrations beyond HealthKit/Google Fit read scopes.

---

## 3) Personas

* **Busy Builder (primary):** 25–55, wants low‑effort health wins. Success = opens app 2–3× daily, logs water quickly, follows a nightly sleep nudge.
* **Data‑Aware Recoverer:** wants to improve sleep and hydration to boost energy; tolerates brief explanations.

---

## 4) User Stories (MVP)

1. As a user, I see **today’s steps/hydration/sleep** and a **Life Indicator** at a glance.
2. As a user, **steps** are auto‑counted from my phone **without manual entry**.
3. As a user, I can log water in **one tap** (+8oz, +12oz) and see remaining target.
4. As a user, I see **sleep from last night** (via HealthKit/Google Fit) or can enter it once if not connected.
5. As a user, I get a **Next Best Action** (e.g., “Drink 8oz now”).
6. As a user, I earn **points** for hitting targets and maintaining streaks, redeemable for badges (MVP) and simple in‑app perks (V1.1).

**Acceptance Criteria** are listed per feature in §10.

---

## 5) UX / UI (Integrated)

**Reference Implementation:** The provided React UI (“TriHabit Health Dashboard”) is the source of truth for component structure and visual style. Key components:

* `TriRings`: concentric rings for Steps (outer), Hydration (middle), Sleep (inner), with center Life Indicator and percent logic.
* `KPICard`: compact KPI tiles with micro‑progress bars.
* `Next Best Action` card with small badges.
* `Diagnostics` grid: hydration gap, sleep debt, step pace, streaks.

### Mobile Implementation Notes (React Native)

* Use **Expo** + **nativewind** (Tailwind‑for‑RN) for styling parity.
* Replace `<svg>` with **react‑native‑svg** and recreate ring arcs using `strokeDasharray` (same math as web).
* Gradients using **expo-linear-gradient**.
* Haptics using **expo-haptics** for button taps and goal completion.

### Accessibility

* Life Indicator is `role=progressbar` with `aria-valuenow` equivalent using RN Accessibility props.
* Always show numbers (not color‑only) and use icons for color‑blind friendliness.

---

## 6) Rewards System (MVP)

**Design Principles**: non‑competitive, self‑compassionate; rewards consistency, not volume binges.

**Points (daily):**

* Steps: up to **40 pts** for hitting daily target (pro‑rated on pace; cap at 40; no bonus beyond target; no points added after 10pm local).
* Hydration: up to **40 pts** for hitting water target (pro‑rated; cap at 40; late‑night chug after 9pm does **not** exceed target credit).
* Sleep: **50 pts** for 90–110% of target; **30 pts** for 80–90% or 110–120%; **0** otherwise; max once per day.
* **Daily Completion Bonus:** +20 pts if all three hit.

**Streaks:**

* 3‑day streak: +10 bonus; 7‑day: +30; 14‑day: +60; resets only if <50% of target on any metric.

**Badges (MVP):**

* “Hydration Hat‑Trick” (3 days), “Early Lights” (3 nights >90% target), “Balanced Week” (all three hit 5/7 days).

**Anti‑gaming Guardrails:**

* Ignore steps recorded after 11pm for the current day’s points.
* Cap daily hydration at target; excess doesn’t add points.
* Sleep scored on last night only; naps don’t inflate beyond the 110% band.

**Rewards Page (UI):**

* Header: Points balance + weekly progress bar.
* Cards: Today’s earnings breakdown; Streak status; Badges earned; “Next badge” progress.
* CTA: “Complete today’s 3 to earn +20.”

*Configuration (server‑side JSON):*

```json
{
  "points": {
    "steps": { "max": 40, "cutoffHour": 22 },
    "hydration": { "max": 40, "cutoffHour": 21 },
    "sleep": { "tiers": [[0.9, 1.1, 50], [0.8, 0.9, 30], [1.1, 1.2, 30]] },
    "dailyCompletionBonus": 20
  },
  "streaks": { "threshold": 0.5, "bonuses": { "3": 10, "7": 30, "14": 60 } }
}
```

---

## 7) Tech Stack & Native Integrations

**Client**: React Native (Expo, TypeScript), nativewind, react‑native‑svg, expo‑notifications, expo‑haptics, expo‑secure‑store.

**Sensors / Health**:

* **iOS**: Core Motion pedometer via **expo‑sensors/Pedometer** (steps); **HealthKit** via `react-native-health` (sleep, hydration if available); Info.plist: `NSMotionUsageDescription`, `NSHealthShareUsageDescription`.
* **Android**: `ACTIVITY_RECOGNITION` permission for steps (pedometer); **Google Fit** via `react-native-google-fit` (sleep & hydration if available). OAuth scopes: `https://www.googleapis.com/auth/fitness.activity.read`, `.../sleep.read`, `.../nutrition.read`.

**Backend**: **Supabase** (Auth, Postgres, RLS), Edge Functions (Deno) for points calculation, CRON jobs for end‑of‑day finalization; PostHog/Amplitude for analytics.

**Build/Ship**: Expo EAS, OTA updates via Expo Updates.

**State**: Zustand or Redux Toolkit (Zustand recommended for simplicity).

**Internationalization**: `i18next` (later).

---

## 8) Data Model (Supabase)

**users**

* `id` (uuid, pk), `created_at`, `tz`, `display_name`

**device\_connections**

* `user_id` (fk), `platform` (enum: ios, android), `health_source` (enum: pedometer, apple\_health, google\_fit), `last_sync_at`

**daily\_metrics** (one row per day)

* `user_id`, `date` (date, pk composite), `steps_actual` int, `steps_target` int
* `water_oz_actual` numeric, `water_oz_target` numeric
* `sleep_hr_actual` numeric, `sleep_hr_target` numeric
* `life_score` int, `finalized` bool default false

**hydration\_logs**

* `user_id`, `ts`, `amount_oz` numeric, `source` (manual|healthkit|googlefit)

**sleep\_sessions**

* `user_id`, `start_ts`, `end_ts`, `source`

**pedometer\_snapshots**

* `user_id`, `ts`, `steps_cumulative` int (raw device counter), `source`

**rewards\_ledger**

* `id` pk, `user_id`, `date`, `type` (steps|hydration|sleep|daily\_bonus|streak), `points` int, `meta` jsonb

**badges** & **user\_badges**

* Static badges table; junction table for user awards

**RLS**: row‑level policy `user_id = auth.uid()` for all user‑owned tables.

---

## 9) Core Algorithms

**Life Score** (center indicator): use current implementation with optional weights; clamp and smooth with EMA.

```ts
export const clamp01 = (x:number)=>Math.max(0,Math.min(1,x));
export function computeLifeScore(stepsPct:number, waterPct:number, sleepPct:number){
  const s=clamp01(stepsPct), w=clamp01(waterPct), sl=clamp01(sleepPct);
  const raw = s*0.33 + w*0.34 + sl*0.33; // default
  return Math.round(raw*100);
}
```

**Ring dasharray** (RN mirrors web): circumference = `2πr`; dash = `C*pct`, gap = `C*(1-pct)`.

**Points Engine (Edge Function)**

* Triggered on hydration log insert, sleep import, or end‑of‑day cron.
* Reads `daily_metrics`, applies config JSON, writes `rewards_ledger` rows idempotently.

---

## 10) Flows & Acceptance Criteria

### Onboarding & Permissions

1. Welcome → Choose targets (auto‑suggest from profile: age/weight/climate) → Connect health sources.
2. Ask for **Motion** (steps) permission first; HealthKit/Fit optional for sleep/hydration.

**AC**

* If Motion is denied, show banner to enable in Settings; Steps UI remains read‑only with “No data yet”.
* If Sleep is unavailable, show hollow sleep ring and a connect prompt.

### Daily Loop

1. Open app → See rings and Life Indicator.
2. Tap +8oz / +12oz → hydration increases, diagnostics update, potential points awarded.
3. At 8pm local, show gentle hydration/sleep nudges if under pace.

**AC**

* Hydration add animates within 150ms and triggers light haptic.
* Diagnostics hydration gap updates instantly; Life Score recomputes.
* Step ring updates passively every 10–30s while app is foregrounded.

### Rewards

1. Open Rewards page → see today’s point breakdown, streak tile, badges grid.
2. When all three targets are met, show completion confetti and +20 points.

**AC**

* Points never exceed configured caps.
* Post‑10pm steps do not change today’s points (guardrail respected).

---

## 11) Analytics

* Events: `app_open`, `water_add`, `sleep_import`, `steps_update`, `nudge_shown`, `nudge_tapped`, `targets_met`, `points_awarded` (with type), `streak_incremented`.
* Funnels: day open → water add; nudge shown → nudge tapped.
* KPIs: D1/D7 retention, % daily completion, avg hydration oz/day, streak distribution.

---

## 12) Security & Privacy

* Store tokens/scopes in SecureStore; never log health data.
* RLS on all tables; Edge functions verify `auth.uid()`.
* Clear permission copy: why we read steps/sleep, how we use it.

---

## 13) Performance & Offline

* Cache today’s `daily_metrics` in local storage and reconcile on foreground.
* Debounce hydration writes; optimistic UI with server confirm.
* Background fetch (if allowed) to finalize day at midnight‑30m.

---

## 14) Testing Plan (including existing + new tests)

**Unit (JS/TS):**

* `computeLifeScore` clamps and returns 0–100 (already included inline).
* `ringDasharray` returns correct dash/gap at 0, 1, and >1 (already inline).
* **NEW:** points calculator given synthetic inputs returns expected ledger rows.

**Example Cases**

1. Steps 100%, Hydration 100%, Sleep 95% → points: 40 + 40 + 50 + 20 = **150**; streak +1.
2. Steps 60%, Hydration 40% at 8:30pm, Sleep 80% → points: 24 + 16 + 30 = **70**; no daily bonus; no streak.
3. Hydration logged 32oz at 9:30pm, target 80oz → credited only up to target; no extra points.
4. Steps >100% after 10:30pm → **no** additional points for today.

**Integration (Device):**

* Deny Motion → Steps show “No data yet”, app remains usable.
* Connect HealthKit sleep → imports last night’s session within 5s; ring updates.

**E2E (Detox/Appium):**

* Onboarding flow completes with Motion allowed.
* Add hydration twice; Rewards page reflects earned points.

---

## 15) Delivery Plan

**MVP Sprint (2–3 weeks)**

1. RN scaffold + rings + KPIs (parity with current web UI).
2. Pedometer integration; hydration logging; manual sleep entry.
3. Life Indicator + Next Best Action; Diagnostics.
4. Supabase schema + RLS; hydration writes; day metrics fetch.
5. Points engine (Edge Function) + Rewards screen (badges static for MVP).
6. QA, performance passes, App Store/TestFlight & Play Internal.

**V1.1**

* HealthKit/Fit for sleep/hydration; streak badges; richer diagnostics; localizations.

---

## 16) Open Questions for Product

1. Confirm Life Score weights (current: 33/34/33). Do we switch to 40/30/30 (sleep heavier)?
2. Daily cutoff hours: steps (10pm), hydration (9pm) — keep as proposed?
3. Rewards redemption: MVP badges only, or add cosmetic themes unlocked by milestones?
4. Should we expose weekly Life Indicator trends (sparklines) on a second screen now or in V1.1?

---

## 17) Appendix – RN Parity Snippets

**Ring Arc (react‑native‑svg)**

```tsx
import Svg, { Circle } from 'react-native-svg';
const C = 2 * Math.PI * r;
<Circle cx={c} cy={c} r={r} stroke={color} strokeWidth={10}
  strokeLinecap="round" fill="none"
  strokeDasharray={`${C*pct} ${C*(1-pct)}`}
/>
```

**Hydration Quick Add (optimistic)**

```ts
setHydration((h)=>h+8); // local
await supabase.from('hydration_logs').insert({ amount_oz:8, ts:new Date().toISOString() });
```

**Edge Function (points award skeleton)**

```ts
// POST /points/evaluate { userId, date }
// 1) read daily_metrics  2) compute points per config  3) upsert rewards_ledger
```
