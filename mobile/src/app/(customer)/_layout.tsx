import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#1A1A1A',
      headerTitleStyle: { fontFamily: 'Inter', fontWeight: '600' },
      headerBackVisible: true,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="location" options={{ title: 'Select Location' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="chef-listing" options={{ title: 'Chefs' }} />
      <Stack.Screen name="chef/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="dish/[id]" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="cart" options={{ title: 'My Cart' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="order-placed" options={{ headerShown: false }} />
      <Stack.Screen name="tracking/[id]" options={{ title: 'Order Tracking' }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="review/[id]" options={{ title: 'Rate & Review' }} />
      <Stack.Screen name="offers" options={{ title: 'Offers' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="wallet" options={{ title: 'My Wallet' }} />
      <Stack.Screen name="subscriptions" options={{ title: 'Subscriptions' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="addresses" options={{ title: 'My Addresses' }} />
      <Stack.Screen name="payments" options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
    </Stack>
  );
}
