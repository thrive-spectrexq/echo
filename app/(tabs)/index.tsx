/**
 * Echo — Home Screen (World Selection)
 *
 * The main entry point. Displays available puzzle worlds
 * as premium animated cards with progress indicators.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WorldCard } from '@/app/components';
import { useProgressStore } from '@/app/store';
import { Colors, Typography, Spacing, WORLD_CONFIGS, WORLD_ORDER } from '@/app/theme/tokens';
import type { WorldId } from '@/app/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getWorldProgress, isWorldUnlocked, totalStars } = useProgressStore();

  const handleWorldPress = (worldId: WorldId) => {
    router.push(`/world/${worldId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Echo</Text>
          <Text style={styles.tagline}>Read the ripples. Decode the shadows.</Text>

          {/* Total stars badge */}
          <View style={styles.starsBadge}>
            <Text style={styles.starsBadgeIcon}>⭐</Text>
            <Text style={styles.starsBadgeCount}>{totalStars}</Text>
          </View>
        </View>

        {/* Divider line with glow */}
        <LinearGradient
          colors={['transparent', Colors.worlds.ripple.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />

        {/* World Cards */}
        <View style={styles.worldList}>
          {WORLD_ORDER.map((worldId) => {
            const config = WORLD_CONFIGS[worldId];
            if (!config) return null;
            return (
              <WorldCard
                key={worldId}
                config={config}
                progress={getWorldProgress(worldId as WorldId)}
                isUnlocked={isWorldUnlocked(worldId as WorldId)}
                onPress={() => handleWorldPress(worldId as WorldId)}
              />
            );
          })}
        </View>

        {/* Footer hint */}
        <Text style={styles.footerHint}>
          Complete levels and earn stars to unlock new worlds
        </Text>
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
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  logo: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.heavy,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.display,
  },
  tagline: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    marginTop: Spacing.base,
    gap: Spacing.xs,
  },
  starsBadgeIcon: {
    fontSize: 14,
  },
  starsBadgeCount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.star.filled,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing['3xl'],
    marginBottom: Spacing.xl,
    opacity: 0.5,
  },
  worldList: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  footerHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing['3xl'],
  },
});
