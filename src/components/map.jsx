import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from 'antd';
import './style.css';

const defaultZoom = 13;

const Map = ({ markers = [], position, polylineInfo, onMarkerDrag }) => {
  return (
    <MapContainer
      center={[position.position.lat, position.position.lng]}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {
        (() => {
          if (!('polylines' in polylineInfo)) return null;

          const { polylines, urlGoogleMaps } = polylineInfo;
          return (
            <>
              {
                polylines.map(pol => {
                  return (
                    <Polyline positions={pol.polyline} color="green" />
                  )
                })
              }
              {
                !!urlGoogleMaps && (
                  <div className="info-polyline">
                    <Button
                      type="primary"
                      onClick={() => window.open(urlGoogleMaps, '_blank')}
                    >Ver en google maps</Button>
                  </div>
                )
              }
            </>
          )
        })()
      }

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
