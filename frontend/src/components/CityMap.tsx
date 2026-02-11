import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ParkingZone } from '../types';
import { Navigation } from 'lucide-react';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const parkingIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3005/3005359.png', // Parking P icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png', // User Dot
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

interface CityMapProps {
    zones: ParkingZone[];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 14);
    }, [center, map]);
    return null;
}

export default function CityMap({ zones }: CityMapProps) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [nearestZone, setNearestZone] = useState<ParkingZone | null>(null);

    useEffect(() => {
        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);

                    // Find Nearest Zone
                    if (zones.length > 0) {
                        let minDist = Infinity;
                        let closest = null;
                        zones.forEach(zone => {
                            const d = Math.sqrt(Math.pow(zone.location_lat - latitude, 2) + Math.pow(zone.location_lng - longitude, 2));
                            if (d < minDist) {
                                minDist = d;
                                closest = zone;
                            }
                        });
                        setNearestZone(closest);
                    }
                },
                (error) => {
                    // Location denied or unavailable — silently fall back to Delhi center
                    if (error.code !== 1) console.warn("Geolocation unavailable, using default");
                    setUserLocation([28.6304, 77.2177]);
                }
            );
        } else {
            // Fallback
            setUserLocation([28.6304, 77.2177]);
        }
    }, [zones]);

    const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi

    return (
        <div className="h-full w-full relative h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-tactical-border">
            <MapContainer
                center={userLocation || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0 bg-slate-900"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Marker */}
                {userLocation && (
                    <>
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>You are Here</Popup>
                        </Marker>
                        <Circle center={userLocation} radius={500} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
                        <MapUpdater center={userLocation} />
                    </>
                )}

                {/* Parking Zones */}
                {zones.map(zone => (
                    <Marker
                        key={zone.id}
                        position={[zone.location_lat, zone.location_lng]}
                        icon={parkingIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold">{zone.name}</h3>
                                <p className="text-xs">Capacity: {zone.max_capacity}</p>
                                <p className={`text-xs font-bold ${(zone.current_count || 0) / zone.max_capacity > 0.9 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                    {Math.round((zone.current_count || 0) / zone.max_capacity * 100)}% Full
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Line */}
                {userLocation && nearestZone && (
                    <Polyline
                        positions={[userLocation, [nearestZone.location_lat, nearestZone.location_lng]]}
                        color="blue"
                        dashArray="5, 10"
                        weight={4}
                    />
                )}
            </MapContainer>

            {nearestZone && userLocation && (
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-xl z-[1000] border-l-4 border-blue-500 flex justify-between items-center animate-in slide-in-from-bottom-5">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Nearest Parking</p>
                        <h3 className="text-lg font-bold text-slate-800">{nearestZone.name}</h3>
                        <p className="text-xs text-gray-500">~12 mins drive</p>
                    </div>
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${nearestZone.location_lat},${nearestZone.location_lng}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                        <Navigation size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
