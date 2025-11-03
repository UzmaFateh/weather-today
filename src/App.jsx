

import { useState, useEffect } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm, WiFog } from "react-icons/wi";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "6613a7a814f754f96ca9856c4ef11ed4";


  const getWeatherIcon = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes("clear")) return <WiDaySunny size={60} color="#FFD700" className="icon-clear" />;
  if (desc.includes("cloud")) return <WiCloud size={60} color="#B0C4DE" className="icon-cloud" />;
  if (desc.includes("rain")) return <WiRain size={60} color="#1E90FF" className="icon-rain" />;
  if (desc.includes("snow")) return <WiSnow size={60} color="#ADD8E6" className="icon-snow" />;
  if (desc.includes("thunder")) return <WiThunderstorm size={60} color="#A9A9A9" className="icon-thunder" />;
  if (desc.includes("fog") || desc.includes("mist")) return <WiFog size={60} color="#D3D3D3" className="icon-fog" />;
  return <WiDaySunny size={60} color="#FFD700" className="icon-clear" />;
};

  const getBackgroundClass = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("clear")) return "bg-clear";
    if (desc.includes("cloud")) return "bg-cloud";
    if (desc.includes("rain")) return "bg-rain";
    if (desc.includes("snow")) return "bg-snow";
    if (desc.includes("thunder")) return "bg-thunder";
    if (desc.includes("fog") || desc.includes("mist")) return "bg-fog";
    return "bg-default";
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) {
        setError(data.message);
        setWeather(null);
      } else {
        setWeather(data);
      }
    } catch {
      setError("Something went wrong.");
      setWeather(null);
    }
    setLoading(false);
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      const dailyForecast = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      setForecast(dailyForecast);
    } catch {
      console.log("Forecast fetch error");
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) {
        setError(data.message);
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
        setError("");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
          fetchForecast(latitude, longitude);
        },
        () => setError("Geolocation permission denied or unavailable.")
      );
    } else {
      setError("Geolocation not supported by this browser.");
    }
  }, []);

  return (
    <div className={`app-container ${weather ? getBackgroundClass(weather.weather[0].description) : "bg-default"}`}>
      {/* Navbar */}
      <nav className="navbar">
        <h1>🌎 WeatherApp</h1>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Forecast</a>
          <a href="#">About</a>
        </div>
      </nav>

  <div className="hero-section">
  <h2>Check the Weather in Your City</h2>
  <div className="search-bar">
    <input
      type="text"
      placeholder="Enter city name..."
      value={city}
      onChange={(e) => setCity(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && fetchWeatherByCity()}
    />
    <button onClick={fetchWeatherByCity}>Search</button>
  </div>
  {loading && <p className="loading-text">Loading...</p>}
  {error && <p className="error-text">{error}</p>}
</div>


      {/* Current Weather */}
      {weather && (
        <div className="weather-card">
          {getWeatherIcon(weather.weather[0].description)}
          <h2>{weather.name}</h2>
          <p className="temp">{Math.round(weather.main.temp)}°C</p>
          <p className="details">{weather.weather[0].description}</p>
          <p className="details">Humidity: {weather.main.humidity}% | Wind: {weather.wind.speed} m/s</p>
        </div>
      )}

      {/* 5-day Forecast */}
      {forecast.length > 0 && (
        <div className="forecast-grid">
          {forecast.map((day, idx) => (
            <div key={idx} className="forecast-card">
              {getWeatherIcon(day.weather[0].description)}
              <p>{new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
              <p className="temp">{Math.round(day.main.temp)}°C</p>
              <p className="details">{day.weather[0].description}</p>
              <p className="details">Humidity: {day.main.humidity}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
