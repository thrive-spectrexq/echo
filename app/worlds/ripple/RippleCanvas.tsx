/**
 * Echo — Ripple World Canvas
 *
 * The core Ripple puzzle mechanic:
 * 1. Player taps the screen to emit ripples
 * 2. Ripples expand outward as animated circles
 * 3. When ripples pass over hidden objects, they create
 *    visible interference patterns (color shifts, distortions)
 * 4. Player deduces object locations from convergence points
 * 5. Long-press to submit a guess at that location
 *
 * Rendered with React Native Skia for GPU-accelerated graphics.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Paint,
  BlurMask,
  vec,
  useValue,
  runTiming,
} from '@shopify/react-native-skia';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/app/theme/tokens';
import type { PuzzleState, Point } from '@/app/types';

// ─── Types ───────────────────────────────────────────────────

interface Ripple {
  id: number;
  center: Point;
  startTime: number;
  maxRadius: number;
}

interface RippleCanvasProps {
  puzzle: PuzzleState;
  onGuess: (point: Point) => void;
  width: number;
  height: number;
  accentColor: string;
}

// ─── Constants ───────────────────────────────────────────────

const RIPPLE_DURATION = 2500; // ms
const RIPPLE_MAX_RADIUS = 400;
const LONG_PRESS_DURATION = 500; // ms for guess submission
const PROXIMITY_GLOW_RADIUS = 120;

// ─── Component ───────────────────────────────────────────────

export function RippleCanvas({
  puzzle,
  onGuess,
  width,
  height,
  accentColor,
}: RippleCanvasProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Continuously update for animation
  useEffect(() => {
    const tick = () => {
      setCurrentTime(Date.now());
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Clean up expired ripples
  useEffect(() => {
    setRipples((prev) =>
      prev.filter((r) => currentTime - r.startTime < RIPPLE_DURATION)
    );
  }, [currentTime]);

  // ─── Tap to create ripple ──────────────────────────────────

  const handleTap = useCallback(
    (x: number, y: number) => {
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        center: { x, y },
        startTime: Date.now(),
        maxRadius: RIPPLE_MAX_RADIUS,
      };
      setRipples((prev) => [...prev, newRipple]);
    },
    []
  );

  // ─── Long press to guess ──────────────────────────────────

  const handleGuess = useCallback(
    (x: number, y: number) => {
      onGuess({ x, y });
    },
    [onGuess]
  );

  // ─── Gestures ──────────────────────────────────────────────

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onEnd((e) => {
      runOnJS(handleGuess)(e.x, e.y);
    });

  const composedGesture = Gesture.Race(longPressGesture, tapGesture);

  // ─── Render ────────────────────────────────────────────────

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[styles.container, { width, height }]}>
        <Canvas style={[styles.canvas, { width, height }]}>
          {/* Background subtle grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Circle
              key={`grid-h-${i}`}
              cx={width / 2}
              cy={height / 2}
              r={(Math.min(width, height) / 20) * (i + 1)}
              color="rgba(255, 255, 255, 0.02)"
              style="stroke"
              strokeWidth={0.5}
            />
          ))}

          {/* Expanding ripples */}
          {ripples.map((ripple) => {
            const elapsed = currentTime - ripple.startTime;
            const progress = Math.min(elapsed / RIPPLE_DURATION, 1);
            const radius = progress * ripple.maxRadius;
            const opacity = 1 - progress;

            return (
              <Group key={ripple.id}>
                {/* Main ripple circle */}
                <Circle
                  cx={ripple.center.x}
                  cy={ripple.center.y}
                  r={radius}
                  color={`rgba(0, 229, 255, ${opacity * 0.6})`}
                  style="stroke"
                  strokeWidth={2 - progress * 1.5}
                />
                {/* Inner glow */}
                <Circle
                  cx={ripple.center.x}
                  cy={ripple.center.y}
                  r={radius * 0.3}
                  color={`rgba(0, 229, 255, ${opacity * 0.15})`}
                  style="fill"
                >
                  <BlurMask blur={10} style="normal" />
                </Circle>

                {/* Interference with hidden objects */}
                {puzzle.hiddenObjects
                  .filter((obj) => !obj.found)
                  .map((obj) => {
                    const dist = Math.sqrt(
                      (ripple.center.x - obj.position.x) ** 2 +
                        (ripple.center.y - obj.position.y) ** 2
                    );

                    // Show interference when ripple passes over object
                    const rippleNearObject =
                      Math.abs(radius - dist) < PROXIMITY_GLOW_RADIUS;

                    if (!rippleNearObject) return null;

                    const interferenceStrength =
                      1 - Math.abs(radius - dist) / PROXIMITY_GLOW_RADIUS;

                    return (
                      <Group key={`interference-${ripple.id}-${obj.id}`}>
                        {/* Bright spot where ripple hits hidden object */}
                        <Circle
                          cx={obj.position.x}
                          cy={obj.position.y}
                          r={30 * interferenceStrength}
                          color={`rgba(0, 229, 255, ${interferenceStrength * 0.5 * opacity})`}
                        >
                          <BlurMask blur={15} style="normal" />
                        </Circle>
                        {/* Ring distortion */}
                        <Circle
                          cx={obj.position.x}
                          cy={obj.position.y}
                          r={obj.radius * interferenceStrength}
                          color={`rgba(255, 255, 255, ${interferenceStrength * 0.3 * opacity})`}
                          style="stroke"
                          strokeWidth={1.5}
                        >
                          <BlurMask blur={5} style="normal" />
                        </Circle>
                      </Group>
                    );
                  })}
              </Group>
            );
          })}

          {/* Found objects — revealed */}
          {puzzle.hiddenObjects
            .filter((obj) => obj.found)
            .map((obj) => (
              <Group key={`found-${obj.id}`}>
                <Circle
                  cx={obj.position.x}
                  cy={obj.position.y}
                  r={obj.radius * 0.4}
                  color="rgba(34, 197, 94, 0.8)"
                />
                <Circle
                  cx={obj.position.x}
                  cy={obj.position.y}
                  r={obj.radius * 0.6}
                  color="rgba(34, 197, 94, 0.2)"
                >
                  <BlurMask blur={12} style="normal" />
                </Circle>
              </Group>
            ))}

          {/* Player guess markers */}
          {puzzle.playerGuesses.slice(-5).map((guess, i) => (
            <Circle
              key={`guess-${i}`}
              cx={guess.x}
              cy={guess.y}
              r={4}
              color="rgba(255, 255, 255, 0.3)"
            />
          ))}
        </Canvas>

        {/* Instructions overlay (fades after first tap) */}
        {ripples.length === 0 && (
          <View style={styles.instructionOverlay}>
            <Animated.Text style={styles.instructionText}>
              Tap to create ripples
            </Animated.Text>
            <Animated.Text style={styles.instructionSubtext}>
              Long press to mark a hidden object
            </Animated.Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  instructionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 26, 0.5)',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(240, 240, 255, 0.8)',
    letterSpacing: 1,
  },
  instructionSubtext: {
    fontSize: 13,
    color: 'rgba(240, 240, 255, 0.4)',
    marginTop: 8,
  },
});
