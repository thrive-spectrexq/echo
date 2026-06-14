/**
 * Echo — Heat World Canvas
 *
 * The Heat puzzle mechanic:
 * 1. Hidden heat sources exist on the canvas
 * 2. Player drags a "thermal sensor" across the screen
 * 3. The canvas displays a thermal gradient — color intensity
 *    indicates proximity to a heat source
 * 4. Player uses color changes to triangulate hidden sources
 * 5. Tap to submit a guess
 *
 * Uses Skia for smooth gradient heat map rendering.
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
  RadialGradient,
  vec,
  Rect,
} from '@shopify/react-native-skia';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/app/theme/tokens';
import type { PuzzleState, Point } from '@/app/types';

// ─── Types ───────────────────────────────────────────────────

interface HeatCanvasProps {
  puzzle: PuzzleState;
  onGuess: (point: Point) => void;
  width: number;
  height: number;
  accentColor: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function calculateHeatIntensity(
  sensorPos: Point,
  hiddenObjects: PuzzleState['hiddenObjects']
): number {
  let maxIntensity = 0;
  for (const obj of hiddenObjects) {
    if (obj.found) continue;
    const dist = Math.sqrt(
      (sensorPos.x - obj.position.x) ** 2 +
        (sensorPos.y - obj.position.y) ** 2
    );
    const intensity = Math.max(0, 1 - dist / 300);
    maxIntensity = Math.max(maxIntensity, intensity);
  }
  return maxIntensity;
}

function heatColor(intensity: number): string {
  // Cold (blue) → Warm (yellow) → Hot (red/orange)
  if (intensity < 0.3) {
    const t = intensity / 0.3;
    return `rgba(${Math.round(30 + t * 50)}, ${Math.round(50 + t * 50)}, ${Math.round(180 - t * 80)}, ${0.3 + t * 0.3})`;
  }
  if (intensity < 0.7) {
    const t = (intensity - 0.3) / 0.4;
    return `rgba(${Math.round(80 + t * 175)}, ${Math.round(100 + t * 100)}, ${Math.round(100 - t * 80)}, ${0.6 + t * 0.2})`;
  }
  const t = (intensity - 0.7) / 0.3;
  return `rgba(255, ${Math.round(200 - t * 140)}, ${Math.round(20 - t * 20)}, ${0.8 + t * 0.2})`;
}

// ─── Component ───────────────────────────────────────────────

export function HeatCanvas({
  puzzle,
  onGuess,
  width,
  height,
  accentColor,
}: HeatCanvasProps) {
  const [sensorPos, setSensorPos] = useState<Point>({ x: width / 2, y: height / 2 });
  const [trailPoints, setTrailPoints] = useState<Array<Point & { intensity: number }>>([]);

  const heatIntensity = calculateHeatIntensity(sensorPos, puzzle.hiddenObjects);

  // ─── Gestures ──────────────────────────────────────────────

  const handleMove = useCallback(
    (x: number, y: number) => {
      const pos = { x, y };
      setSensorPos(pos);

      const intensity = calculateHeatIntensity(pos, puzzle.hiddenObjects);
      setTrailPoints((prev) => {
        const newTrail = [...prev, { ...pos, intensity }];
        // Keep last 50 trail points
        return newTrail.slice(-50);
      });
    },
    [puzzle.hiddenObjects]
  );

  const handleGuess = useCallback(
    (x: number, y: number) => {
      onGuess({ x, y });
    },
    [onGuess]
  );

  const panGesture = Gesture.Pan().onUpdate((e) => {
    runOnJS(handleMove)(e.x, e.y);
  });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleGuess)(e.x, e.y);
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Sensor glow color based on heat
  const sensorColor = heatColor(heatIntensity);
  const sensorGlowRadius = 30 + heatIntensity * 60;

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[styles.container, { width, height }]}>
        <Canvas style={[styles.canvas, { width, height }]}>
          {/* Heat trail — shows where you've probed */}
          {trailPoints.map((point, i) => (
            <Circle
              key={`trail-${i}`}
              cx={point.x}
              cy={point.y}
              r={6 + point.intensity * 8}
              color={heatColor(point.intensity)}
              opacity={0.3 + (i / trailPoints.length) * 0.4}
            >
              <BlurMask blur={8} style="normal" />
            </Circle>
          ))}

          {/* Ambient heat glow from hidden objects (subtle) */}
          {puzzle.hiddenObjects
            .filter((obj) => !obj.found)
            .map((obj) => (
              <Circle
                key={`ambient-${obj.id}`}
                cx={obj.position.x}
                cy={obj.position.y}
                r={obj.radius * 2}
                color="rgba(255, 140, 0, 0.04)"
              >
                <BlurMask blur={40} style="normal" />
              </Circle>
            ))}

          {/* Sensor probe */}
          <Group>
            {/* Outer glow */}
            <Circle
              cx={sensorPos.x}
              cy={sensorPos.y}
              r={sensorGlowRadius}
              color={sensorColor}
              opacity={0.2}
            >
              <BlurMask blur={25} style="normal" />
            </Circle>
            {/* Middle ring */}
            <Circle
              cx={sensorPos.x}
              cy={sensorPos.y}
              r={20}
              color={sensorColor}
              style="stroke"
              strokeWidth={2}
              opacity={0.8}
            />
            {/* Center dot */}
            <Circle
              cx={sensorPos.x}
              cy={sensorPos.y}
              r={5}
              color={sensorColor}
            />
            {/* Crosshair lines */}
            <Circle
              cx={sensorPos.x}
              cy={sensorPos.y}
              r={30}
              color={sensorColor}
              style="stroke"
              strokeWidth={0.5}
              opacity={0.4}
            />
          </Group>

          {/* Found objects */}
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
                  r={obj.radius * 0.8}
                  color="rgba(34, 197, 94, 0.15)"
                >
                  <BlurMask blur={15} style="normal" />
                </Circle>
              </Group>
            ))}
        </Canvas>

        {/* Temperature indicator bar */}
        <View style={styles.tempBar}>
          <View
            style={[
              styles.tempFill,
              {
                height: `${heatIntensity * 100}%`,
                backgroundColor: heatColor(heatIntensity).replace(/[\d.]+\)$/, '1)'),
              },
            ]}
          />
        </View>

        {/* Instructions */}
        {puzzle.attempts === 0 && trailPoints.length === 0 && (
          <View style={styles.instructionOverlay}>
            <Animated.Text style={styles.instructionText}>
              Drag to scan for heat
            </Animated.Text>
            <Animated.Text style={styles.instructionSubtext}>
              Tap where you sense the source
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
  tempBar: {
    position: 'absolute',
    right: 12,
    top: 40,
    bottom: 40,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tempFill: {
    width: '100%',
    borderRadius: 2,
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
