import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '../lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User is logged in - check if they need onboarding
        checkOnboardingStatus(session.user.id);
      } else {
        // User is not logged in - send to login
        router.replace('/login');
      }
      setIsReady(true);
    });

    // Listen for auth state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await checkOnboardingStatus(session.user.id);
        } else {
          router.replace('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check if user has completed onboarding
  async function checkOnboardingStatus(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();

      if (profile?.first_name) {
        // Profile is filled in - go to main app
        router.replace('/');
      } else {
        // Profile not filled in - go to onboarding
        router.replace('/onboarding');
      }
    } catch {
      // No profile exists yet - go to onboarding
      router.replace('/onboarding');
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="coach" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}