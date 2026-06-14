/**
 * Echo — Progress Screen
 *
 * Dashboard showing player statistics and per-world breakdowns.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '@/app/store';
import { Colors, Typography, Spacing, Radius, Shadows, WORLD_CONFIGS, WORLD_ORDER } from '@/app/theme/tokens';
import type { WorldId } from '@/app/types';

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── World Progress Row ──────────────────────────────────────

function WorldProgressRow({ worldId }: { worldId: WorldId }) {
  const config = WORLD_CONFIGS[worldId];
  const progress = useProgressStore((s) => s.getWorldProgress(worldId));

  if (!config) return null;

  const percent = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <View style={styles.worldRow}>
      <Text style={styles.worldEmoji}>{config.emoji}</Text>
      <View style={styles.worldInfo}>
        <Text style={styles.worldName}>{config.name}</Text>
        <View style={styles.worldBarBg}>
          <View
            style={[
              styles.worldBarFill,
              {
                width: `${percent}%`,
                backgroundColor: config.accentColor,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.worldStats}>
        <Text style={[styles.worldPercent, { color: config.accentColor }]}>
          {percent}%
        </Text>
        <Text style={styles.worldStarText}>
          ⭐ {progress.stars}/{progress.maxStars}
        </Text>
      </View>
    </View>
  );
}

// ─── Progress Screen ─────────────────────────────────────────

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const stats = useProgressStore((s) => s.stats);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Progress</Text>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="⭐"
            label="Total Stars"
            value={stats.totalStars}
            color={Colors.star.filled}
          />
          <StatCard
            icon="✅"
            label="Completed"
            value={stats.levelsCompleted}
            color={Colors.accent.success}
          />
          <StatCard
            icon="🏆"
            label="Perfect"
            value={stats.perfectLevels}
            color={Colors.worlds.ripple.primary}
          />
          <StatCard
            icon="⏱️"
            label="Play Time"
            value={formatTime(stats.totalPlayTime)}
            color={Colors.worlds.heat.primary}
          />
        </View>

        {/* Per-World Breakdown */}
        <Text style={styles.sectionTitle}>Worlds</Text>
        <View style={styles.worldsList}>
          {WORLD_ORDER.map((worldId) => (
            <WorldProgressRow key={worldId} worldId={worldId as WorldId} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.base,
  },
  worldsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  worldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  worldEmoji: {
    fontSize: 28,
  },
  worldInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  worldName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  worldBarBg: {
    height: 6,
    backgroundColor: Colors.overlay.medium,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  worldBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  worldStats: {
    alignItems: 'flex-end',
  },
  worldPercent: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  worldStarText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
});
