# Echo 🌊

> Read the ripples. Decode the shadows. Trust the signal.

Echo is a premium offline puzzle game for iPhone built using React Native, Expo, Swift, and Objective-C.

Unlike traditional puzzle games, players never directly see the hidden object. Instead, they observe the object's effects on the environment and use logic, pattern recognition, and deduction to uncover the truth.

Designed specifically for iOS, Echo delivers a native Apple experience with smooth animations, sensor-driven interactions, immersive audio, and complete offline functionality.

---

# Features

## Core Gameplay

* Deduction-based puzzle solving
* Hidden-object mechanics
* Multiple puzzle worlds
* Progressive difficulty
* Hint system
* Star-based progression
* Achievement tracking

## Offline First

Echo is fully functional without an internet connection.

### Available Offline

* Complete gameplay
* Puzzle progression
* Local saves
* Audio interactions
* Sensor-based mechanics
* Settings and preferences
* Haptic feedback

No account registration required.

No backend required.

No internet connection required after installation.

---

# Puzzle Worlds

## 🌊 Ripple

Locate hidden sources by analyzing expanding wave patterns.

### Levels

60

### Input

Touch

---

## 🌑 Shadow

Identify hidden shapes from projected silhouettes.

### Levels

50

### Input

Touch

---

## 📡 Signal

Decode hidden waveforms and match transmission patterns.

### Levels

45

### Input

Touch

---

## 🌡️ Heat

Analyze thermal gradients to locate hidden heat sources.

### Levels

50

### Input

Touch

---

## 🧲 Gravity

Use device motion to infer hidden mass and object behavior.

### Levels

40

### Input

Gyroscope & Accelerometer

---

## 🔊 Resonance

Identify hidden structures through sound frequencies and vibration patterns.

### Levels

35

### Input

Speaker & Microphone

---

## 🌙 Ambient

Special puzzles unlocked through environmental conditions.

### Examples

* Darkness
* Compass direction
* Time of day

### Levels

20

---

## 🔁 Mirror

Reconstruct hidden objects using distorted reflections.

### Levels

45

---

# Technology Stack

## Frontend

| Technology              | Purpose              |
| ----------------------- | -------------------- |
| React Native 0.74+      | Cross-platform UI    |
| Expo SDK 51+            | Development platform |
| TypeScript 5.x          | Type safety          |
| Expo Router             | Navigation           |
| Zustand                 | State management     |
| React Native Reanimated | Animations           |
| React Native Skia       | GPU rendering        |

---

## Native iOS

| Technology   | Purpose               |
| ------------ | --------------------- |
| Swift 5.10+  | Native functionality  |
| Objective-C  | Native bridge support |
| SwiftUI      | Native interfaces     |
| UIKit        | Low-level UI          |
| CoreMotion   | Sensors               |
| AVFoundation | Audio                 |
| CoreHaptics  | Haptics               |
| CoreGraphics | Rendering             |

---

## Storage

| Technology   | Purpose           |
| ------------ | ----------------- |
| SQLite       | Progress tracking |
| MMKV         | Settings storage  |
| Local Assets | Puzzle data       |

All data remains on the device.

---

# Architecture

## Application Layer

React Native manages:

* Navigation
* Screens
* Game UI
* State management

---

## Native Layer

Swift and Objective-C provide:

* Motion sensors
* Audio processing
* Haptics
* Device integrations

---

## Data Layer

SQLite stores:

* Puzzle progress
* Level completion
* Statistics
* Achievements

MMKV stores:

* Preferences
* Themes
* Accessibility settings

---

# Project Structure

```text
echo/
│
├── app/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── worlds/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   └── types/
│
├── ios/
│   ├── Swift/
│   ├── ObjectiveC/
│   └── NativeModules/
│
├── database/
│   └── sqlite/
│
├── assets/
│   ├── sounds/
│   ├── images/
│   ├── fonts/
│   └── levels/
│
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# Getting Started

## Prerequisites

### macOS

* macOS Sonoma or later
* Xcode 15+
* Node.js 20+
* Apple Developer Account
* CocoaPods

---

# Installation

Clone the repository:

```bash
git clone https://github.com/your-username/echo.git

cd echo
```

Install dependencies:

```bash
npm install
```

---

# Running Locally

## Start Expo Development Server

```bash
npx expo start
```

---

## Run with Expo Go

1. Install Expo Go on your iPhone
2. Connect iPhone and Mac to the same network
3. Start the Expo server
4. Scan the QR code
5. Launch Echo instantly

---

## Run on iOS Simulator

```bash
npx expo start --ios
```

---

## Run on Physical iPhone

```bash
npx expo run:ios
```

or

```bash
npx react-native run-ios
```

---

# Native Development

When adding Swift or Objective-C modules:

Generate native project files:

```bash
npx expo prebuild
```

Install CocoaPods:

```bash
cd ios

pod install

cd ..
```

Open the project:

```bash
open ios/Echo.xcworkspace
```

---

# Local Database

## SQLite Schema

### Progress

* World ID
* Level ID
* Attempts
* Stars
* Completion Date

### Statistics

* Total Stars
* Levels Completed
* Hint Usage
* Play Time

---

# State Management

Echo uses Zustand.

## Stores

### Progress Store

Tracks:

* Completed levels
* World unlocks
* Star ratings

### Session Store

Tracks:

* Current level
* Attempts
* Hint status

### Settings Store

Tracks:

* Theme
* Sound
* Haptics
* Accessibility

---

# Audio System

AVFoundation powers:

* Sound effects
* Resonance puzzles
* Frequency matching
* Audio feedback

Future versions may support:

* Spatial audio
* AirPods enhancements

---

# Sensor System

CoreMotion provides:

## Gravity World

* Accelerometer
* Gyroscope

## Ambient World

* Compass
* Device orientation

Future support:

* Barometer
* LiDAR

---

# Accessibility

Planned support includes:

* VoiceOver
* Dynamic Type
* High Contrast Mode
* Reduced Motion
* Haptic Alternatives

---

# Testing

## Unit Tests

```bash
npm test
```

---

## Coverage

```bash
npm test -- --coverage
```

---

## iOS Build Validation

```bash
npx expo run:ios
```

---

# TestFlight Distribution

## Build

```bash
eas build --platform ios
```

---

## Submit

```bash
eas submit --platform ios
```

---

# Deployment Workflow

```text
Developer
    │
    ▼
Expo Development
    │
    ▼
EAS Build
    │
    ▼
App Store Connect
    │
    ▼
TestFlight
    │
    ▼
Beta Testing
    │
    ▼
App Store Release
```

---

# Security & Privacy

Echo is designed with privacy first.

## Data Collection

None.

## Tracking

None.

## Advertisements

None.

## User Accounts

None.

## Third-Party Analytics

None in Version 1.0.

All gameplay data remains on the user's device.

---

# Roadmap

## Version 1.0

* Ripple World
* Shadow World
* Heat World
* Offline Gameplay
* Local Save System
* TestFlight Release

---

## Version 1.1

* Gravity World
* Enhanced Haptics
* Accessibility Improvements

---

## Version 1.2

* Resonance World
* Ambient World
* Additional Levels

---

## Version 2.0

* Optional iCloud Backup
* Game Center Integration
* Community Puzzle Packs
* Daily Challenges

---

# Future Apple Features

Planned native integrations:

* Dynamic Island
* Live Activities
* Siri Shortcuts
* Widgets
* iCloud Sync
* Game Center
* Apple Vision Pro Support

---

# License

MIT License
