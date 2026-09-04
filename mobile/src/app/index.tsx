import { Redirect } from 'expo-router';
export default function Index() {
  // Navigation is handled in _layout.tsx based on auth state.
  return <Redirect href="/(auth)/onboarding" />;
}
