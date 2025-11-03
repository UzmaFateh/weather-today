
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import {
  WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm, WiFog
} from "react-icons/wi";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]); // 🕐 NEW
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric");

  const API_KEY = "6613a7a814f754f96ca9856c4ef11ed4";

  const getBackgroundClass = (description) => {
    if (!description) return "bg-default";
    const desc = description.toLowerCase();
    if (desc.includes("clear")) return "bg-clear";
    if (desc.includes("cloud")) return "bg-cloud";
    if (desc.includes("rain")) return "bg-rain";
    if (desc.includes("snow")) return "bg-snow";
    if (desc.includes("thunder")) return "bg-thunder";
    if (desc.includes("fog") || desc.includes("mist")) return "bg-fog";
    return "bg-default";
  };

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

  const getWeatherSuggestion = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain")) return "☔ Don't forget your umbrella today!";
    if (desc.includes("clear")) return "🌞 Great day to go outside!";
    if (desc.includes("cloud")) return "☁ Maybe a cozy day indoors!";
    if (desc.includes("snow")) return "❄ Stay warm and enjoy the snow!";
    if (desc.includes("thunder")) return "⚡ Better stay inside, stay safe!";
    if (desc.includes("fog") || desc.includes("mist")) return "🌫 Drive carefully in the fog!";
    return "🌈 Have a nice day!";
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
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

  // 🌤 FETCH 3-HOURLY & 7-DAY FORECAST
  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();

      // 🕐 Next 24-hour (8 data points = 3-hourly)
      setHourlyForecast(data.list.slice(0, 8));

      // 📅 Daily 7-day forecast (12:00 PM filter)
      const dailyForecast = data.list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 7);
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
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
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

  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         fetchWeatherByCoords(latitude, longitude);
  //         fetchForecast(latitude, longitude);
  //       },
  //       () => setError("Geolocation permission denied or unavailable.")
  //     );
  //   } else {
  //     setError("Geolocation not supported by this browser.");
  //   }
  // }, [unit]);

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
}, []); // unit hata diya


  // const toggleUnit = () => {
  //   setUnit(unit === "metric" ? "imperial" : "metric");
  // };

  const toggleUnit = () => {
  const newUnit = unit === "metric" ? "imperial" : "metric";
  setUnit(newUnit);

  // agar city search ki hui hai to uska weather reload karo
  if (weather) {
    const { coord } = weather;
    if (coord) {
      fetchWeatherByCoords(coord.lat, coord.lon);
      fetchForecast(coord.lat, coord.lon);
    }
  }
};


  const getLocalTime = (timezone) => {
    if (!timezone) return "";
    const localDate = new Date(new Date().getTime() + timezone * 1000);
    return localDate.toUTCString().slice(0, 22);
  };

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

      {/* Hero Section */}
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
        <button className="unit-toggle" onClick={toggleUnit}>
          Show in {unit === "metric" ? "°F" : "°C"}
        </button>
        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Current Weather */}
      {weather && (
        <div className="weather-card">
          {getWeatherIcon(weather.weather[0].description)}
          <h2>{weather.name}</h2>
          <p className="temp">{Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
          <p className="details">{weather.weather[0].description}</p>
          <p className="details">
            Humidity: {weather.main.humidity}% | Wind: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
          </p>
          <p className="details">Local Time: {getLocalTime(weather.timezone)}</p>
          <p className="weather-suggestion">{getWeatherSuggestion(weather.weather[0].description)}</p>
        </div>
      )}

      {/* 🕐 Hourly Forecast (Next 24h) */}
      {hourlyForecast.length > 0 && (
        <div className="hourly-forecast">
          <h3>Next 24 Hours</h3>
          <div className="hourly-scroll">
            {hourlyForecast.map((hour, idx) => (
              <div key={idx} className="hour-card">
                <p>{new Date(hour.dt_txt).getHours()}:00</p>
                {getWeatherIcon(hour.weather[0].description)}
                <p>{Math.round(hour.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📅 7-Day Forecast Cards */}
      {forecast.length > 0 && (
        <div className="forecast-grid">
          {forecast.map((day, idx) => (
            <div key={idx} className="forecast-card">
              {getWeatherIcon(day.weather[0].description)}
              <p>{new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
              <p className="temp">{Math.round(day.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
              <p className="details">{day.weather[0].description}</p>
              <p className="details">Humidity: {day.main.humidity}%</p>
            </div>
          ))}
        </div>
      )}

      {/* 📈 7-Day Trend Chart */}
      {forecast.length > 0 && (
        <div className="chart-section">
          <h3>7-Day Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecast}>
              <XAxis dataKey={(d) => new Date(d.dt_txt).toLocaleDateString("en-US", { weekday: "short" })} />
              <Tooltip />
              <Line type="monotone" dataKey="main.temp" stroke="#1E90FF" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
