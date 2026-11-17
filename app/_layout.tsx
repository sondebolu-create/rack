import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useStartAuth } from '@/lib/auth';
import { fonts } from '@/lib/fonts';
import { queryClient } from '@/lib/queries/client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fonts);
  // Restores the stored session (survives restarts and refreshes) and listens for sign in and out.
  useStartAuth();

  useEffect(() => {
    // Hide on error too so a missing font never leaves the app stuck on the splash.
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* (shopper) adds the phone-width frame; a future (vendor) group will use SidebarLayout instead. */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
    </SafeAreaProvider>
    </QueryClientProvider>
  );
}
