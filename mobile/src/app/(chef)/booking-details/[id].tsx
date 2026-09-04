import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/chefBookings`); // Depending on API, might need to filter or fetch by ID
        const b = res.data.find((item: any) => item._id === id);
        setBooking(b);
      } catch (error) {
        console.error('Failed to fetch booking', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      setLoading(true);
      await api.put(`/chefBookings/${id}/${action}`);
      alert(`Booking ${action}ed successfully`);
      router.back();
    } catch (error) {
      console.error(`Failed to ${action} booking`, error);
      alert(`Error trying to ${action} booking`);
      setLoading(false);
    }
  };

  if (loading || !booking) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <Text className="text-2xl font-bold text-text-primary mb-1">
            {booking.partyType || 'Party Booking'}
          </Text>
          <Text className="text-text-secondary mb-4">
            Requested by {booking.user?.name || 'Customer'}
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color="#1565C0" />
              </View>
              <View>
                <Text className="text-text-secondary text-xs">Date</Text>
                <Text className="font-semibold text-text-primary text-base">
                  {new Date(booking.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="people-outline" size={20} color="#FF8F00" />
              </View>
              <View>
                <Text className="text-text-secondary text-xs">Guests</Text>
                <Text className="font-semibold text-text-primary text-base">
                  {booking.guestCount} People
                </Text>
              </View>
            </View>

            {booking.address && (
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                  <Ionicons name="location-outline" size={20} color="#7B1FA2" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-text-secondary text-xs">Event Location</Text>
                  <Text className="font-semibold text-text-primary text-base">
                    {booking.address}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {booking.specialInstructions && (
          <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
            <Text className="text-base font-bold text-text-primary mb-2">Requirements</Text>
            <Text className="text-text-secondary">{booking.specialInstructions}</Text>
          </View>
        )}

        {booking.status === 'Pending' && (
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity 
              className="flex-1 py-4 items-center rounded-xl border border-error mr-2 bg-white"
              onPress={() => handleAction('reject')}
            >
              <Text className="text-error font-bold text-lg">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 py-4 items-center rounded-xl bg-primary ml-2 shadow-sm"
              onPress={() => handleAction('accept')}
            >
              <Text className="text-white font-bold text-lg">Accept Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status !== 'Pending' && (
          <View className="bg-white p-4 rounded-xl border border-gray-100 items-center mb-8">
            <Text className="text-lg font-bold text-text-primary mb-1">
              Booking {booking.status}
            </Text>
            <Text className="text-text-secondary text-center">
              This request has already been processed.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
