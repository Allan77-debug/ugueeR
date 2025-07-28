import { Car, List, Route } from "lucide-react-native";
import { View, Text } from "react-native";
import ButtonTouchable from "../atoms/ButtomTouchable";
import { QuickActionsProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";

const QuickActionsDriver: React.FC<QuickActionsProps> = ({ onNavigate, onApply }) => (
  <View className="px-6 mt-3">
    <View className="bg-white p-4 rounded-xl shadow-lg flex-row justify-around">
      <ButtonTouchable
        className="items-center"
        onPress={() => onNavigate("/driver")}
      >
        <Icon icon={Route} color="#4f46e5" />
        <Text className="mt-1 text-xs font-semibold text-gray-700">
          Mis Rutas
        </Text>
      </ButtonTouchable>

      <ButtonTouchable
        className="items-center"
        onPress={() => onNavigate("/driver/MyVehicles")}
      >
        <Icon icon={Car} color="#4f46e5" />
        <Text className="mt-1 text-xs font-semibold text-gray-700">
          Mis Vehículos
        </Text>
      </ButtonTouchable>
      <ButtonTouchable
        className="items-center"
        onPress={() => onNavigate("/driver/MyVehicles")}
      >
        <Icon icon={List} color="#4f46e5" />
        <Text className="mt-1 text-xs font-semibold text-gray-700">
          Mis Viajes
        </Text>
      </ButtonTouchable>
    </View>
  </View>
);

export default QuickActionsDriver;
