/**
 * Echo — Settings Screen
 *
 * User preferences with toggle switches and sliders.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useProgressStore } from '@/app/store';
import { Colors, Typography, Spacing, Radius } from '@/app/theme/tokens';

// ─── Toggle Row ──────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && (
          <Text style={styles.rowDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: Colors.background.elevated,
          true: Colors.worlds.ripple.primary + '80',
        }}
        thumbColor={value ? Colors.worlds.ripple.primary : Colors.text.tertiary}
      />
    </View>
  );
}

// ─── Settings Screen ─────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSetting, resetSettings } = useSettingsStore();
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure? This will erase all your progress, stars, and achievements. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetProgress(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Audio */}
        <Text style={styles.sectionTitle}>Audio</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="volume-high-outline"
            label="Sound Effects"
            description="Ambient sounds and interaction feedback"
            value={settings.soundEnabled}
            onToggle={(val) => updateSetting('soundEnabled', val)}
          />
        </View>

        {/* Haptics */}
        <Text style={styles.sectionTitle}>Haptics</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="phone-portrait-outline"
            label="Haptic Feedback"
            description="Vibration for proximity and interactions"
            value={settings.hapticsEnabled}
            onToggle={(val) => updateSetting('hapticsEnabled', val)}
          />
        </View>

        {/* Accessibility */}
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="eye-outline"
            label="High Contrast"
            description="Increased contrast for better visibility"
            value={settings.highContrast}
            onToggle={(val) => updateSetting('highContrast', val)}
          />
          <View style={styles.separator} />
          <ToggleRow
            icon="flash-off-outline"
            label="Reduced Motion"
            description="Minimize animations throughout the app"
            value={settings.reducedMotion}
            onToggle={(val) => updateSetting('reducedMotion', val)}
          />
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.section}>
          <Pressable onPress={handleResetProgress} style={styles.dangerRow}>
            <Ionicons name="trash-outline" size={20} color={Colors.accent.error} />
            <Text style={styles.dangerText}>Reset All Progress</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.about}>
          <Text style={styles.aboutTitle}>Echo</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutCopy}>
            Read the ripples. Decode the shadows. Trust the signal.
          </Text>
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
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  rowDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.default,
    marginLeft: Spacing['2xl'] + 32 + Spacing.md,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  dangerText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.accent.error,
  },
  about: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  aboutTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
  },
  aboutVersion: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  aboutCopy: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
