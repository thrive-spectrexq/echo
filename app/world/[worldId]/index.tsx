/**
 * Echo — Level Selection Screen
 *
 * Displays the level grid for a specific world.
 * Accessed via /world/[worldId]
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LevelGrid, StarRating } from '@/app/components';
import { useProgressStore } from '@/app/store';
import { Colors, Typography, Spacing, Radius, WORLD_CONFIGS } from '@/app/theme/tokens';
import type { WorldId } from '@/app/types';

export default function WorldLevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { worldId } = useLocalSearchParams<{ worldId: string }>();

  const config = WORLD_CONFIGS[worldId as string];
  const progress = useProgressStore((s) => s.getWorldProgress(worldId as WorldId));
  const getLevelProgress = (levelId: number) =>
    useProgressStore.getState().getLevelProgress(worldId as WorldId, levelId);
  const isLevelUnlocked = (levelId: number) =>
    useProgressStore.getState().isLevelUnlocked(worldId as WorldId, levelId);

  if (!config) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>World not found</Text>
      </View>
    );
  }

  const handleLevelPress = (levelId: number) => {
    router.push(`/world/${worldId}/level/${levelId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.worldEmoji}>{config.emoji}</Text>
          <Text style={styles.worldName}>{config.name}</Text>
          <Text style={styles.worldDescription}>{config.description}</Text>

          {/* Progress summary */}
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{progress.completed}</Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{progress.stars}</Text>
              <Text style={styles.progressLabel}>Stars</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>{progress.total}</Text>
              <Text style={styles.progressLabel}>Total</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Level Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <LevelGrid
          worldConfig={config}
          levelCount={config.totalLevels}
          getProgress={getLevelProgress}
          isLevelUnlocked={isLevelUnlocked}
          onLevelPress={handleLevelPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerGradient: {
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  backButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  worldEmoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  worldName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  worldDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: 280,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  progressLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border.default,
  },
  gridContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  errorText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginTop: Spacing['4xl'],
  },
});
