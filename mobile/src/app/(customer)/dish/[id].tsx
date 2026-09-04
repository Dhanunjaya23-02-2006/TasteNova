import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DishScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Dish {id}</Text>
    </View>
  );
}
