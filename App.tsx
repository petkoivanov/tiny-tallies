import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from '@/navigation/AppNavigator';
import { ThemeProvider } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSyncTrigger } from '@/hooks/useSyncTrigger';
import { useReminderInit } from '@/hooks/useReminderInit';
import { initSentry } from '@/services/sentry/sentryService';

const LIGHT_THEMES = new Set(['candy', 'sky']);

// Initialize Sentry before Sentry.wrap() — must be synchronous at module level
initSentry();

// Prevent splash screen from hiding before fonts load (module-level per Expo docs)
SplashScreen.preventAutoHideAsync();

function App() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const themeId = useAppStore((s) => s.themeId) ?? 'candy';
  const statusBarStyle = LIGHT_THEMES.has(themeId) ? 'dark' : 'light';

  useAutoSave();
  useSyncTrigger();
  useReminderInit();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style={statusBarStyle} />
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
