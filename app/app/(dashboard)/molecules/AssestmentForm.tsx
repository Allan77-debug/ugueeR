import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface AssessmentFormProps {
  onSubmit: (data: AssessmentFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  travelId: number;
  driverId: string;
}

export interface AssessmentFormData {
  travel: number;
  driver: string;
  score: number;
  comment: string;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  travelId,
  driverId
}) => {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const scoreOptions = [
    { label: '⭐ (1) - Muy malo', value: 1 },
    { label: '⭐⭐ (2) - Malo', value: 2 },
    { label: '⭐⭐⭐ (3) - Regular', value: 3 },
    { label: '⭐⭐⭐⭐ (4) - Bueno', value: 4 },
    { label: '⭐⭐⭐⭐⭐ (5) - Excelente', value: 5 },
  ];

  const handleSubmit = () => {
    // Validaciones
    if (score < 1 || score > 5) {
      Alert.alert('Error', 'Selecciona una calificación válida (1-5)');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Por favor, escribe un comentario');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Error', 'El comentario debe tener al menos 10 caracteres');
      return;
    }

    const formData: AssessmentFormData = {
      travel: travelId,
      driver: driverId,
      score,
      comment: comment.trim()
    };

    onSubmit(formData);
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-4">Calificar Viaje</Text>
      
      <Text className="text-sm text-gray-600 mb-6">
        Comparte tu experiencia sobre este viaje para ayudar a otros usuarios
      </Text>

      {/* Selección de calificación */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Calificación *</Text>
        <View className="bg-white border border-gray-300 rounded-lg">
          <Picker
            selectedValue={score}
            onValueChange={setScore}
          >
            {scoreOptions.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Comentario */}
      <View className="mb-6">
        <Text className="text-base font-semibold mb-2">Comentario *</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3 h-24"
          value={comment}
          onChangeText={setComment}
          placeholder="Describe tu experiencia con este viaje... (mínimo 10 caracteres)"
          multiline
          textAlignVertical="top"
        />
        <Text className="text-xs text-gray-500 mt-1">
          {comment.length}/200 caracteres
        </Text>
      </View>

      {/* Botones */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 rounded-lg p-3"
        >
          <Text className="text-center font-semibold text-gray-700">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`flex-1 rounded-lg p-3 ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`}
        >
          <Text className="text-center font-semibold text-white">
            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AssessmentForm;