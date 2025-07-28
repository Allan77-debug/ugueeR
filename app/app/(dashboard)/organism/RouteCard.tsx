import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoutePreview from '../molecules/RoutePreview';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Route = {
  id: string;
  startLocation: string;
  destination: string;
  startPointCoords: number[];
  endPointCoords: number[];
  stops: Coordinate[];
};

interface RouteCardProps {
  route: Route;
  onPress?: (route: Route) => void;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
  showActions?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ 
  route, 
  onPress, 
  onEdit, 
  onDelete,
  showActions = true 
}) => {
  const handlePress = () => {
    onPress?.(route);
  };

  const handleEdit = () => {
    onEdit?.(route);
  };

  const handleDelete = () => {
    onDelete?.(route);
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-md p-4 mb-4 mx-2"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {route.startLocation} - {route.destination}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
              De: {/* Aquí podrías mostrar una dirección formateada */}
              {route.startPointCoords[0].toFixed(4)}, {route.startPointCoords[1].toFixed(4)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="flag" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
              A: {route.endPointCoords[0].toFixed(4)}, {route.endPointCoords[1].toFixed(4)}
            </Text>
          </View>
        </View>
        
        {showActions && (
          <View className="flex-row">
            {onEdit && (
              <TouchableOpacity
                onPress={handleEdit}
                className="p-2 mr-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={20} color="#6366f1" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Route Preview */}
      <RoutePreview route={route} height={120} />
      
      {/* Footer Info */}
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          {/* <Text className="text-xs text-gray-500 ml-1">
            {route.stops.length} parada{route.stops.length !== 1 ? 's' : ''}
          </Text> */}
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={handlePress}
        >
          <Text className="text-xs text-indigo-600 mr-1">Ver detalles</Text>
          <Ionicons name="chevron-forward" size={12} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default RouteCard;