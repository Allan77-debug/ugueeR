import React from 'react';
import { Marker } from 'react-native-maps';

type Coordinate = {
  latitude: number;
  longitude: number;
};

interface RouteMarkerProps {
  coordinate: Coordinate;
  title: string;
  pinColor: string;
  description?: string;
}

const RouteMarker: React.FC<RouteMarkerProps> = ({ 
  coordinate, 
  title, 
  pinColor, 
  description 
}) => {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      pinColor={pinColor}
    />
  );
};

export default RouteMarker;