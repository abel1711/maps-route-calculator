// Map.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const defaultZoom = 13;

const Map = ({ markers = [], position, polyline, onMarkerDrag }) => {
  return (
    <MapContainer
      center={[position.position.lat, position.position.lng]}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {polyline && <Polyline positions={polyline} color="blue" />}

      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          draggable={marker.draggable ?? true}
          eventHandlers={{
            dragend: (event) => {
              const newLatLng = event.target.getLatLng();
              onMarkerDrag?.(index, { lat: newLatLng.lat, lng: newLatLng.lng });
            },
          }}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
