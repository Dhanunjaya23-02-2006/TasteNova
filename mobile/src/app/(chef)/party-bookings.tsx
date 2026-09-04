import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PartyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/chefBookings');
      setBookings(res.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-orange-50 text-accent';
      case 'Accepted': return 'bg-blue-50 text-blue-600';
      case 'Completed': return 'bg-green-50 text-green-600';
      case 'Rejected':
      case 'Cancelled': return 'bg-red-50 text-error';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100"
      onPress={() => router.push(`/(chef)/booking-details/${item._id}`)}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-bold text-base text-text-primary">
          {item.partyType || 'Party Booking'}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusColor(item.status).split(' ')[1]}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="person-outline" size={16} color="#666666" className="mr-2" />
        <Text className="text-text-secondary ml-2">{item.user?.name || 'Customer'}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#666666" className="mr-2" />
        <Text className="text-text-secondary ml-2">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="people-outline" size={16} color="#666666" className="mr-2" />
        <Text className="text-text-secondary ml-2">{item.guestCount} Guests</Text>
      </View>

      {item.status === 'Pending' && (
        <View className="mt-2 flex-row justify-end">
          <Text className="text-primary font-semibold">Review Request →</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">No party bookings yet</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6">
                When customers request catering or bulk orders, they will appear here.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
