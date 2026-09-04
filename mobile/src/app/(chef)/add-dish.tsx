import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function AddDishScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    ingredientCost: '',
    available: true,
    image: '', // In a real app, integrate an image picker
  });

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert('Name and price are required.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/menu', {
        ...formData,
        price: Number(formData.price),
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
        ingredientCost: formData.ingredientCost ? Number(formData.ingredientCost) : undefined,
      });
      alert('Dish added successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to add dish', error);
      alert('Error adding dish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 p-4 bg-background">
        
        {/* Image Placeholder */}
        <TouchableOpacity className="w-full h-48 bg-white rounded-2xl border border-dashed border-gray-300 items-center justify-center mb-6 overflow-hidden">
          {formData.image ? (
            <Image source={{ uri: formData.image }} className="w-full h-full" />
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color="#CCCCCC" />
              <Text className="text-text-secondary mt-2">Tap to add photo</Text>
            </>
          )}
        </TouchableOpacity>

        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 space-y-4">
          <View>
            <Text className="text-text-secondary font-medium mb-1">Dish Name *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
              placeholder="e.g. Chicken Biryani"
            />
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary h-24"
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
              placeholder="Describe your dish..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary font-medium mb-1">Price (₹) *</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={formData.price}
                onChangeText={(t) => setFormData({...formData, price: t})}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary font-medium mb-1">Offer Price (₹)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={formData.offerPrice}
                onChangeText={(t) => setFormData({...formData, offerPrice: t})}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Ingredient Cost (₹)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={formData.ingredientCost}
              onChangeText={(t) => setFormData({...formData, ingredientCost: t})}
              keyboardType="numeric"
              placeholder="For profit calculation (Optional)"
            />
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-gray-100 mt-2 pt-4">
            <View>
              <Text className="text-text-primary font-bold">Available</Text>
              <Text className="text-text-secondary text-xs">Show this item on your menu</Text>
            </View>
            <Switch
              value={formData.available}
              onValueChange={(val) => setFormData({...formData, available: val})}
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={formData.available ? '#2E7D32' : '#F5F5F5'}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-primary p-4 rounded-xl items-center flex-row justify-center mb-8 shadow-sm"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Add Dish</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
