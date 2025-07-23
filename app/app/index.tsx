import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Necesitarás instalar expo-linear-gradient
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6A11CB" />
      <LinearGradient
        colors={["#FFFF", "#6A11CB"]} // Un gradiente púrpura similar al de Firefit
        style={styles.container}
      >
        {/* Logo Simulado (Estilo Firefit) */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-[#6a5acd] justify-center items-center mb-2.5 shadow-lg">
            {/* Podrías poner un componente <Image> aquí si tuvieras un logo */}
            <Text className="text-4xl font-bold text-white">U</Text>
          </View>
          <Text className="text-5xl font-bold text-white text-center">
            Uway
          </Text>
        </View>

        <Text className="mb-2 text-center text-xl font-semibold text-white">
          Tu viaje seguro y confiable
        </Text>
        <Text className="mb-10 px-5 text-center text-base text-white/80">
          Regístrate y accede a un transporte validado por instituciones.
        </Text>

        <Button
          variant={"secondary"}
          className="rounded-full w-full py-7 max-w-[300px] mb-6"
          onPress={() => router.replace("/login")}
        >
          <Text className="text-lg font-semibold ">Iniciar sesión</Text>
        </Button>

        <Button
          variant={"secondary"}
          className="rounded-full w-full py-7 max-w-[300px]"
          onPress={() => router.replace("/register")}
        >
          <Text className="text-lg font-semibold ">Registro</Text>
        </Button>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#6A11CB", // Color de fondo para el área segura (notch, etc.)
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
});
