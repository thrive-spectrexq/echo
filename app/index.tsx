import { Redirect } from 'expo-router';
import { useProgressStore } from './store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from './theme/tokens';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const { isHydrated, hydrate, hasSeenOnboarding } = useProgressStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      hydrate().finally(() => {
        setLoading(false);
        SplashScreen.hideAsync();
      });
    } else {
      setLoading(false);
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background.dark, justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary.base} size="large" />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href={"/onboarding" as any} />;
  }

  return <Redirect href="/(tabs)" />;
}
