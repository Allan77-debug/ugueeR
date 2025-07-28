
import { View, Text } from "react-native";
import { StatCardProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <View className="bg-white p-4 rounded-lg flex-1 items-center">
    <Icon icon={icon} size={28} color="#4f46e5" />
    <Text className="text-gray-600 mt-2">{label}</Text>
    <Text className="font-bold text-lg">{value}</Text>
  </View>
)