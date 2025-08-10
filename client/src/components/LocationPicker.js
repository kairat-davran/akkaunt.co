import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMapEvents,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ position, setPosition, radius = 3000, readonly = false }) => {
  useEffect(() => {
    if (!position && !readonly) {
      setPosition([37.7749, -122.4194]);
    }
  }, [position, setPosition, readonly]);

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!readonly) {
          setPosition([e.latlng.lat, e.latlng.lng]);
        }
      }
    });
    return null;
  };

  return (
    <div style={{ height: '300px', maxWidth: '100%' }}>
      <MapContainer
        center={position || [37.7749, -122.4194]}
        zoom={11}
        scrollWheelZoom
        dragging={!readonly}
        doubleClickZoom={!readonly}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler />
        <RecenterMap position={position} />

        {position && (
          <>
            <Circle
              key={`${position[0]}-${position[1]}-${radius}`}
              center={position}
              radius={radius}
              pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
            />
            {!readonly && <Marker position={position} />}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;