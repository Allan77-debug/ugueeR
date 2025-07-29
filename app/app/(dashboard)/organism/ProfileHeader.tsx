import { LogOut, PersonStandingIcon, User } from "lucide-react-native";
import { View, Text } from "react-native";
import ButtonTouchable from "../atoms/ButtomTouchable";
import { ProfileHeaderProps } from "../interfaces/interfaces";
import Icon from "../atoms/icon";
import { useRouter } from "expo-router";

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  onLogout,
  pathname,
}) => {
  const router = useRouter();
  return (
    <View className="bg-primary p-6 rounded-b-3xl">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">
            Hola, {userData?.full_name.split(" ")[0]}
          </Text>
          <Text className="text-white/80">{userData?.institution_name}</Text>
        </View>
        <View className="flex flex-row">
          <View className="mr-3 justify-center items-center">
            <ButtonTouchable
              onPress={() =>
                router.push(pathname.includes("driver") ? "/user" : "/driver")
              }
            >
              <Icon icon={User} color="white" />
            </ButtonTouchable>
            <Text className="text-white text-sm font-bold">
              {pathname.includes("driver") ? "Usuario" : "Conductor"}
            </Text>
          </View>

          <View className="justify-center items-center">
            <ButtonTouchable onPress={onLogout}>
              <Icon icon={LogOut} color="white" />
            </ButtonTouchable>
            <Text className="text-white text-sm font-bold">Salir</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
