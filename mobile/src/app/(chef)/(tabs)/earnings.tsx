import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function ChefEarningsScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/earnings/wallet');
      setWallet(res.data.wallet);
    } catch (error) {
      console.error('Failed to fetch wallet info', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-text-primary">Earnings</Text>
        <TouchableOpacity onPress={() => router.push('/(chef)/payout-history')}>
          <Text className="text-primary font-semibold">History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 bg-background"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
      >
        {/* Main Balance Card */}
        <View className="p-4">
          <View className="bg-primary rounded-2xl p-6 shadow-md items-center">
            <Text className="text-white/80 font-medium mb-1">Available Balance</Text>
            <Text className="text-4xl font-bold text-white mb-6">
              ₹{wallet?.earningsBalance?.toLocaleString() || '0.00'}
            </Text>
            
            <View className="flex-row w-full bg-white/20 rounded-xl p-4 justify-between">
              <View className="items-center flex-1 border-r border-white/20">
                <Text className="text-white/80 text-xs mb-1">Pending</Text>
                <Text className="text-white font-bold">₹{wallet?.pending_balance?.toLocaleString() || '0'}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-white/80 text-xs mb-1">Total Earned</Text>
                <Text className="text-white font-bold">₹{wallet?.total_balance?.toLocaleString() || '0'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Withdrawal Action */}
        <View className="px-4 mb-6">
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center ${wallet?.earningsBalance > 0 ? 'bg-black' : 'bg-gray-300'}`}
            disabled={!wallet?.earningsBalance || wallet.earningsBalance <= 0}
            onPress={() => {
              // Handle withdrawal flow
              alert('Withdrawal flow triggered');
            }}
          >
            <Text className={`font-bold text-lg ${wallet?.earningsBalance > 0 ? 'text-white' : 'text-gray-500'}`}>
              Withdraw Funds
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-text-secondary text-center mt-2">
            Minimum withdrawal amount: ₹500
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="px-4 mb-6">
          <Text className="text-base font-bold text-text-primary mb-3">Earnings Overview</Text>
          
          <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => router.push('/(chef)/analytics')}
            >
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="today-outline" size={20} color="#1565C0" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-text-primary">Today</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="font-bold text-text-primary mr-2">₹{wallet?.todayEarnings || '0'}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => router.push('/(chef)/analytics')}
            >
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                <Ionicons name="calendar-outline" size={20} color="#7B1FA2" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-text-primary">This Week</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="font-bold text-text-primary mr-2">₹{wallet?.weekEarnings || '0'}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={() => router.push('/(chef)/analytics')}
            >
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center">
                <Ionicons name="bar-chart-outline" size={20} color="#FF8F00" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-text-primary">This Month</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="font-bold text-text-primary mr-2">₹{wallet?.monthEarnings || '0'}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Analytics Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity 
            className="bg-white border border-primary py-3 rounded-xl items-center"
            onPress={() => router.push('/(chef)/analytics')}
          >
            <Text className="text-primary font-bold">View Detailed Analytics</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
