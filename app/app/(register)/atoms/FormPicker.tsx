import { cn } from "@/lib/utils";
import { Picker } from "@react-native-picker/picker";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";
import { Text, View } from "react-native";

// Define una interfaz para los ítems del Picker
interface PickerItem {
  label: string;
  value: string | number;
}

// Define las props para el nuevo componente FormPicker
interface FormPickerProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  label: string;
  items: PickerItem[]; // Un array de objetos para las opciones del picker
  placeholder?: string;
}

const FormPicker = <T extends FieldValues>({
  control,
  errors,
  name,
  label,
  items,
  placeholder = "Seleccione una opción",
  ...props
}: FormPickerProps<T>) => (
  <View className="mb-4">
    <Text className="text-base text-gray-700 font-semibold mb-2">{label}</Text>
    <View className="bg-white rounded-lg border border-gray-300">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Picker
            className={cn(
              errors.userType && "border-red-500",
              "bg-white rounded-lg p-3"
            )}
            selectedValue={value}
            onValueChange={onChange}
            {...props}
          >
            {/* Opcional: Descomenta si quieres un placeholder */}
            {/* <Picker.Item label={placeholder} value="" enabled={false} /> */}
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        )}
      />
    </View>
    {errors[name] && (
      <Text className="text-red-500 mt-1">{(errors[name] as any).message}</Text>
    )}
  </View>
);

export default FormPicker;
export type { FormPickerProps, PickerItem };
