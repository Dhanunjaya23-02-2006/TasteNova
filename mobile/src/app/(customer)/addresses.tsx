import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data?.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return 'home';
      case 'work': return 'briefcase';
      default: return 'location';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'My Addresses',
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
              <Ionicons name="chevron-back" size={28} color="#2E7D32" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log('Add Address')} className="px-2 py-1">
              <Text className="text-primary font-semibold text-base">Add New</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          
          {addresses.length === 0 ? (
            <View className="flex-1 justify-center items-center mt-20">
              <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="location-outline" size={40} color="#999" />
              </View>
              <Text className="text-lg font-bold text-text-primary mb-2">No Saved Addresses</Text>
              <Text className="text-text-secondary text-center px-6 mb-6">
                You haven't saved any addresses yet. Add a new address to get started.
              </Text>
            </View>
          ) : (
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
              {addresses.map((address, index) => (
                <View 
                  key={address._id || index} 
                  className={`flex-row p-4 ${index !== addresses.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="mr-4 mt-1">
                    <Ionicons name={getIconForType(address.addressType)} size={24} color="#666" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-bold text-text-primary capitalize">
                        {address.addressType || 'Other'}
                      </Text>
                      <TouchableOpacity className="p-1">
                        <Ionicons name="create-outline" size={20} color="#2E7D32" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-text-secondary leading-5">
                      {address.houseNumber} {address.street}
                    </Text>
                    <Text className="text-sm text-text-secondary leading-5">
                      {address.landmark ? `${address.landmark}, ` : ''}{address.city}, {address.state} - {address.pincode}
                    </Text>
                    {address.isDefault && (
                      <View className="mt-2 bg-primary-light/10 self-start px-2 py-1 rounded">
                        <Text className="text-xs text-primary font-medium">Default</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            className="flex-row items-center justify-center bg-white border border-primary py-4 rounded-xl shadow-sm mb-8"
            activeOpacity={0.8}
            onPress={() => console.log('Add New Address')}
          >
            <Ionicons name="add" size={20} color="#2E7D32" />
            <Text className="text-primary text-base font-bold ml-2">Add New Address</Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
