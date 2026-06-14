/**
 * Echo — Puzzle Gameplay Screen
 *
 * The main gameplay canvas. Routes to the correct world renderer
 * based on worldId. Manages the game HUD, timer, and completion flow.
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSessionStore, useProgressStore, useSettingsStore } from '@/app/store';
import { generateLevelConfig, generateHiddenObjects, calculateStars } from '@/app/engine';
import { Colors, Typography, Spacing, Radius, WORLD_CONFIGS } from '@/app/theme/tokens';
import { StarRating } from '@/app/components';
import { RippleCanvas } from '@/app/worlds/ripple/RippleCanvas';
import { ShadowCanvas } from '@/app/worlds/shadow/ShadowCanvas';
import { HeatCanvas } from '@/app/worlds/heat/HeatCanvas';
import type { WorldId, Point } from '@/app/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PuzzleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { worldId, levelId } = useLocalSearchParams<{
    worldId: string;
    levelId: string;
  }>();

  const config = WORLD_CONFIGS[worldId as string];
  const levelNum = parseInt(levelId as string, 10);

  const {
    activePuzzle,
    startPuzzle,
    submitGuess,
    useHint,
    endSession,
    updateTime,
    elapsedTime,
  } = useSessionStore();

  const { completeLevel } = useProgressStore();
  const { settings } = useSettingsStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStars, setCompletionStars] = useState(0);

  // ─── Initialize Puzzle ───────────────────────────────────────

  useEffect(() => {
    const levelConfig = generateLevelConfig(worldId as WorldId, levelNum);
    const objects = generateHiddenObjects(levelConfig, SCREEN_WIDTH, SCREEN_HEIGHT - 200);

    startPuzzle(levelConfig, objects);
    startTimeRef.current = Date.now();

    // Start timer
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      updateTime(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      endSession();
    };
  }, [worldId, levelId]);

  // ─── Handle Guess ────────────────────────────────────────────

  const handleCanvasGuess = useCallback(
    (point: Point) => {
      if (!activePuzzle || activePuzzle.solved) return;

      const result = submitGuess(point);

      if (settings.hapticsEnabled) {
        if (result.hit) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (result.distance < 100) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      // Check if puzzle is now solved
      const currentPuzzle = useSessionStore.getState().activePuzzle;
      if (currentPuzzle?.solved) {
        handlePuzzleSolved();
      }
    },
    [activePuzzle, settings.hapticsEnabled]
  );

  // ─── Puzzle Solved ───────────────────────────────────────────

  const handlePuzzleSolved = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const puzzle = useSessionStore.getState().activePuzzle;
    if (!puzzle) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const result = calculateStars(puzzle.levelConfig, puzzle.attempts, elapsed, puzzle.hintUsed);

    setCompletionStars(result.stars);
    setShowCompletion(true);

    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Save progress
    completeLevel({
      worldId: worldId as WorldId,
      levelId: levelNum,
      completed: true,
      stars: result.stars,
      bestAttempts: puzzle.attempts,
      bestTime: elapsed,
      hintUsed: puzzle.hintUsed,
      completedAt: Date.now(),
    });
  };

  // ─── Hint ────────────────────────────────────────────────────

  const handleHint = () => {
    const hintPoint = useHint();
    if (hintPoint && settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    // TODO: show hint animation on canvas
  };

  // ─── Exit ────────────────────────────────────────────────────

  const handleExit = () => {
    Alert.alert('Leave Puzzle', 'Your progress on this level will be lost.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  // ─── Render Canvas ───────────────────────────────────────────

  const renderCanvas = () => {
    if (!activePuzzle) return null;

    const canvasProps = {
      puzzle: activePuzzle,
      onGuess: handleCanvasGuess,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT - 200,
      accentColor: config?.accentColor ?? Colors.worlds.ripple.primary,
    };

    switch (worldId) {
      case 'ripple':
        return <RippleCanvas {...canvasProps} />;
      case 'shadow':
        return <ShadowCanvas {...canvasProps} />;
      case 'heat':
        return <HeatCanvas {...canvasProps} />;
      default:
        return <RippleCanvas {...canvasProps} />;
    }
  };

  // ─── Format Time ─────────────────────────────────────────────

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingObjects = activePuzzle
    ? activePuzzle.hiddenObjects.filter((o) => !o.found).length
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HUD */}
      <View style={styles.hud}>
        <Pressable onPress={handleExit} style={styles.hudButton}>
          <Ionicons name="close" size={22} color={Colors.text.secondary} />
        </Pressable>

        <View style={styles.hudCenter}>
          <Text style={styles.hudTimer}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.hudInfo}>
            {remainingObjects} remaining · {activePuzzle?.attempts ?? 0} attempts
          </Text>
        </View>

        <Pressable onPress={handleHint} style={styles.hudButton}>
          <Ionicons name="bulb-outline" size={22} color={Colors.accent.info} />
        </Pressable>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {renderCanvas()}
      </View>

      {/* Completion Overlay */}
      {showCompletion && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>{config?.emoji}</Text>
            <Text style={styles.completionTitle}>Level Complete!</Text>
            <StarRating stars={completionStars} size={36} animate gap={Spacing.md} />
            <Text style={styles.completionStats}>
              {activePuzzle?.attempts ?? 0} attempts · {formatTime(elapsedTime)}
            </Text>

            <View style={styles.completionActions}>
              <Pressable
                onPress={() => router.back()}
                style={[styles.completionButton, styles.completionButtonSecondary]}
              >
                <Text style={styles.completionButtonTextSecondary}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCompletion(false);
                  // Go to next level
                  router.replace(`/world/${worldId}/level/${levelNum + 1}`);
                }}
                style={[styles.completionButton, styles.completionButtonPrimary]}
              >
                <Text style={styles.completionButtonTextPrimary}>Next Level</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  hudButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.background.tertiary,
  },
  hudCenter: {
    alignItems: 'center',
  },
  hudTimer: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  hudInfo: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  canvasContainer: {
    flex: 1,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completionCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    width: SCREEN_WIDTH - Spacing['3xl'] * 2,
    gap: Spacing.base,
  },
  completionEmoji: {
    fontSize: 56,
  },
  completionTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  completionStats: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  completionActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  completionButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  completionButtonPrimary: {
    backgroundColor: Colors.worlds.ripple.primary,
  },
  completionButtonSecondary: {
    backgroundColor: Colors.background.elevated,
  },
  completionButtonTextPrimary: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.inverse,
  },
  completionButtonTextSecondary: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
  },
});
