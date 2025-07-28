import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
// import axios from "axios";
// import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { Button } from "~/components/ui/button";
// import * as ImagePicker from "expo-image-picker";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormInput from "./(register)/atoms/FormInput";
import PasswordInput from "./(register)/atoms/PasswordInput";
import * as DocumentPicker from "expo-document-picker";
import PersonalInfoSection from "./(register)/organism/PersonalInfoSection";
import * as Burnt from "burnt";
import axios from "axios";

// Define los colores para mantener la consistencia
const COLORS = {
  gray: "#6a5acd",
};

// Esquema de validación con Yup
const schema = yup.object().shape({
  fullName: yup.string().required("El nombre completo es requerido"),
  userType: yup.string().required("El tipo de usuario es requerido"),
  institutionalMail: yup
    .string()
    .required("El correo electrónico es requerido")
    .matches(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
      "Ingrese una dirección de correo electrónico válida"
    ),
  studentCode: yup.string().required("El código es requerido"),
  document: yup
    .string()
    .min(7, "El documento debe tener al menos 7 dígitos")
    .required("El documento de identidad es requerido"),
  institutionalCard: yup
    .mixed<DocumentPicker.DocumentPickerAsset>()
    .nullable()
    .required("El carné institucional es requerido")
    .test("fileType", "El archivo debe ser un PDF o una imagen.", (value) => {
      if (!value) return true; // Dejar que 'required' maneje el caso nulo
      return (
        value.mimeType === "application/pdf" ||
        value.mimeType?.startsWith("image/")
      );
    }),
  direction: yup.string().required("La dirección es requerida"),
  phone: yup.string().required("El teléfono es requerido"),
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Las contraseñas deben coincidir")
    .required("Confirmar la contraseña es requerido"),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Debes aceptar los términos y condiciones")
    .required(),
});

interface FormValues {
  fullName: string;
  userType: string;
  institutionalMail: string;
  studentCode: string;
  document: string;
  institutionalCard: DocumentPicker.DocumentPickerAsset;
  direction: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const UserRegisterPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema), // Integra el resolver de Yup
    defaultValues: {
      fullName: "",
      userType: "student",
      institutionalMail: "",
      studentCode: "",
      document: "",
      institutionalCard: undefined, // Inicializa como un objeto vacío
      direction: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const institutionalCard_watch = watch("institutionalCard");
  const acceptTerms_watch = watch("acceptTerms");

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      console.log(result);

      if (result.canceled === false) {
        setValue("institutionalCard", result.assets[0], {
          shouldValidate: true,
        });
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  const onSubmit = async (data: FormValues) => {
    console.log("se esta enviando el formulario");
    setIsSubmitting(true);
    const form = new FormData();

    // Mapeo de campos del formulario al backend
    form.append("full_name", data.fullName);
    form.append("user_type", data.userType); // El backend ya maneja la lógica
    form.append("institutional_mail", data.institutionalMail);
    form.append("student_code", data.studentCode);
    form.append("udocument", data.document);
    form.append("direction", data.direction);
    form.append("uphone", data.phone);
    form.append("upassword", data.password);

    console.log("Datos del formulario:", data);

    if (data.institutionalCard) {
      const fileToUpload = {
        uri: data.institutionalCard.uri,
        name: data.institutionalCard.name,
        type: data.institutionalCard.mimeType,
      };

      // FormData necesita un objeto con uri, name y type para archivos
      form.append("institutional_carne", fileToUpload as any);
    }

    try {
      const response = await axios.post(
        "http://192.168.56.1:8000/api/users/register/",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      Burnt.alert({
        title: "Burnt installed.",
        preset: "done",
        message: "See your downloads.",
      }); 

      setTimeout(() => router.push("/"), 3000); // Redirige al login
    } catch (error) {
      // const errorMessage =
      //   axios.isAxiosError(error) && error.response?.data?.message
      //     ? error.response.data.message
      //     : "Error al enviar el formulario. Inténtalo de nuevo.";

      // Toast.show({
      //   type: 'error',
      //   text1: 'Error en el Registro',
      //   text2: errorMessage,
      // });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6">
            <Text className="text-3xl font-bold text-primary">
              Registro de Usuario
            </Text>
            <Text className="text-base text-gray-600 mt-2">
              Completa el formulario. Tu solicitud será revisada por tu
              institución.
            </Text>
          </View>

          {/* ----- Sección de Información Personal ----- */}
          <PersonalInfoSection control={control} errors={errors} />

          {/* ----- Sección de Documentos ----- */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
              Documentos
            </Text>
            <FormInput
              name="document"
              label="Documento de Identidad *"
              placeholder="Mínimo 7 dígitos"
              keyboardType="numeric"
              control={control}
              errors={errors}
            />

            <View className="mb-4">
              <Text className="text-base text-gray-700 font-semibold mb-2">
                Carné Institucional (PDF o Imagen) *
              </Text>
              <TouchableOpacity
                onPress={pickDocument}
                className={cn(
                  "bg-white rounded-lg p-4 border border-gray-300 flex-row justify-center items-center",
                  errors.institutionalCard && "border-red-500"
                )}
              >
                <Text className="text-blue-500 font-bold">
                  {institutionalCard_watch
                    ? "Cambiar Archivo"
                    : "Seleccionar Archivo"}
                </Text>
              </TouchableOpacity>
              {institutionalCard_watch && (
                <Text
                  className="text-gray-600 mt-2 text-center"
                  numberOfLines={1}
                >
                  Archivo: {institutionalCard_watch.name}
                </Text>
              )}
              {errors.institutionalCard && (
                <Text className="text-red-500 mt-1">
                  {(errors.institutionalCard as any).message}
                </Text>
              )}
            </View>
          </View>

          {/* ----- Sección de Seguridad ----- */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
              Seguridad
            </Text>
            <PasswordInput
              name="password"
              label="Contraseña *"
              placeholder="Ingrese su contraseña"
              control={control}
              errors={errors}
            />
            <PasswordInput
              name="confirmPassword"
              label="Confirmar Contraseña *"
              placeholder="Confirme su contraseña"
              control={control}
              errors={errors}
            />

            <View className="flex-row items-center my-4">
              <TouchableOpacity
                onPress={() =>
                  setValue("acceptTerms", !acceptTerms_watch, {
                    shouldValidate: true,
                  })
                }
                className={`w-6 h-6 rounded border-2 justify-center items-center ${
                  errors.acceptTerms ? "border-red-500" : "border-primary"
                }`}
              >
                {acceptTerms_watch && (
                  <View className="w-3.5 h-3.5 rounded-sm bg-primary" />
                )}
              </TouchableOpacity>
              <Text className="text-base text-gray-700 ml-3">Acepto los </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Términos y Condiciones",
                    "Aquí se mostrarían los términos."
                  )
                }
              >
                <Text className="text-base text-blue-500 font-bold">
                  términos y condiciones
                </Text>
              </TouchableOpacity>
            </View>
            {errors.acceptTerms && (
              <Text className="text-red-500 mt-1 mb-4">
                {(errors.acceptTerms as any).message}
              </Text>
            )}
          </View>

          <Text className="text-sm text-gray-500 mb-6 text-center">
            Al enviar, tu solicitud será revisada por la institución. Este
            proceso puede tardar hasta 48 horas hábiles.
          </Text>

          {/* ----- Botones de Acción ----- */}

          <Button
            variant={"default"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`rounded-full py-7 mb-4 ${
              isSubmitting ? "bg-gray-400" : "bg-primary"
            }`}
          >
            <Text className="text-lg font-semibold text-white text-center">
              {isSubmitting ? "Enviando..." : "Enviar Solicitud de Registro"}
            </Text>
          </Button>

          <TouchableOpacity
            onPress={() =>
              Burnt.toast({
                title: "Burnt installed.",
                preset: "done",
                message: "See your downloads.",

              })
            }
            className="rounded-full py-4 bg-gray-200"
          >
            <Text className="text-lg font-semibold text-gray-700 text-center">
              Cancelar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserRegisterPage;
