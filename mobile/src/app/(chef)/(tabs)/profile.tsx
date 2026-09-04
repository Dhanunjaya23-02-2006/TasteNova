import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function ChefProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const menuSections = [
    {
      title: 'Kitchen Management',
      items: [
        { title: 'Kitchen Profile', icon: 'restaurant-outline', route: '/(chef)/edit-profile' },
        { title: 'Operating Hours', icon: 'time-outline', route: '/(chef)/kitchen-setup' }, // Could map to specific tab/section
        { title: 'Bank Details & KYC', icon: 'card-outline', route: '/(chef)/settings' }, // Or specific route
      ]
    },
    {
      title: 'Insights & Growth',
      items: [
        { title: 'My Performance', icon: 'trending-up-outline', route: '/(chef)/analytics' },
        { title: 'Reviews', icon: 'star-outline', route: `/review/${user?._id}` }, // using customer route for reviews for now
        { title: 'Plans & Subscription', icon: 'ribbon-outline', route: '/(chef)/plans' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { title: 'Settings', icon: 'settings-outline', route: '/(chef)/settings' },
        { title: 'Help & Support', icon: 'help-circle-outline', route: '/(chef)/help' },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="bg-white p-6 pt-8 items-center border-b border-gray-100">
          <View className="relative mb-4">
            <Image 
              source={{ uri: user?.kitchenImage || 'https://via.placeholder.com/150' }} 
              className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-sm"
            />
            <TouchableOpacity 
              className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white"
              onPress={() => router.push('/(chef)/edit-profile')}
            >
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-1">
            {user?.businessName || user?.name || 'Chef'}
          </Text>
          <Text className="text-text-secondary text-sm mb-2">{user?.email}</Text>
          <View className="bg-green-50 px-3 py-1 rounded-full flex-row items-center">
            <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
            <Text className="text-primary text-xs font-semibold ml-1">Verified Kitchen</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="p-4">
          {menuSections.map((section, idx) => (
            <View key={idx} className="mb-6">
              <Text className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 ml-2">
                {section.title}
              </Text>
              <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                {section.items.map((item, itemIdx) => (
                  <TouchableOpacity
                    key={itemIdx}
                    className={`flex-row items-center p-4 ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center mr-3">
                      <Ionicons name={item.icon as any} size={18} color="#4A4A4A" />
                    </View>
                    <Text className="flex-1 text-base text-text-primary font-medium">{item.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            className="flex-row items-center justify-center p-4 mt-2 mb-8 bg-white rounded-xl border border-error/20"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            <Text className="ml-2 font-bold text-error text-base">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
