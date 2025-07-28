
import {  LogOut } from "lucide-react-native";
import { View, Text } from "react-native";
import ButtonTouchable from "../atoms/ButtomTouchable";
import { ProfileHeaderProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData, onLogout }) => {
  return (
    <View className="bg-primary p-6 rounded-b-3xl">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">Hola, {userData?.full_name.split(" ")[0]}</Text>
          <Text className="text-white/80">{userData?.institution_name}</Text>
      </View>
      <ButtonTouchable onPress={onLogout}>
        <Icon icon={LogOut} color="white" />
      </ButtonTouchable>
    </View>
  </View>
)
}

export default ProfileHeader;