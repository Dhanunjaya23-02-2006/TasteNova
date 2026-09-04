import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { title: 'Personal Information', icon: 'person-outline', route: '/(customer)/edit-profile' },
    { title: 'Saved Addresses', icon: 'location-outline', route: '/(customer)/addresses' },
    { title: 'Payment Methods', icon: 'card-outline', route: '/(customer)/payments' },
    { title: 'My Orders', icon: 'receipt-outline', route: '/(customer)/(tabs)/orders' },
    { title: 'Wallet', icon: 'wallet-outline', route: '/(customer)/wallet', rightText: '₹250.00' },
    { title: 'Coupons', icon: 'pricetag-outline', route: '/(customer)/offers' },
    { title: 'Notifications', icon: 'notifications-outline', route: '/(customer)/notifications' },
    { title: 'Help & Support', icon: 'help-circle-outline', route: '/(customer)/help' },
    { title: 'Settings', icon: 'settings-outline', route: '/(customer)/settings' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white p-6 items-center border-b border-gray-100">
          <View className="w-20 h-20 bg-primary-light rounded-full items-center justify-center mb-3">
            <Text className="text-3xl text-white font-bold">{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">{user?.name || 'Customer Name'}</Text>
          <Text className="text-sm text-text-secondary">{user?.email || 'customer@example.com'}</Text>
          <Text className="text-sm text-text-secondary">{user?.phone || '+91 9876543210'}</Text>
        </View>

        {/* Menu Items */}
        <View className="mt-4 bg-white border-y border-gray-100">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
              onPress={() => {
                if (item.route.startsWith('/(customer)/(tabs)')) {
                  router.push(item.route as any);
                } else {
                  router.push(item.route as any);
                }
              }}
            >
              <Ionicons name={item.icon as any} size={22} color="#1A1A1A" />
              <Text className="flex-1 ml-3 text-base text-text-primary font-medium">{item.title}</Text>
              {item.rightText && (
                <Text className="text-primary font-semibold mr-2">{item.rightText}</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="mt-6 mx-4 p-4 bg-white rounded-xl items-center border border-red-100 mb-8"
          onPress={handleLogout}
        >
          <Text className="text-error text-base font-bold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
