/**
 * Echo — Star Rating Component
 *
 * Animated 3-star display with gold fill and shimmer.
 * Used in level completion, level grid, and progress screens.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/app/theme/tokens';
import { Springs, Durations } from '@/app/theme/animations';

interface StarRatingProps {
  stars: number; // 0-3
  size?: number;
  animate?: boolean;
  gap?: number;
}

function AnimatedStar({
  filled,
  size,
  index,
  animate,
}: {
  filled: boolean;
  size: number;
  index: number;
  animate: boolean;
}) {
  const scale = useSharedValue(animate ? 0 : 1);
  const rotation = useSharedValue(animate ? -30 : 0);

  useEffect(() => {
    if (animate && filled) {
      const delay = index * 200;
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.3, Springs.bouncy),
          withSpring(1, Springs.snappy)
        )
      );
      rotation.value = withDelay(
        delay,
        withSequence(
          withTiming(15, { duration: 150 }),
          withSpring(0, Springs.snappy)
        )
      );
    }
  }, [animate, filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={size}
        color={filled ? Colors.star.filled : Colors.star.empty}
      />
    </Animated.View>
  );
}

export function StarRating({
  stars,
  size = 24,
  animate = false,
  gap = Spacing.xs,
}: StarRatingProps) {
  return (
    <View style={[styles.container, { gap }]}>
      {[0, 1, 2].map((i) => (
        <AnimatedStar
          key={i}
          filled={i < stars}
          size={size}
          index={i}
          animate={animate}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
