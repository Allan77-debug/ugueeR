import { cn } from "@/lib/utils";
import {
  Control,
  FieldErrors,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { View, TextInput, Text } from "react-native";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

const FormInput = <T extends FieldValues>({
  control,
  errors,
  name,
  label,
  ...props
}: FormInputProps<T>) => (
  <View className="mb-4">
    <Text className="text-base text-gray-700 font-semibold mb-2">{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          className={cn(
            "bg-white rounded-lg p-3 border text-base",
            errors[name] ? "border-red-500" : "border-gray-300"
          )}
          onBlur={onBlur}
          onChangeText={(e) => {
            if (
              props.keyboardType &&
              props.keyboardType === "numeric" &&
              isNaN(Number(e))
            ) {
              return;
            }

            if (props.keyboardType === "phone-pad" && !e.match(/^\+?\d*$/)) {
              return;
            }

            onChange(e);
          }}
          value={value as string}
          placeholderTextColor="#A9A9A9"
          {...props}
        />
      )}
    />
    {errors[name] && (
      <Text className="text-red-500 mt-1">{(errors[name] as any).message}</Text>
    )}
  </View>
);

export default FormInput;
export type { FormInputProps };
