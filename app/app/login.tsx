import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/ctx";

const PURPLE_COLOR = "#6a5acd"; // slateblue

const LoginScreen: React.FC = () => {
  const { signIn } = useSession();
  const validationSchema = useMemo(() => {
    return yup.object({
      email: yup
        .string()
        .required("El correo electrónico es requerido")
        .matches(
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
          "Ingrese una dirección de correo electrónico válida"
        ),
      password: yup
        .string()
        .required("La contraseña es requerida")
        .min(5, "La contraseña tiene que ser de minimo 5 caracteres"),
    });
  }, []);

  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const onSubmit = (data: { email: string; password: string }) => {
    signIn(data);
    router.replace("/(dashboard)/user");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary ">
      <StatusBar barStyle="light-content" backgroundColor={PURPLE_COLOR} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 bg-gray-100"
      >
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-primary justify-center items-center mb-2.5 shadow-lg">
            {/* Podrías poner un componente <Image> aquí si tuvieras un logo */}
            <Text className="text-4xl font-bold text-white">U</Text>
          </View>
          {/* <Text className="text-5xl font-bold text-primary  text-center">Uway</Text> */}
        </View>
        <View className="items-center mb-10">
          {/* Puedes agregar un logo aquí si lo deseas */}
          {/* <Image source={require('./assets/logo.png')} className="w-24 h-24 mb-5" /> */}
          <Text className="text-3xl font-bold text-primary mb-2">
            ¡Bienvenido!
          </Text>
          <Text className="text-base text-gray-600">
            Inicia sesión para continuar
          </Text>
        </View>

        <View className="w-full max-w-sm self-center">
          <Controller
            control={control}
            rules={{
              required: "El correo es requerido",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={cn(
                  errors.email ? "mb-0" : "mb-4",
                  "bg-white rounded-lg p-3 border border-gray-300 text-base text-primary"
                )}
                placeholder="Correo electrónico"
                placeholderTextColor="#A9A9A9"
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
              />
            )}
            name="email"
          />
          {errors.email && (
            <Text className="text-red-500 mb-4">{errors.email.message}</Text>
          )}

          <View
            className={cn(
              errors.password && "mb-0",
              "flex-row items-center bg-white rounded-lg border border-gray-300"
            )}
          >
            <Controller
              control={control}
              rules={{
                required: "La contraseña es requerida",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="flex-1 h-12 p-3 text-base text-primary"
                  placeholder="Contraseña"
                  placeholderTextColor="#A9A9A9"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  value={value}
                />
              )}
              name="password"
            />

            <TouchableOpacity
              className="p-2"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text className="text-primary">
                {isPasswordVisible ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 mb-2">{errors.password.message}</Text>
          )}

          <TouchableOpacity className="self-end mb-6">
            <Text className="text-sm text-primary">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <Button
            variant={"default"}
            className={cn(
              isLoading && "opacity-50",
              "rounded-full w-full py-7 mb-4 bg-primary"
            )}
            disabled={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="text-lg font-semibold text-white">
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Text>
          </Button>
        </View>

        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-gray-600">¿No tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text className="text-sm text-primary font-bold ml-1">
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
