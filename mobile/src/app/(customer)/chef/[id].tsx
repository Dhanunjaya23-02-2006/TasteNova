import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ChefScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Chef {id}</Text>
    </View>
  );
}
