import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket';

export default function RootLayout() {
  const { isLoading, token, user, restoreToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inChefGroup = segments[0] === '(chef)';
    const inCustomerGroup = segments[0] === '(customer)';

    if (!token && !inAuthGroup && !inCustomerGroup) {
      // Redirect to onboarding/login
      router.replace('/(auth)/onboarding');
    } else if (token && inAuthGroup) {
      // Redirect away from auth screens if logged in
      if (user?.role === 'chef') {
        router.replace('/(chef)/(tabs)');
      } else {
        router.replace('/(customer)/(tabs)');
      }
      
      // Connect socket when logged in
      socketService.connect();
    } else if (token) {
      // Connect socket if token exists and not in auth group
      socketService.connect();
    } else {
      // Disconnect socket if not logged in
      socketService.disconnect();
    }
  }, [token, segments, isLoading]);

  if (isLoading) {
    return null; // Or return a loading spinner if you prefer
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(chef)" options={{ headerShown: false }} />
    </Stack>
  );
}
