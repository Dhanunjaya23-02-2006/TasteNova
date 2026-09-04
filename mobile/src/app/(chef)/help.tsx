import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function HelpSupportScreen() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!subject || !description) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/support', {
        category: 'other', // Default or could have a picker
        subject,
        description
      });
      alert('Support ticket created! We will get back to you soon.');
      setSubject('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create ticket', error);
      alert('Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="bg-primary/10 p-6 rounded-2xl mb-6 items-center border border-primary/20">
          <Ionicons name="chatbubbles-outline" size={48} color="#2E7D32" className="mb-4" />
          <Text className="text-xl font-bold text-primary text-center mb-2">Need help?</Text>
          <Text className="text-text-secondary text-center">
            Our chef support team is available 24/7 to assist you with orders, payouts, or technical issues.
          </Text>
        </View>

        <Text className="text-lg font-bold text-text-primary mb-4">Contact Support</Text>

        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 space-y-4">
          <View>
            <Text className="text-text-secondary font-medium mb-1">Subject</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief summary of your issue"
            />
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary h-32"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your issue in detail..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            className="bg-primary p-4 rounded-xl items-center flex-row justify-center mt-2 shadow-sm"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Submit Ticket</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-text-primary mb-4">FAQs</Text>

        <View className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          {[
            'When do I get my payouts?',
            'How do I handle cancelled orders?',
            'How to update my menu availability?',
            'What if a delivery partner is late?'
          ].map((q, idx, arr) => (
            <TouchableOpacity key={idx} className={`p-4 flex-row justify-between items-center ${idx !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <Text className="text-text-primary font-medium flex-1 mr-4">{q}</Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
