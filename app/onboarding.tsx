import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/app/theme/tokens';
import { useProgressStore } from '@/app/store';

const ONBOARDING_TEXTS = [
  "You cannot see the truth.",
  "You can only see its echo.",
  "Read the ripples.",
  "Decode the shadows.",
  "Trust the signal."
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasSeenOnboarding = useProgressStore((s) => s.setHasSeenOnboarding);

  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);

  useEffect(() => {
    // Sequence the text animations
    opacity1.value = withTiming(1, { duration: 2000 });
    
    opacity2.value = withDelay(
      3500,
      withTiming(1, { duration: 2000 })
    );

    opacity3.value = withDelay(
      7000,
      withTiming(1, { duration: 2000 }, () => {
        // Wait a few seconds after the last text appears, then transition to home
        setTimeout(() => {
          runOnJS(finishOnboarding)();
        }, 4000);
      })
    );
  }, []);

  const finishOnboarding = () => {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const style1 = useAnimatedStyle(() => ({ opacity: opacity1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: opacity2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: opacity3.value }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, style1]}>
        {ONBOARDING_TEXTS[0]}
      </Animated.Text>
      
      <Animated.Text style={[styles.text, style2, { marginTop: Spacing.xl }]}>
        {ONBOARDING_TEXTS[1]}
      </Animated.Text>
      
      <View style={styles.group}>
        <Animated.Text style={[styles.text, styles.highlight, style3]}>
          {ONBOARDING_TEXTS[2]}
        </Animated.Text>
        <Animated.Text style={[styles.text, styles.highlight, style3]}>
          {ONBOARDING_TEXTS[3]}
        </Animated.Text>
        <Animated.Text style={[styles.text, styles.highlight, style3]}>
          {ONBOARDING_TEXTS[4]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  text: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 32,
  },
  group: {
    marginTop: Spacing.xl * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  highlight: {
    color: Colors.text.primary,
    fontFamily: Typography.fonts.bold,
  },
});
