/**
 * Echo — Shadow World Canvas
 *
 * The Shadow puzzle mechanic:
 * 1. A hidden shape casts a shadow/silhouette onto the canvas
 * 2. Player drags to rotate the "light source" direction
 * 3. The shadow changes shape as the angle changes
 * 4. Player must identify the hidden shape and tap its location
 *
 * Uses Skia for path-based shadow rendering.
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  Circle,
  Group,
  BlurMask,
  Skia,
} from '@shopify/react-native-skia';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/app/theme/tokens';
import type { PuzzleState, Point } from '@/app/types';

// ─── Types ───────────────────────────────────────────────────

interface ShadowCanvasProps {
  puzzle: PuzzleState;
  onGuess: (point: Point) => void;
  width: number;
  height: number;
  accentColor: string;
}

// ─── Shadow Shapes ───────────────────────────────────────────

type ShapeType = 'triangle' | 'square' | 'pentagon' | 'star' | 'hexagon';

function generateShadowPath(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  shapeType: ShapeType
): string {
  const perspective = Math.cos(angle * (Math.PI / 180));
  const skew = Math.sin(angle * (Math.PI / 180)) * 0.5;

  const sides =
    shapeType === 'triangle' ? 3
    : shapeType === 'square' ? 4
    : shapeType === 'pentagon' ? 5
    : shapeType === 'hexagon' ? 6
    : 5; // star

  const points: Point[] = [];
  const r = radius * (0.8 + Math.abs(perspective) * 0.4);

  for (let i = 0; i < sides; i++) {
    const baseAngle = (2 * Math.PI * i) / sides - Math.PI / 2;

    if (shapeType === 'star' && i % 2 === 1) {
      // Inner star points
      const innerR = r * 0.4;
      points.push({
        x: cx + Math.cos(baseAngle) * innerR * (1 + skew),
        y: cy + Math.sin(baseAngle) * innerR * perspective,
      });
    } else {
      points.push({
        x: cx + Math.cos(baseAngle) * r * (1 + skew * 0.3),
        y: cy + Math.sin(baseAngle) * r * perspective,
      });
    }
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  path += ' Z';

  return path;
}

const SHAPE_TYPES: ShapeType[] = ['triangle', 'square', 'pentagon', 'star', 'hexagon'];

// ─── Component ───────────────────────────────────────────────

export function ShadowCanvas({
  puzzle,
  onGuess,
  width,
  height,
  accentColor,
}: ShadowCanvasProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const startX = useSharedValue(0);

  // Assign a shape type to each hidden object based on its id
  const getShapeType = (objIndex: number): ShapeType => {
    return SHAPE_TYPES[objIndex % SHAPE_TYPES.length];
  };

  // ─── Gestures ──────────────────────────────────────────────

  const handleTap = useCallback(
    (x: number, y: number) => {
      onGuess({ x, y });
    },
    [onGuess]
  );

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      startX.value = e.x;
    })
    .onUpdate((e) => {
      const delta = (e.x - startX.value) * 0.5;
      runOnJS(setRotationAngle)((prev: number) => prev + delta);
      startX.value = e.x;
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[styles.container, { width, height }]}>
        <Canvas style={[styles.canvas, { width, height }]}>
          {/* Ambient light indicator */}
          <Circle
            cx={width / 2 + Math.cos((rotationAngle * Math.PI) / 180) * 100}
            cy={60}
            r={15}
            color="rgba(168, 85, 247, 0.6)"
          >
            <BlurMask blur={20} style="normal" />
          </Circle>

          {/* Shadow projections for hidden objects */}
          {puzzle.hiddenObjects.map((obj, index) => {
            if (obj.found) return null;

            const shapeType = getShapeType(index);
            const shadowPath = generateShadowPath(
              obj.position.x,
              obj.position.y,
              obj.radius * 1.5,
              rotationAngle,
              shapeType
            );

            const skiaPath = Skia.Path.MakeFromSVGString(shadowPath);
            if (!skiaPath) return null;

            return (
              <Group key={`shadow-${obj.id}`}>
                {/* Shadow blur */}
                <Path
                  path={skiaPath}
                  color="rgba(168, 85, 247, 0.15)"
                >
                  <BlurMask blur={20} style="normal" />
                </Path>
                {/* Shadow solid */}
                <Path
                  path={skiaPath}
                  color="rgba(168, 85, 247, 0.4)"
                  style="fill"
                />
                {/* Shadow edge */}
                <Path
                  path={skiaPath}
                  color="rgba(168, 85, 247, 0.6)"
                  style="stroke"
                  strokeWidth={1}
                />
              </Group>
            );
          })}

          {/* Found objects */}
          {puzzle.hiddenObjects
            .filter((obj) => obj.found)
            .map((obj, index) => {
              const shapeType = getShapeType(
                puzzle.hiddenObjects.indexOf(obj)
              );
              const path = generateShadowPath(
                obj.position.x,
                obj.position.y,
                obj.radius * 1.2,
                0,
                shapeType
              );
              const skiaPath = Skia.Path.MakeFromSVGString(path);
              if (!skiaPath) return null;

              return (
                <Group key={`found-${obj.id}`}>
                  <Path
                    path={skiaPath}
                    color="rgba(34, 197, 94, 0.6)"
                    style="fill"
                  />
                  <Path
                    path={skiaPath}
                    color="rgba(34, 197, 94, 0.8)"
                    style="stroke"
                    strokeWidth={2}
                  />
                </Group>
              );
            })}

          {/* Guess markers */}
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

        {/* Instructions */}
        {puzzle.attempts === 0 && (
          <View style={styles.instructionOverlay}>
            <Animated.Text style={styles.instructionText}>
              Drag to rotate the light
            </Animated.Text>
            <Animated.Text style={styles.instructionSubtext}>
              Tap where you think the shape is
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
