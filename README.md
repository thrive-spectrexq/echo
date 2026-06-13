# Echo 🌊

> *Solve with your senses, not your fingers.*

A premium mind puzzle game for iOS and Android built with React Native. You never see the hidden object directly — only its **effects** on the environment. Read the ripples. Decode the shadow. Trust the signal.

[![License: MIT](https://img.shields.io/badge/License-MIT-7B61FF.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)]()
[![Built with](https://img.shields.io/badge/built%20with-React%20Native%200.74-blue.svg)]()

---

## Table of Contents

- [Concept](#concept)
- [Puzzle Worlds](#puzzle-worlds)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [State Management](#state-management)
  - [Navigation](#navigation)
  - [Puzzle Engine](#puzzle-engine)
  - [Sensor Layer](#sensor-layer)
  - [Audio Engine](#audio-engine)
  - [Data Layer](#data-layer)
- [Screens & Components](#screens--components)
- [Puzzle Schema](#puzzle-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running on Device](#running-on-device)
- [Testing Strategy](#testing-strategy)
- [Release & CI/CD](#release--cicd)
- [Monetisation](#monetisation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Concept

Echo is a deduction puzzle game built around a single elegant rule:

> **The hidden object is never shown. Only its effect on the world is visible.**

Each puzzle world uses a different physical metaphor — ripples, shadows, resonance, heat gradients, sonar echoes — to hide the same core mechanic: *observe the indirect evidence, infer the truth*.

---

## Puzzle Worlds

| World | Mechanic | Sensor Used | Levels |
|-------|----------|-------------|--------|
| 🌊 **Ripple** | Expanding rings emanate from a hidden source point. Tap the canvas to probe; each attempt reveals more. | Touch | 60 |
| 🌑 **Shadow** | A 3D silhouette is cast by stacked hidden shapes. Choose the combination that produces the exact shadow. | Touch | 50 |
| 📡 **Signal** | A hidden wave pattern is broadcast. Match it by adjusting sliders until your output waveform aligns. | Touch | 45 |
| 🌡️ **Heat** | A grid shows a temperature gradient. Deduce the location and intensity of hidden heat sources. | Touch | 50 |
| 🧲 **Gravity** | Tilt the device to roll a hidden object. Infer its mass and shape from how it resists movement. | Gyroscope / Accelerometer | 40 |
| 🔊 **Resonance** | Tap to emit tones. A hidden shape "rings" at specific frequencies. Identify it by ear. | Microphone / Speaker | 35 |
| 🌙 **Ambient** | Puzzles that only unlock in certain real-world conditions — darkness, specific compass bearing, midnight. | Ambient Light / Compass / Clock | 20 |
| 🔁 **Mirror** | A reflection is shown but the axis and origin are hidden. Reconstruct the original. | Touch | 45 |

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | React Native 0.74 (New Architecture) | Cross-platform, mature ecosystem |
| Language | TypeScript 5.x | Type safety across puzzle schemas |
| Navigation | React Navigation 7 (Native Stack) | Native feel, well-maintained |
| State | Zustand + Immer | Lightweight, no boilerplate, easy slice pattern |
| Async state | TanStack Query v5 | Server data, level sync, leaderboards |
| Animation | Reanimated 3 + Skia | 60/120fps canvas for Ripple, Heat, Signal worlds |
| 2D Canvas | `@shopify/react-native-skia` | GPU-accelerated; replaces Canvas API |
| Sensors | `react-native-sensors` | Gyroscope, accelerometer, compass |
| Audio | `react-native-sound` + `expo-av` | Playback (Resonance world) |
| Microphone | `react-native-audio-recorder-player` | Frequency capture (Resonance world) |
| Storage | `@op-engineering/op-sqlite` + MMKV | SQLite for puzzle progress; MMKV for fast prefs |
| Haptics | `react-native-haptic-feedback` | Tactile feedback on solve/fail |
| Purchases | `react-native-iap` | iOS + Android in-app purchases |
| Analytics | PostHog (self-hostable) | Privacy-respecting event tracking |
| Crash reporting | Sentry | Error boundaries + native crash symbolication |
| CI/CD | GitHub Actions + Fastlane | Automated builds, TestFlight, Play Store |
| Testing | Jest + RNTL + Detox | Unit → Integration → E2E |

---

## Project Structure

```
echo/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # PR checks: lint, type, unit tests
│       └── release.yml             # Build + deploy to TestFlight / Play Store
├── android/                        # Android native project (managed by RN)
├── ios/                            # iOS native project (managed by RN)
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root component, providers
│   │   └── providers/
│   │       ├── ThemeProvider.tsx
│   │       ├── AudioProvider.tsx
│   │       └── SensorProvider.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Tab + Stack composition
│   │   ├── HomeStack.tsx
│   │   ├── PuzzleStack.tsx
│   │   └── routes.ts               # Typed route params
│   │
│   ├── screens/
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx      # World selector
│   │   │   └── WorldCard.tsx
│   │   ├── puzzle/
│   │   │   ├── PuzzleScreen.tsx    # Shell: loads the right world renderer
│   │   │   └── SolvedModal.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── onboarding/
│   │       └── OnboardingScreen.tsx
│   │
│   ├── worlds/                     # One folder per puzzle world
│   │   ├── ripple/
│   │   │   ├── RippleWorld.tsx     # World renderer (Skia canvas)
│   │   │   ├── ripple.engine.ts    # Pure logic: no RN imports
│   │   │   ├── ripple.levels.ts    # Level definitions (schema below)
│   │   │   └── ripple.test.ts
│   │   ├── shadow/
│   │   │   ├── ShadowWorld.tsx
│   │   │   ├── shadow.engine.ts
│   │   │   ├── shadow.levels.ts
│   │   │   └── shadow.test.ts
│   │   ├── signal/
│   │   ├── heat/
│   │   ├── gravity/
│   │   ├── resonance/
│   │   ├── ambient/
│   │   └── mirror/
│   │
│   ├── engine/
│   │   ├── PuzzleEngine.ts         # World-agnostic puzzle lifecycle
│   │   ├── ScoreEngine.ts          # Attempt counting, star rating
│   │   └── HintEngine.ts           # Progressive hint unlock logic
│   │
│   ├── sensors/
│   │   ├── useGyroscope.ts
│   │   ├── useAccelerometer.ts
│   │   ├── useCompass.ts
│   │   ├── useAmbientLight.ts
│   │   └── useMicrophone.ts
│   │
│   ├── audio/
│   │   ├── AudioEngine.ts          # Singleton audio manager
│   │   ├── tones.ts                # Frequency maps for Resonance world
│   │   └── sfx.ts                  # UI sound effects
│   │
│   ├── store/
│   │   ├── useProgressStore.ts     # Puzzle completion, stars, unlocks
│   │   ├── useSettingsStore.ts     # Sound, haptics, theme prefs
│   │   └── useSessionStore.ts      # Current puzzle attempt state
│   │
│   ├── data/
│   │   ├── db.ts                   # op-sqlite setup + migrations
│   │   ├── migrations/
│   │   │   └── 001_initial.sql
│   │   └── repositories/
│   │       ├── ProgressRepository.ts
│   │       └── PuzzleRepository.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── StarRating.tsx
│   │   └── puzzle/
│   │       ├── AttemptCounter.tsx
│   │       ├── HintBanner.tsx
│   │       └── WorldHeader.tsx
│   │
│   ├── theme/
│   │   ├── colors.ts               # Dark + light palettes
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── usePuzzle.ts            # Unified puzzle state hook
│   │   ├── useHaptics.ts
│   │   └── usePurchases.ts
│   │
│   ├── utils/
│   │   ├── math.ts                 # Vector2, distance, clamp helpers
│   │   ├── color.ts                # HSL interpolation for Heat world
│   │   └── format.ts
│   │
│   └── types/
│       ├── puzzle.types.ts
│       ├── world.types.ts
│       └── navigation.types.ts
│
├── assets/
│   ├── fonts/
│   ├── sounds/
│   │   ├── sfx/
│   │   └── tones/
│   └── images/
│
├── __tests__/
│   └── e2e/                        # Detox E2E specs
│
├── fastlane/
│   ├── Fastfile
│   └── Appfile
│
├── app.json
├── babel.config.js
├── tsconfig.json
├── metro.config.js
├── package.json
└── README.md
```

---

## Architecture

### State Management

Echo uses **Zustand** with an Immer middleware for immutable updates. State is split into three stores:

```
┌─────────────────────────────────────────────────────────┐
│                     Zustand Stores                      │
│                                                         │
│  useProgressStore        useSessionStore                │
│  ─────────────────        ────────────────              │
│  • worlds unlocked        • currentWorldId              │
│  • levels completed       • currentLevelId              │
│  • star ratings           • attempts []                 │
│  • total stars            • hintsUsed                   │
│  • purchasedWorlds        • startedAt                   │
│                           • isSolved                    │
│  persisted → MMKV         in-memory only                │
│                                                         │
│  useSettingsStore                                       │
│  ─────────────────                                      │
│  • soundEnabled                                         │
│  • hapticsEnabled                                       │
│  • theme: 'dark' | 'light'                              │
│  • onboardingComplete                                   │
│  persisted → MMKV                                       │
└─────────────────────────────────────────────────────────┘
```

Puzzle progress is additionally written to **SQLite** via `ProgressRepository` for structured querying (e.g. "all 3-star levels in Ripple world").

---

### Navigation

```
RootNavigator (Native Stack)
├── OnboardingStack          ← shown once on first launch
│   └── OnboardingScreen
│
└── MainTabs (Bottom Tabs)
    ├── HomeStack
    │   ├── HomeScreen        ← world grid
    │   └── WorldDetailScreen ← level list for a world
    │
    ├── PuzzleStack (modal presentation)
    │   └── PuzzleScreen      ← renders <{World}World /> dynamically
    │       └── SolvedModal
    │
    └── SettingsStack
        └── SettingsScreen
```

Route params are fully typed via `navigation.types.ts`:

```ts
export type PuzzleStackParams = {
  Puzzle: {
    worldId: WorldId;
    levelId: string;
  };
};
```

---

### Puzzle Engine

The `PuzzleEngine` is a world-agnostic lifecycle manager. Each world implements the `WorldAdapter` interface:

```ts
// types/world.types.ts

export interface WorldAdapter<TState, TAttempt> {
  /** Build the initial runtime state from a level definition */
  init(level: PuzzleLevel): TState;

  /** Evaluate a player attempt. Returns feedback, never mutates state. */
  evaluate(state: TState, attempt: TAttempt): EvaluationResult;

  /** Generate a progressive hint given current attempt history */
  hint(state: TState, attempts: TAttempt[]): HintPayload;
}

export type EvaluationResult =
  | { outcome: 'correct' }
  | { outcome: 'incorrect'; feedback: string; proximity?: number }
  | { outcome: 'partial'; matchedCount: number; totalCount: number };
```

The `PuzzleScreen` loads the correct `WorldAdapter` by `worldId` and delegates all game logic to it. The UI layer only calls `engine.evaluate()` and `engine.hint()` — it never contains puzzle logic directly.

```
PuzzleScreen
  └── usePuzzle(worldId, levelId)
        ├── loads WorldAdapter dynamically
        ├── manages attempt history in useSessionStore
        ├── calls adapter.evaluate() on each attempt
        ├── unlocks hints via HintEngine after N failures
        └── triggers SolvedModal on correct result
```

---

### Sensor Layer

Each sensor is a custom hook that abstracts the native module, normalises values, and cleans up on unmount:

```ts
// sensors/useGyroscope.ts

export function useGyroscope(intervalMs = 16) {
  const [rotation, setRotation] = useState<Vector3>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const sub = gyroscope.subscribe(({ x, y, z }) => {
      setRotation({ x, y, z });
    }, intervalMs);
    return () => sub.unsubscribe();
  }, [intervalMs]);

  return rotation;
}
```

The **Gravity world** consumes `useGyroscope` + `useAccelerometer` and feeds values into a simple physics simulation (Euler integration at 60fps via Reanimated worklets — runs on the UI thread, no JS bridge hop).

The **Ambient world** uses:

```ts
useAmbientLight()   → lux value → puzzle unlocks when lux < 5
useCompass()        → degrees   → puzzle unlocks when facing 180° ± 15°
// "midnight" puzzles: solved by checking Date at attempt time
```

---

### Audio Engine

```
AudioEngine (singleton)
├── loadTone(frequency: number): Promise<Sound>
├── playTone(id: string, options: ToneOptions): void
├── stopAll(): void
└── analyseInput(buffer: Float32Array): FrequencyMap
         ↑
    used by Resonance world to compare
    player's matched frequency against target
```

The **Resonance world** flow:

1. Player taps a shape icon → `AudioEngine.playTone(targetFreq)` — the "black box shape" hums
2. Player drags a frequency slider → `AudioEngine.playTone(playerFreq)`
3. When `Math.abs(playerFreq - targetFreq) < THRESHOLD`, `evaluate()` returns `correct`
4. Optionally: microphone mode — player hums into phone, `analyseInput()` extracts dominant frequency

---

### Data Layer

```
┌──────────────────────────────────────────┐
│              Data Layer                  │
│                                          │
│  MMKV                                    │
│  └── useProgressStore  (fast R/W)        │
│  └── useSettingsStore  (fast R/W)        │
│                                          │
│  op-sqlite                               │
│  └── progress table                      │
│      • worldId, levelId, stars,          │
│        attempts, solvedAt, hintsUsed     │
│  └── ProgressRepository                  │
│      • save(), getByWorld(), getStats()  │
│                                          │
│  Static JSON (bundled)                   │
│  └── worlds/{worldId}/levels.json        │
│      • all level definitions             │
│      • never fetched at runtime          │
└──────────────────────────────────────────┘
```

No backend required for v1. Level content ships with the app. A future v2 may add a sync service for cloud backup and community-created levels.

---

## Screens & Components

### HomeScreen

Displays a grid of world cards. Locked worlds show a padlock and the unlock condition (purchase or star gate).

```
HomeScreen
├── WorldCard × 8
│   ├── animated preview (Skia mini-canvas, 80×80)
│   ├── world name + tagline
│   ├── progress ring (% levels solved)
│   └── lock state (free / purchasable / star-gated)
└── TotalStarsBadge (top right)
```

### PuzzleScreen

Shell screen that dynamically renders the correct world component:

```ts
const WORLD_COMPONENTS: Record<WorldId, React.FC<WorldProps>> = {
  ripple: RippleWorld,
  shadow: ShadowWorld,
  signal: SignalWorld,
  heat: HeatWorld,
  gravity: GravityWorld,
  resonance: ResonanceWorld,
  ambient: AmbientWorld,
  mirror: MirrorWorld,
};
```

### World Components

Each world exports a single `<{Name}World levelId={...} />` component that:

- Renders its Skia canvas or native UI
- Reads attempt state from `useSessionStore`
- Dispatches attempts via `usePuzzle().attempt(payload)`
- Never contains evaluation logic (delegated to engine)

---

## Puzzle Schema

Every level across all worlds conforms to `PuzzleLevel`:

```ts
// types/puzzle.types.ts

export type WorldId =
  | 'ripple' | 'shadow' | 'signal' | 'heat'
  | 'gravity' | 'resonance' | 'ambient' | 'mirror';

export interface PuzzleLevel {
  id: string;                   // e.g. "ripple_042"
  worldId: WorldId;
  index: number;                // display order within world
  difficulty: 1 | 2 | 3;       // 1=easy 2=medium 3=hard
  solution: unknown;            // world-specific, typed per adapter
  config: unknown;              // world-specific render config
  maxAttempts: number | null;   // null = unlimited
  hintThreshold: number;        // attempts before first hint unlocks
}
```

World-specific extensions:

```ts
// worlds/ripple/ripple.levels.ts
export interface RippleLevel extends PuzzleLevel {
  worldId: 'ripple';
  solution: { x: number; y: number };  // normalised 0–1
  config: {
    canvasWidth: number;
    canvasHeight: number;
    rippleSpeed: number;
    rippleDecay: number;
    noiseLevel: number;           // interference to add challenge
  };
}

// worlds/shadow/shadow.levels.ts
export interface ShadowLevel extends PuzzleLevel {
  worldId: 'shadow';
  solution: ShapeId[];            // ordered stack of shapes
  config: {
    cameraAngle: { x: number; y: number; z: number };
    lightDirection: Vector3;
    availableShapes: ShapeId[];   // pool shown to player
  };
}
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Ruby ≥ 3.2 (for Fastlane / iOS)
- Xcode ≥ 15 (macOS only, for iOS builds)
- Android Studio + SDK 34
- CocoaPods (`gem install cocoapods`)
- React Native CLI (`npm install -g @react-native-community/cli`)

### Installation

```bash
# 1. Clone
git clone https://github.com/thrive-spectrexq/echo.git
cd echo

# 2. Install JS dependencies
npm install

# 3. Install iOS pods
cd ios && pod install && cd ..

# 4. Copy environment file
cp .env.example .env
```

---

## Environment Variables

```bash
# .env.example

# Sentry
SENTRY_DSN=

# PostHog analytics
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com

# RevenueCat (in-app purchases)
REVENUECAT_IOS_KEY=
REVENUECAT_ANDROID_KEY=

# Feature flags (set to 'true' to enable in dev)
ENABLE_AMBIENT_WORLD=false
ENABLE_RESONANCE_WORLD=false
```

---

## Running on Device

```bash
# iOS simulator
npx react-native run-ios

# iOS physical device (requires Apple Developer account)
npx react-native run-ios --device "Your iPhone Name"

# Android emulator
npx react-native run-android

# Android physical device
npx react-native run-android --deviceId YOUR_DEVICE_ID
```

> **Note:** The Gravity, Resonance, and Ambient worlds require a physical device. Sensor APIs are not available in simulators.

---

## Testing Strategy

```
Unit tests (Jest)
└── src/worlds/*/  *.engine.test.ts
    • WorldAdapter.evaluate() covers all outcomes
    • edge cases: boundary taps, exact match, partial match
    • pure functions only — no RN imports

Integration tests (React Native Testing Library)
└── src/screens/  *.test.tsx
    • PuzzleScreen renders correct world for each worldId
    • usePuzzle hook transitions: idle → attempting → solved
    • ProgressRepository reads/writes correctly

E2E tests (Detox)
└── __tests__/e2e/
    • onboarding flow
    • complete a Ripple level end-to-end
    • purchase flow (sandbox)
    • settings toggles persist across app restarts
```

```bash
# Run unit + integration tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E (requires running simulator)
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug
```

---

## Release & CI/CD

### GitHub Actions

**`ci.yml`** — runs on every PR:
- ESLint + TypeScript check
- Jest unit tests
- Bundle size check (Metro bundle, warn if > 8MB)

**`release.yml`** — runs on push to `main`:
- Bump version via `standard-version`
- Build iOS `.ipa` via Fastlane `gym`
- Upload to TestFlight via Fastlane `pilot`
- Build Android `.aab` via Fastlane `gradle`
- Upload to Play Store internal track via Fastlane `supply`

### Fastlane

```ruby
# fastlane/Fastfile

lane :beta do
  increment_build_number
  build_app(scheme: "Echo")
  upload_to_testflight(skip_waiting_for_build_processing: true)
end

lane :release do
  build_app(scheme: "Echo")
  upload_to_app_store(force: true)
end
```

---

## Monetisation

Echo uses a **free + one-time unlock** model — no subscriptions, no ads, ever.

| Tier | Content | Price |
|------|---------|-------|
| Free | Ripple world (60 levels) + Shadow world (50 levels) | $0 |
| World Pack | Any single additional world | $1.99 |
| Echo Complete | All 8 worlds, forever | $4.99 |

Implementation via **RevenueCat** (wraps `react-native-iap`):

```ts
// hooks/usePurchases.ts
export function usePurchases() {
  const purchase = async (packageId: 'world_pack' | 'echo_complete') => { ... };
  const restore = async () => { ... };
  return { purchase, restore, purchasedWorlds };
}
```

Purchased world IDs are stored in `useProgressStore.purchasedWorlds` and synced via RevenueCat's entitlement system.

---

## Roadmap

### v1.0 — Launch
- [x] Ripple world (60 levels)
- [x] Shadow world (50 levels)
- [ ] Signal world (45 levels)
- [ ] Heat world (50 levels)
- [ ] Onboarding flow
- [ ] IAP integration
- [ ] Dark theme only

### v1.1
- [ ] Gravity world (gyroscope)
- [ ] Light theme option
- [ ] Haptic feedback tuning
- [ ] Accessibility: VoiceOver support for Shadow world

### v1.2
- [ ] Resonance world (audio)
- [ ] Ambient world (sensors)
- [ ] Mirror world

### v2.0
- [ ] iCloud / Google sync for progress
- [ ] Community level creator
- [ ] Daily challenge (one level per world, refreshed at midnight)
- [ ] Leaderboard (fewest attempts per level)

---

## Contributing

This project is currently in solo development. Issues and ideas welcome via GitHub Issues. PRs accepted after v1.0 ships.

```bash
# Before submitting a PR
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm test              # Jest
```

Code style: Prettier defaults, enforced via pre-commit hook (`husky` + `lint-staged`).

---

## License

MIT © Echo Contributors
