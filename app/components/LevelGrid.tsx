/**
 * Echo — Level Grid Component
 *
 * Grid of level buttons showing locked/unlocked/completed state
 * with star ratings. Used in the level selection screen.
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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/app/theme/tokens';
import { Springs } from '@/app/theme/animations';
import { StarRating } from './StarRating';
import type { LevelProgress, WorldConfig } from '@/app/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 4;
const GRID_PADDING = Spacing.lg;
const GAP = Spacing.md;
const CELL_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

interface LevelCellProps {
  levelId: number;
  progress: LevelProgress | null;
  isUnlocked: boolean;
  accentColor: string;
  onPress: () => void;
}

function LevelCell({ levelId, progress, isUnlocked, accentColor, onPress }: LevelCellProps) {
  const scale = useSharedValue(1);
  const isCompleted = progress?.completed ?? false;
  const stars = progress?.stars ?? 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isUnlocked) {
      scale.value = withSpring(0.92, Springs.snappy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Springs.bouncy);
  };

  return (
    <Pressable
      onPress={isUnlocked ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.cell,
          animatedStyle,
          isCompleted && { borderColor: accentColor + '40' },
          !isUnlocked && styles.cellLocked,
        ]}
      >
        {!isUnlocked ? (
          <Ionicons name="lock-closed" size={18} color={Colors.text.tertiary} />
        ) : (
          <>
            <Text
              style={[
                styles.levelNumber,
                isCompleted && { color: accentColor },
              ]}
            >
              {levelId}
            </Text>
            {isCompleted && (
              <StarRating stars={stars} size={10} gap={1} />
            )}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Level Grid ──────────────────────────────────────────────

interface LevelGridProps {
  worldConfig: WorldConfig;
  levelCount: number;
  getProgress: (levelId: number) => LevelProgress | null;
  isLevelUnlocked: (levelId: number) => boolean;
  onLevelPress: (levelId: number) => void;
}

export function LevelGrid({
  worldConfig,
  levelCount,
  getProgress,
  isLevelUnlocked,
  onLevelPress,
}: LevelGridProps) {
  const levels = Array.from({ length: levelCount }, (_, i) => i + 1);

  return (
    <View style={styles.grid}>
      {levels.map((levelId) => (
        <LevelCell
          key={levelId}
          levelId={levelId}
          progress={getProgress(levelId)}
          isUnlocked={isLevelUnlocked(levelId)}
          accentColor={worldConfig.accentColor}
          onPress={() => onLevelPress(levelId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    ...Shadows.sm,
  },
  cellLocked: {
    opacity: 0.4,
  },
  levelNumber: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
});
