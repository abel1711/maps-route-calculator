import axios from 'axios';

export async function calculateOptimalRoute(currentLocation, deliveryPoints) {
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

  const route = nearestNeighborRoute(points);
  const finalRoute = [...route, route[0]];

  let polyline = finalRoute.map(p => [p.position.lat, p.position.lng]);

  try {
    const url = `http://localhost:8989/route?point=${finalRoute.map(p => `${p.position.lat},${p.position.lng}`).join('&point=')}&profile=car&points_encoded=false&instructions=false&elevation=false`;
    const { data } = await axios.get(url);
    polyline = data.paths[0].points.coordinates.map((c, i) => [c[1], c[0]]);
  } catch (error) {
    console.log('error on get polyline: ---------------------', error);
  }
  return { route: finalRoute, polyline };
}
