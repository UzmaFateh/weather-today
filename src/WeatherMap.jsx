// src/WeatherMap.jsx

import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './WeatherMap.css'; 

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define a custom icon
const customMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to change the map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

// Component to handle map display and overlay
const WeatherMap = ({ lat, lon, apiKey, cityName }) => {
    
    // Default location agar coordinates na milen
    const position = [lat || 28.6448, lon || 77.2167];
    
    // ⭐ NEW: Rainviewer's Free, Attractive Radar Tiles ⭐
    // 'now' ka matlab hai ki yeh current/live radar data dikhayega.
    const rainviewerRadarUrl = "https://tile.rainviewer.com/v1/radar/now/{z}/{x}/{y}/5/1_0.png";

    return (
        <div className="map-wrapper">
            <MapContainer 
            
                center={position} 
                zoom={7} 
                scrollWheelZoom={true} // Zooming ab accha kaam karega
                className="interactive-map" 
            >
                <ChangeView center={position} zoom={7} />
                
                {/* 1. Base Map Layer (OpenStreetMap - Simple aur Fast) */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    zIndex={1}
                />
                
                {/* 2. ⭐ ATTRACIVE RADAR LAYER ⭐ */}
                <TileLayer
                    url={rainviewerRadarUrl}
                    opacity={1.0} // Poora 100% visible
                    zIndex={5} // Sabse upar dikhega
                />

                {/* OpenWeatherMap Temperature Layer */}
                <TileLayer
                    url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=6613a7a814f754f96ca9856c4ef11ed4`}
                    opacity={0.5} // Adjust opacity as needed
                    zIndex={6} // Higher zIndex to appear above radar
                    attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
                />

                {/* OpenWeatherMap Wind Speed Layer */}
                <TileLayer
                    url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=6613a7a814f754f96ca9856c4ef11ed4`}
                    opacity={0.5} // Adjust opacity as needed
                    zIndex={7} // Even higher zIndex
                    attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
                />

                {/* Marker at the current location */}
                <Marker position={position} icon={customMarkerIcon}>
                    <Tooltip>
                        **{cityName || 'Aapki Location'}** <br /> 
                        Yahan par barish/badal ki jaankari dekhen.
                    </Tooltip>
                </Marker>

            </MapContainer>
        </div>
    );
};

export default WeatherMap;


