import { cn } from "@/lib/utils";
import { useState } from "react";
import { Control, FieldErrors, Controller, FieldValues, Path } from "react-hook-form";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

interface PasswordInputProps<T extends FieldValues> {
    control: Control<T>;
    errors: FieldErrors<T>;
    name: Path<T>;
    label: string;
    placeholder: string;
}

const PasswordInput = <T extends FieldValues>({ control, errors, name, label, placeholder }: PasswordInputProps<T>) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <View className="mb-4">
             <Text className="text-base text-gray-700 font-semibold mb-2">{label}</Text>
            <View className={cn("flex-row items-center bg-white rounded-lg border",  errors[name] ? "border-red-500" : "border-gray-300")}>
                <Controller
                    control={control}
                    name={name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="flex-1 h-12 p-3 text-base text-primary"
                            placeholder={placeholder}
                            placeholderTextColor="#A9A9A9"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            secureTextEntry={!isVisible}
                            autoCapitalize="none"
                            value={value as string}
                        />
                    )}
                />
                <TouchableOpacity
                    className="p-3"
                    onPress={() => setIsVisible(!isVisible)}
                >
                    <Text className="text-primary font-semibold">
                        {isVisible ? "Ocultar" : "Mostrar"}
                    </Text>
                </TouchableOpacity>
            </View>
            {errors[name] && (
                <Text className="text-red-500 mt-1">{(errors[name] as any).message}</Text>
            )}
        </View>
    );
};

export default PasswordInput;
export type { PasswordInputProps };