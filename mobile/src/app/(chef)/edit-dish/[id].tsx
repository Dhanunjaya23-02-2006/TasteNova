import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Switch, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function EditDishScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    ingredientCost: '',
    available: true,
    image: '',
  });

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const res = await api.get(`/menu`);
        // The API might not have a get single dish endpoint, so filter from list if needed, or if there is one, use it.
        const dish = res.data.find((d: any) => d._id === id);
        if (dish) {
          setFormData({
            name: dish.name || '',
            description: dish.description || '',
            price: dish.price?.toString() || '',
            offerPrice: dish.offerPrice?.toString() || '',
            ingredientCost: dish.ingredientCost?.toString() || '',
            available: dish.available,
            image: dish.image || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch dish', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDish();
  }, [id]);

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert('Name and price are required.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/menu/${id}`, {
        ...formData,
        price: Number(formData.price),
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
        ingredientCost: formData.ingredientCost ? Number(formData.ingredientCost) : undefined,
      });
      alert('Dish updated successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to update dish', error);
      alert('Error updating dish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Dish', 'Are you sure you want to delete this dish?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await api.delete(`/menu/${id}`);
            router.back();
          } catch (error) {
            console.error('Failed to delete dish', error);
            alert('Error deleting dish');
            setSaving(false);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

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
              <Text className="text-text-secondary mt-2">Tap to update photo</Text>
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
            />
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary h-24"
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
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
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary font-medium mb-1">Offer Price (₹)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
                value={formData.offerPrice}
                onChangeText={(t) => setFormData({...formData, offerPrice: t})}
                keyboardType="numeric"
              />
            </View>
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
          className="bg-primary p-4 rounded-xl items-center flex-row justify-center mb-4 shadow-sm"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border border-error p-4 rounded-xl items-center mb-8"
          onPress={handleDelete}
          disabled={saving}
        >
          <Text className="text-error font-bold text-lg">Delete Dish</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
