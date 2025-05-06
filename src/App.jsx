import { useEffect, useState } from 'react';
import { Button, Form, Input, List, Space } from 'antd';
import './App.css';
import Map from './components/Map';
import { calculateOptimalRoute } from './service/MapService';

const defaultCenter = {
  label: 'Inicio default',
  position: { lat: -31.417283, lng: -64.183813 },
};

function App() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [points, setPoints] = useState([
    { label: 'Marker1', position: { lat: -31.236840, lng: -64.322312 } },
    { label: 'Marker2', position: { lat: -31.241317, lng: -64.301455 } },
    { label: 'Marker3', position: { lat: -31.225199, lng: -64.267393 } },
    { label: 'Marker4', position: { lat: -31.214196, lng: -64.313882 } }
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            label: 'Inicio',
            position: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        () => {
          setCurrentPosition(defaultCenter);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!currentPosition) return;

    calculateOptimalRoute(currentPosition, points)
      .then(({ polyline }) => setPolyline(polyline));
  }, [currentPosition, points]);

  const handleMarkerDrag = (index, newPosition) => {
    const updatedPoints = [...points];
    updatedPoints[index] = {
      ...updatedPoints[index],
      position: newPosition,
    };
    setPoints(updatedPoints);
  };

  const handleAddPoint = (values) => {
    const [lat, lng] = values.coordinates.split(',').map(Number);
    setPoints([...points, { label: values.label, position: { lat, lng } }]);
  };

  const handleRemove = (index) => {
    const updated = [...points];
    updated.splice(index, 1);
    setPoints(updated);
  };

  if (!currentPosition) return <h2>Cargando...</h2>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '300px', padding: '1rem', overflowY: 'auto', background: '#f0f2f5' }}>
        <Form layout="vertical" onFinish={handleAddPoint}>
          <Form.Item name="label" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="coordinates"
            label="Coordenadas (lat,lng)"
            rules={[{ required: true }]}
          >
            <Input placeholder="-31.23,-64.32" />
          </Form.Item>
          <Button type="primary" htmlType="submit">Agregar Punto</Button>
        </Form>

        <List
          style={{ marginTop: 20 }}
          header={<b>Puntos de Entrega</b>}
          dataSource={points}
          renderItem={(item, idx) => (
            <List.Item
              actions={[
                <Button danger size="small" onClick={() => handleRemove(idx)}>Eliminar</Button>
              ]}
            >
              {item.label} ({item.position.lat.toFixed(3)}, {item.position.lng.toFixed(3)})
            </List.Item>
          )}
        />
      </div>

      <div style={{ flex: 1 }}>
        <Map
          position={currentPosition}
          markers={[currentPosition, ...points]}
          polyline={polyline}
          onMarkerDrag={(index, newPos) => handleMarkerDrag(index - 1, newPos)} // -1 porque el primero es currentPosition
        />
      </div>
    </div>
  );
}

export default App;
