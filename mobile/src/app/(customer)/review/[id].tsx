import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Review {id}</Text>
    </View>
  );
}
