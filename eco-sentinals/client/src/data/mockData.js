export const wardData = [
  { id: 1, name: 'Rohini A', aqi: 120, wasteLevel: 65, coordinates: [28.737, 77.113], health: 'good' },
  { id: 2, name: 'Shalimar Bagh', aqi: 245, wasteLevel: 85, coordinates: [28.718, 77.161], health: 'warning' },
  { id: 3, name: 'Karol Bagh', aqi: 310, wasteLevel: 92, coordinates: [28.652, 77.195], health: 'critical' },
  { id: 4, name: 'Dwarka B', aqi: 95, wasteLevel: 45, coordinates: [28.582, 77.050], health: 'good' },
  { id: 5, name: 'Vasant Kunj', aqi: 180, wasteLevel: 55, coordinates: [28.529, 77.156], health: 'moderate' },
  { id: 6, name: 'Okhla', aqi: 415, wasteLevel: 98, coordinates: [28.558, 77.279], health: 'critical' },
  { id: 7, name: 'Lajpat Nagar', aqi: 280, wasteLevel: 75, coordinates: [28.567, 77.243], health: 'warning' },
];

export const citizenData = {
  streak: 7,
  points: 1450,
  level: 'Eco-Champion',
  recentActions: [
    { type: 'waste_segregated', points: +50, time: '2h ago' },
    { type: 'aqi_alert_shared', points: +20, time: '1d ago' },
    { type: 'device_calibrated', points: +100, time: '3d ago' },
  ],
};

export const leaderboard = [
  { rank: 1, ward: 'Dwarka B', score: 9500 },
  { rank: 2, ward: 'Rohini A', score: 8200 },
  { rank: 3, ward: 'Vasant Kunj', score: 7100 },
];
