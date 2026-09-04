import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community');
      setPosts(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch community posts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
          <Text className="font-bold text-primary">{item.author?.name?.charAt(0) || 'C'}</Text>
        </View>
        <View>
          <Text className="font-bold text-text-primary">{item.author?.businessName || item.author?.name || 'Chef'}</Text>
          <Text className="text-xs text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      
      <Text className="text-text-primary text-base mb-3 leading-6">
        {item.content}
      </Text>

      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          className="w-full h-48 rounded-lg mb-3 bg-gray-100"
          resizeMode="cover"
        />
      )}

      <View className="flex-row border-t border-gray-100 pt-3 mt-1">
        <TouchableOpacity className="flex-row items-center flex-1 justify-center">
          <Ionicons name="heart-outline" size={20} color="#666666" />
          <Text className="text-text-secondary ml-2 font-medium">{item.likes?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center flex-1 justify-center">
          <Ionicons name="chatbubble-outline" size={20} color="#666666" />
          <Text className="text-text-secondary ml-2 font-medium">{item.comments?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center flex-1 justify-center">
          <Ionicons name="share-social-outline" size={20} color="#666666" />
          <Text className="text-text-secondary ml-2 font-medium">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="people-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">Welcome to the Community!</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6 mb-6">
                Connect with other home chefs, share recipes, and learn together.
              </Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row items-center mb-6">
              <View className="w-10 h-10 bg-gray-100 rounded-full mr-3 items-center justify-center">
                <Ionicons name="person" size={20} color="#999999" />
              </View>
              <Text className="text-text-secondary flex-1">Share an update, recipe, or ask a question...</Text>
              <Ionicons name="image-outline" size={24} color="#2E7D32" />
            </TouchableOpacity>
          )}
        />
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg">
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
