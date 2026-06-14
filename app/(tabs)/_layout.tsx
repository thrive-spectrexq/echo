/**
 * Echo — Tab Navigation Layout
 *
 * Three tabs: Worlds (home), Progress, Settings
 * Custom tab bar with luminous icons and smooth transitions.
 */

import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/app/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.worlds.ripple.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Worlds',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background.secondary,
    borderTopColor: Colors.border.subtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 88,
    paddingBottom: 30,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wide,
  },
  tabItem: {
    paddingTop: 4,
  },
});
