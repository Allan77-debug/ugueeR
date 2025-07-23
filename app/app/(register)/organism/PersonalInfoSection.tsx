
import React from "react";
import { Control, FieldErrors, FieldValues, Path } from "react-hook-form";
import { View, Text } from "react-native";
import FormInput from "../atoms/FormInput";
import FormPicker from "../atoms/FormPicker";

interface PersonalInfoSectionProps<T extends FieldValues> {
  control: Control<T>; // Reemplazar con el tipo adecuado
  errors: FieldErrors<T>; // Reemplazar con el tipo adecuado
}
const PersonalInfoSection = <T extends FieldValues>({
  control,
  errors,
}: PersonalInfoSectionProps<T>) => {
  const userTypes = [
    { label: "Estudiante", value: "student" },
    { label: "Administrativo", value: "admin" },
    { label: "Profesor", value: "teacher" },
    { label: "Empleado", value: "employee" },
    { label: "Otro", value: "other" },
  ];
  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">
        Información Personal
      </Text>

      <FormInput
        name={"fullName" as Path<T>}
        label="Nombre Completo *"
        placeholder="Ingrese su nombre completo"
        control={control}
        errors={errors}
      />

      {/* Fila para Tipo de Usuario y Código */}
      <View className="flex-row justify-between">
        <View className="flex-1 mr-2">
          <FormPicker
            control={control}
            errors={errors}
            name={"userType" as Path<T>}
            label="Tipo de Usuario *"
            items={userTypes}
          />
        </View>

        <View className="flex-1 ml-2">
          <FormInput
            name={"studentCode" as Path<T>}
            label="Código *"
            placeholder="Código institucional"
            keyboardType="numeric"
            control={control}
            errors={errors}
          />
        </View>
      </View>

      <FormInput
        name={"institutionalMail" as Path<T>}
        label="Correo Institucional *"
        placeholder="correo@institucion.edu.co"
        keyboardType="email-address"
        control={control}
        errors={errors}
      />
      <FormInput
        name={"direction" as Path<T>}
        label="Dirección *"
        control={control}
        errors={errors}
        placeholder="Ingrese su dirección"
      />
      <FormInput
        name={"phone" as Path<T>}
        label="Teléfono *"
        control={control}
        errors={errors}
        placeholder="Ingrese su teléfono"
        keyboardType="phone-pad"
      />
    </View>
  );
};

export default PersonalInfoSection;
