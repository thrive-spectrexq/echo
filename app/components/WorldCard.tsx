/**
 * Echo — World Card Component
 *
 * A premium card that represents a puzzle world on the home screen.
 * Features:
 * - Gradient background with world-specific colors
 * - Animated glow effect on press
 * - Progress ring showing completion
 * - Lock overlay for locked worlds
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/app/theme/tokens';
import { Springs } from '@/app/theme/animations';
import type { WorldConfig } from '@/app/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing['2xl'] * 2;
const CARD_HEIGHT = 180;

interface WorldCardProps {
  config: WorldConfig;
  progress: {
    completed: number;
    total: number;
    stars: number;
    maxStars: number;
  };
  isUnlocked: boolean;
  onPress: () => void;
}

export function WorldCard({ config, progress, isUnlocked, onPress }: WorldCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.4]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, Springs.snappy);
    glow.value = withSpring(1, Springs.gentle);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Springs.bouncy);
    glow.value = withSpring(0, Springs.gentle);
  };

  const progressPercent = progress.total > 0
    ? (progress.completed / progress.total) * 100
    : 0;

  return (
    <Pressable
      onPress={isUnlocked ? onPress : undefined}
      onPressIn={isUnlocked ? handlePressIn : undefined}
      onPressOut={isUnlocked ? handlePressOut : undefined}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Glow overlay */}
          <Animated.View style={[styles.glowOverlay, glowStyle, { backgroundColor: config.accentColor }]} />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.emoji}>{config.emoji}</Text>
              <View style={styles.titleBlock}>
                <Text style={styles.worldName}>{config.name}</Text>
                <Text style={styles.worldDescription} numberOfLines={2}>
                  {config.description}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.progressSection}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: config.accentColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress.completed}/{progress.total} levels
                </Text>
              </View>

              <View style={styles.starsSection}>
                <Ionicons name="star" size={14} color={Colors.star.filled} />
                <Text style={styles.starCount}>
                  {progress.stars}/{progress.maxStars}
                </Text>
              </View>
            </View>
          </View>

          {/* Lock overlay */}
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={32} color={Colors.text.secondary} />
              <Text style={styles.lockText}>
                Earn more stars to unlock
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  gradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius['2xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  titleBlock: {
    flex: 1,
  },
  worldName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  worldDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    flex: 1,
    marginRight: Spacing.base,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.overlay.medium,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  starsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.star.filled,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 2,
  },
  lockText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});
