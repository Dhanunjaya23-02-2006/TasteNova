import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
  const router = useRouter();

  const transactions = [
    { id: '1', title: 'Added via UPI', date: '10 May, 11:20 AM', amount: 200, type: 'credit' },
    { id: '2', title: 'Used on Order TN123456', date: '12 May, 1:25 PM', amount: 150, type: 'debit' },
    { id: '3', title: 'Cashback Received', date: '12 May, 1:30 PM', amount: 50, type: 'credit' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background p-4">
        
        {/* Balance Card */}
        <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 items-center">
          <Text className="text-text-secondary mb-2">Wallet Balance</Text>
          <Text className="text-4xl font-bold text-text-primary mb-6">₹250.00</Text>
          
          <TouchableOpacity className="bg-primary-dark px-12 py-3 rounded-full flex-row items-center shadow-sm">
            <Ionicons name="add" size={20} color="#FFF" />
            <Text className="text-white font-bold ml-2">Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-text-primary">Transactions</Text>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.map((tx, index) => (
            <View key={tx.id} className={`flex-row justify-between items-center py-4 ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Ionicons name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={tx.type === 'credit' ? '#2E7D32' : '#D32F2F'} />
                </View>
                <View>
                  <Text className="font-semibold text-text-primary">{tx.title}</Text>
                  <Text className="text-xs text-text-secondary">{tx.date}</Text>
                </View>
              </View>
              <Text className={`font-bold ${tx.type === 'credit' ? 'text-primary' : 'text-error'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
