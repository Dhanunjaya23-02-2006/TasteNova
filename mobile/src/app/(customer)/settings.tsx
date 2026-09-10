import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Settings',
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
              <Ionicons name="chevron-back" size={28} color="#2E7D32" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* Notifications Group */}
        <Text className="text-sm font-semibold text-text-secondary uppercase ml-4 mb-2 mt-4">Notifications</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="notifications" size={18} color="#007AFF" />
              </View>
              <Text className="text-base font-medium text-text-primary">Push Notifications</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: '#e5e5ea', true: '#34C759' }}
              ios_backgroundColor="#e5e5ea"
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-orange-100 items-center justify-center mr-3">
                <Ionicons name="mail" size={18} color="#FF9500" />
              </View>
              <Text className="text-base font-medium text-text-primary">Email Updates</Text>
            </View>
            <Switch 
              value={emailEnabled} 
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#e5e5ea', true: '#34C759' }}
              ios_backgroundColor="#e5e5ea"
            />
          </View>

        </View>

        {/* Preferences Group */}
        <Text className="text-sm font-semibold text-text-secondary uppercase ml-4 mb-2">Preferences</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center mr-3">
                <Ionicons name="location" size={18} color="#AF52DE" />
              </View>
              <Text className="text-base font-medium text-text-primary">Location Services</Text>
            </View>
            <Switch 
              value={locationEnabled} 
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#e5e5ea', true: '#34C759' }}
              ios_backgroundColor="#e5e5ea"
            />
          </View>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100" activeOpacity={0.7}>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
                <Ionicons name="globe" size={18} color="#8E8E93" />
              </View>
              <Text className="text-base font-medium text-text-primary">Language</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-text-secondary mr-2">English</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4" activeOpacity={0.7}>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-gray-800 items-center justify-center mr-3">
                <Ionicons name="moon" size={18} color="#FFF" />
              </View>
              <Text className="text-base font-medium text-text-primary">Appearance</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-text-secondary mr-2">System</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>

        </View>

        {/* About Group */}
        <Text className="text-sm font-semibold text-text-secondary uppercase ml-4 mb-2">About</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100" activeOpacity={0.7}>
            <Text className="text-base font-medium text-text-primary">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100" activeOpacity={0.7}>
            <Text className="text-base font-medium text-text-primary">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between p-4">
            <Text className="text-base font-medium text-text-primary">App Version</Text>
            <Text className="text-text-secondary">1.0.0</Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
