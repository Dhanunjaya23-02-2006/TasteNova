import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: user?.bankDetails?.accountName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    bankName: user?.bankDetails?.bankName || '',
  });

  const handleSaveBankDetails = async () => {
    try {
      setLoading(true);
      await api.put('/users/chef-settings', { bankDetails });
      await refreshUser();
      alert('Bank details updated successfully!');
    } catch (error) {
      console.error('Failed to update bank details', error);
      alert('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="card-outline" size={24} color="#1565C0" />
            <Text className="text-lg font-bold text-text-primary ml-2">Bank Details for Payouts</Text>
          </View>
          
          <View className="space-y-4">
            <View>
              <Text className="text-text-secondary font-medium mb-1">Account Holder Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={bankDetails.accountName}
                onChangeText={(t) => setBankDetails({...bankDetails, accountName: t})}
              />
            </View>

            <View>
              <Text className="text-text-secondary font-medium mb-1">Account Number</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={bankDetails.accountNumber}
                onChangeText={(t) => setBankDetails({...bankDetails, accountNumber: t})}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-text-secondary font-medium mb-1">IFSC Code</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={bankDetails.ifscCode}
                onChangeText={(t) => setBankDetails({...bankDetails, ifscCode: t})}
                autoCapitalize="characters"
              />
            </View>

            <View>
              <Text className="text-text-secondary font-medium mb-1">Bank Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={bankDetails.bankName}
                onChangeText={(t) => setBankDetails({...bankDetails, bankName: t})}
              />
            </View>

            <TouchableOpacity 
              className="bg-primary p-4 rounded-xl items-center mt-2"
              onPress={handleSaveBankDetails}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save Bank Details</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="document-text-outline" size={24} color="#7B1FA2" />
            <Text className="text-lg font-bold text-text-primary ml-2">Documents (KYC)</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
            <Text className="text-text-primary">FSSAI Certificate</Text>
            {user?.isFssaiVerified ? (
              <View className="bg-green-50 px-3 py-1 rounded-full"><Text className="text-primary text-xs font-semibold">Verified</Text></View>
            ) : (
              <TouchableOpacity><Text className="text-blue-600 font-semibold text-sm">Upload</Text></TouchableOpacity>
            )}
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-text-primary">ID Proof (Aadhaar/PAN)</Text>
            {user?.isIdVerified ? (
              <View className="bg-green-50 px-3 py-1 rounded-full"><Text className="text-primary text-xs font-semibold">Verified</Text></View>
            ) : (
              <TouchableOpacity><Text className="text-blue-600 font-semibold text-sm">Upload</Text></TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
