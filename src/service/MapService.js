import axios from 'axios';

export async function calculateOptimalRoute(currentLocation, deliveryPoints) {
  // {label: '', position {lng,lat}};
  const points = [currentLocation, ...deliveryPoints];

  function calculateDistance(posA, posB) {
    const R = 6371;
    const dLat = (posB.lat - posA.lat) * (Math.PI / 180);
    const dLng = (posB.lng - posA.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(posA.lat * (Math.PI / 180)) * Math.cos(posB.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function nearestNeighborRoute(points) {
    const visited = new Set();
    const ordered = [];

    let current = points[0];
    visited.add(current.label);
    ordered.push(current);

    while (visited.size < points.length) {
      let nearest = null;
      let minDist = Infinity;

      for (let candidate of points) {
        if (!visited.has(candidate.label)) {
          const dist = calculateDistance(current.position, candidate.position);
          if (dist < minDist) {
            minDist = dist;
            nearest = candidate;
          }
        }
      }

      if (nearest) {
        visited.add(nearest.label);
        ordered.push(nearest);
        current = nearest;
      }
    }

    return ordered;
  }

  function generateGoogleMapsURL(points) {

    if (!Array.isArray(points) || points.length < 2) return null;
    const cupPoints = points.slice(0, 10); //limitamos a 10 puntos para crear la ruta por tramos.
    const origen = cupPoints[0];
    const destino = cupPoints[cupPoints.length - 1];

    if (!origen || !destino) return null;

    const waypoints = cupPoints
      .slice(1, -1)
      .map(p => `${p.position.lat},${p.position.lng}`)
      .join("|");

    const originStr = `${origen.position.lat},${origen.position.lng}`;
    const destinationStr = `${destino.position.lat},${destino.position.lng}`;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;

    return url;
  }

  const routePoints = nearestNeighborRoute(points);
  const route = [
    ...routePoints,
    // route[0]
  ];

  const urlGoogleMaps = generateGoogleMapsURL(route);
  let polylines = [{ distance: 0, polyline: route.map(p => [p.position.lat, p.position.lng]) }];

  try {
    const url = `http://localhost:8989/route?point=${route.map(p => `${p.position.lat},${p.position.lng}`).join('&point=')}&profile=car&points_encoded=false&instructions=false&elevation=false`;
    const { data } = await axios.get(url);
    polylines = data.paths.map(p => {
      const polyline = p.points.coordinates.map(c => [c[1], c[0]]);
      return {
        polyline,
        distance: (p.distance / 1000).toFixed(2),
        time: p.time
      }
    });
  } catch (error) {
    console.log('error on get polyline: ---------------------', error);
  }
  return {
    route,
    polylines,
    urlGoogleMaps,
  };
}
