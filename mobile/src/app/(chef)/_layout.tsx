import { Stack } from 'expo-router';

export default function ChefLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#1A1A1A',
      headerTitleStyle: { fontFamily: 'Inter', fontWeight: '600' },
      headerBackVisible: true,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="kitchen-setup" options={{ title: 'Kitchen Setup' }} />
      <Stack.Screen name="order-details/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="accept-order/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="preparing-order/[id]" options={{ title: 'Preparing Order' }} />
      <Stack.Screen name="ready-pickup/[id]" options={{ title: 'Ready for Pickup' }} />
      <Stack.Screen name="add-dish" options={{ title: 'Add Dish' }} />
      <Stack.Screen name="edit-dish/[id]" options={{ title: 'Edit Dish' }} />
      <Stack.Screen name="party-bookings" options={{ title: 'Party Bookings' }} />
      <Stack.Screen name="booking-details/[id]" options={{ title: 'Booking Details' }} />
      <Stack.Screen name="payout-history" options={{ title: 'Payout History' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Stack.Screen name="growth" options={{ title: 'Growth' }} />
      <Stack.Screen name="community" options={{ title: 'Community' }} />
      <Stack.Screen name="plans" options={{ title: 'Plans & Subscription' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
    </Stack>
  );
}
