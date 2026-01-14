import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight, FaStar, FaCaretDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';
import WeatherMap from './WeatherMap';
import ThreeColumnLayout from './ThreeColumnLayout';
import './ThreeColumnLayout.css';
import Footer from './Footer';

// Import animated SVG icons
const weatherIconMap = {
  "clear sky": "/weather-icons/clear-day.svg",
  "few clouds": "/weather-icons/partly-cloudy-day.svg", // Assuming partly cloudy for few clouds
  "scattered clouds": "/weather-icons/cloudy.svg",
  "broken clouds": "/weather-icons/cloudy.svg",
  "overcast clouds": "/weather-icons/cloudy.svg",
  "shower rain": "/weather-icons/rain.svg",
  "rain": "/weather-icons/rain.svg",
  "light rain": "/weather-icons/rain.svg",
  "moderate rain": "/weather-icons/rain.svg",
  "heavy intensity rain": "/weather-icons/rain.svg",
  "very heavy rain": "/weather-icons/rain.svg",
  "extreme rain": "/weather-icons/rain.svg",
  "freezing rain": "/weather-icons/rain.svg", // Closest
  "light intensity shower rain": "/weather-icons/rain.svg",
  "heavy intensity shower rain": "/weather-icons/rain.svg",
  "ragged shower rain": "/weather-icons/rain.svg",
  "thunderstorm": "/weather-icons/thunderstorms.svg",
  "thunderstorm with light rain": "/weather-icons/thunderstorms.svg",
  "thunderstorm with rain": "/weather-icons/thunderstorms.svg",
  "thunderstorm with heavy rain": "/weather-icons/thunderstorms.svg",
  "light thunderstorm": "/weather-icons/thunderstorms.svg",
  "heavy thunderstorm": "/weather-icons/thunderstorms.svg",
  "ragged thunderstorm": "/weather-icons/thunderstorms.svg",
  "thunderstorm with light drizzle": "/weather-icons/thunderstorms.svg",
  "thunderstorm with drizzle": "/weather-icons/thunderstorms.svg",
  "thunderstorm with heavy drizzle": "/weather-icons/thunderstorms.svg",
  "snow": "/weather-icons/snow.svg",
  "light snow": "/weather-icons/snow.svg",
  "heavy snow": "/weather-icons/snow.svg",
  "sleet": "/weather-icons/snow.svg", // Closest
  "light shower sleet": "/weather-icons/snow.svg",
  "shower sleet": "/weather-icons/snow.svg",
  "light rain and snow": "/weather-icons/snow.svg",
  "rain and snow": "/weather-icons/snow.svg",
  "light shower snow": "/weather-icons/snow.svg",
  "shower snow": "/weather-icons/snow.svg",
  "heavy shower snow": "/weather-icons/snow.svg",
  "mist": "/weather-icons/mist.svg",
  "smoke": "/weather-icons/fog.svg", // Closest
  "haze": "/weather-icons/fog.svg", // Closest
  "sand/dust whirls": "/weather-icons/fog.svg", // Closest
  "fog": "/weather-icons/fog.svg",
  "sand": "/weather-icons/fog.svg", // Closest
  "dust": "/weather-icons/fog.svg", // Closest
  "volcanic ash": "/weather-icons/fog.svg", // Closest
  "squalls": "/weather-icons/thunderstorms.svg", // Closest
  "tornado": "/weather-icons/thunderstorms.svg", // Closest
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [suggestions, setSuggestions] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites")) || []);
  const [recent, setRecent] = useState(JSON.parse(localStorage.getItem("recent")) || ["London", "New York", "Tokyo", "Paris", "Dubai"]);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [uvIndex, setUvIndex] = useState(null);
  const [recentIndex, setRecentIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);  // navbar k lie


  const [hourlyCarouselOffset, setHourlyCarouselOffset] = useState(0);
  const hourlyScrollRef = useRef(null); // Ref for the hourly-scroll container
  const searchBoxRef = useRef(null); // Ref for the search box
  const favoritesDropdownRef = useRef(null); // Ref for the favorites dropdown

  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBoxRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (favoritesDropdownRef.current && !favoritesDropdownRef.current.contains(event.target)) {
        setShowFavorites(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [favoritesDropdownRef]);

  const handleNextRecent = () => {
    setRecentIndex((prevIndex) => (prevIndex + 1) % recent.length);
  };

  const handlePrevRecent = () => {
    setRecentIndex((prevIndex) => (prevIndex - 1 + recent.length) % recent.length);
  };

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
    const iconPath = weatherIconMap[description.toLowerCase()];
    if (iconPath) {
      return <img src={iconPath} alt={description} style={{ width: 60, height: 60 }} />;
    }
    // Fallback icon if description not found in map
    return <img src="/src/assets/weather-icons/clear-day.svg" alt="default weather icon" style={{ width: 60, height: 60 }} />;
  };

  const getWindDirection = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return { text: directions[index], rotate: deg };
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

  const getUvIndexDescription = (uv) => {
    if (uv === null) return "N/A";
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  const getAqiDescription = (aqi) => {
    if (aqi === null) return "N/A";
    if (aqi === 1) return "Good";
    if (aqi === 2) return "Fair";
    if (aqi === 3) return "Moderate";
    if (aqi === 4) return "Poor";
    if (aqi === 5) return "Very Poor";
    return "N/A";
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
      const data = await res.json();
      if (data.cod !== 200) {
        setError(data.message);
        setWeather(null);
      } else {
        setWeather(data);
        fetchAQI(lat, lon);
        fetchForecast(lat, lon);
        fetchAlerts(lat, lon);
        fetchUvIndex(lat, lon);
      }
    } catch {
      setError("Something went wrong.");
      setWeather(null);
    }
    setLoading(false);
  };

  const fetchAQI = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = await res.json();
      if (data.list && data.list.length > 0) {
        setAqi(data.list[0].main.aqi);
      }
    } catch {
      console.log("AQI fetch error");
      setAqi(null);
    }
  };

  const fetchAlerts = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`);
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.log("Alerts fetch error", err);
      setAlerts([]);
    }
  };

  const fetchUvIndex = async (lat, lon) => {
    console.log("Fetching UV Index for:", lat, lon);
    try {
      const res = await fetch(`https://currentuvindex.com/api/v1/uvi?latitude=${lat}&longitude=${lon}`);
      const data = await res.json();
      console.log("UV Index API Response:", JSON.stringify(data, null, 2));
      if (data && data.now && data.now.uvi !== undefined) {
        setUvIndex(data.now.uvi);
        console.log("UV Index set to:", data.now.uvi);
      } else {
        setUvIndex(null);
        console.log("UV Index data not found in response.");
      }
    } catch (err) {
      console.log("UV Index fetch error", err);
      setUvIndex(null);
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
      const data = await res.json();
      setHourlyForecast(data.list.slice(0, 8));
      const dailyForecast = data.list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 7);
      setForecast(dailyForecast);
    } catch {
      console.log("Forecast fetch error");
    }
  };

  const fetchWeatherByCity = async (name) => {
    const cityName = name || city;
    if (!cityName) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`);
      const data = await res.json();
      if (data.cod !== 200) {
        setError(data.message);
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
        fetchAQI(data.coord.lat, data.coord.lon);
        fetchAlerts(data.coord.lat, data.coord.lon);
        fetchUvIndex(data.coord.lat, data.coord.lon);
        setError("");
        const updated = [cityName, ...recent.filter((r) => r.toLowerCase() !== cityName.toLowerCase())].slice(0, 10);
        setRecent(updated);
        localStorage.setItem("recent", JSON.stringify(updated));
      }
      setSuggestions([]);
      setCity("");
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (city.length > 1) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`)
          .then((res) => res.json())
          .then((data) => setSuggestions(data))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [city]);

  const toggleFavorite = (name) => {
    let updated;
    if (favorites.includes(name)) {
      updated = favorites.filter((c) => c !== name);
    } else {
      updated = [...favorites, name];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        () => {
          setError("Geolocation permission denied. Please enter a city.");
          fetchWeatherByCity("London"); // Default city
        }
      );
    } else {
      setError("Geolocation not supported. Please enter a city.");
      fetchWeatherByCity("London"); // Default city
    }
  }, []);

  useEffect(() => {
    if (weather && weather.coord) {
      fetchWeatherByCoords(weather.coord.lat, weather.coord.lon);
    }
  }, [unit]);

  const toggleUnit = () => setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));

  const getLocalTime = (timezone) => {
    if (timezone === undefined) return "";
    const date = new Date();
    const localDate = new Date(date.getTime() + timezone * 1000 + date.getTimezoneOffset() * 60 * 1000);
    const options = {
      weekday: 'short', // e.g., "Mon"
      month: 'short',   // e.g., "Oct"
      day: 'numeric',   // e.g., "25"
      hour: '2-digit',  // e.g., "02"
      minute: '2-digit',// e.g., "00"
      hour12: true      // e.g., "AM/PM"
    };
    return localDate.toLocaleDateString('en-US', options);
  };

  const formatUnixToLocalTime = (unixTimestamp, timezoneOffsetSeconds) => {
    if (unixTimestamp === undefined || timezoneOffsetSeconds === undefined) return "";
    const date = new Date(unixTimestamp * 1000);
    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const localDate = new Date(utc + (timezoneOffsetSeconds * 1000));
    return localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleNextHourly = () => {
    if (hourlyScrollRef.current && hourlyForecast.length > 0) {
      const containerWidth = hourlyScrollRef.current.parentElement.offsetWidth; // Visible width of the carousel
      const scrollWidth = hourlyScrollRef.current.scrollWidth; // Total width of all cards

      setHourlyCarouselOffset((prevOffset) => {
        let newOffset = prevOffset - containerWidth;
        // If we've scrolled past the end, loop back to 0
        if (Math.abs(newOffset) >= scrollWidth - containerWidth + 10 && scrollWidth > containerWidth) { // Add a small buffer for floating point issues
          newOffset = 0;
        } else if (scrollWidth <= containerWidth) { // If content fits, no scrolling needed
          newOffset = 0;
        }
        return newOffset;
      });
    }
  };

  const handlePrevHourly = () => {
    if (hourlyScrollRef.current && hourlyForecast.length > 0) {
      const containerWidth = hourlyScrollRef.current.parentElement.offsetWidth; // Visible width of the carousel
      const scrollWidth = hourlyScrollRef.current.scrollWidth; // Total width of all cards

      setHourlyCarouselOffset((prevOffset) => {
        let newOffset = prevOffset + containerWidth;
        // If we've scrolled before the start, loop to the end
        if (newOffset > 0) {
          newOffset = -(scrollWidth - containerWidth);
          if (newOffset > 0) newOffset = 0; // If content is smaller than container, stay at 0
        } else if (scrollWidth <= containerWidth) { // If content fits, no scrolling needed
          newOffset = 0;
        }
        return newOffset;
      });
    }
  };

  return (
    <div className={`app-container ${weather ? getBackgroundClass(weather.weather[0].description) : "bg-default"}`}>

      {/* Navbar Section */}
      <nav className="navbar">
   <div className="logo">
        <img src="/weather-svgrepo-com.svg" alt="" className="app-logo" />
          <h1>WeatherApp</h1>

    </div> 

        {/* Desktop / Tablet Links */}
        <div className="navbar-links">
          <button onClick={() => document.getElementById("forecast-section")?.scrollIntoView({ behavior: "smooth" })}>
            Forecast
          </button>
          <button onClick={() => document.getElementById("hourly-section")?.scrollIntoView({ behavior: "smooth" })}>
            Hourly
          </button>
          <button onClick={() => document.getElementById("trend-section")?.scrollIntoView({ behavior: "smooth" })}>
            Temp Trend
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setShowNavMenu((prev) => !prev)}
        >
          ☰
        </button>

        {/* Mobile Dropdown Menu */}
        {showNavMenu && (
          <div className="navbar-dropdown">
            <p
              onClick={() => {
                document.getElementById("forecast-section")?.scrollIntoView({ behavior: "smooth" });
                setShowNavMenu(false);
              }}
            >
              Forecast
            </p>
            <p
              onClick={() => {
                document.getElementById("hourly-section")?.scrollIntoView({ behavior: "smooth" });
                setShowNavMenu(false);
              }}
            >
              Hourly
            </p>
            <p
              onClick={() => {
                document.getElementById("trend-section")?.scrollIntoView({ behavior: "smooth" });
                setShowNavMenu(false);
              }}
            >
              Temp Trend
            </p>

            {/* Recent Cities in Mobile Menu */}
            <div className="mobile-recent-cities">
              <p className="menu-section-title">Recent Cities:</p>
              {recent.length > 0 ? (
                recent.slice(0, 5).map((city, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      fetchWeatherByCity(city);
                      setShowNavMenu(false);
                    }}
                    className="recent-city-item"
                  >
                    {city}
                  </p>
                ))
              ) : (
                <p className="no-recent">No recent cities</p>
              )}
            </div>

            {/* Favorites in Mobile Menu */}
            <div className="mobile-favorites">
              <p className="menu-section-title">Favorites:</p>
              {favorites.length > 0 ? (
                favorites.map((fav, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      fetchWeatherByCity(fav);
                      setShowNavMenu(false);
                    }}
                    className="favorite-item"
                  >
                    {fav}
                  </p>
                ))
              ) : (
                <p className="no-favorites">No favorites yet</p>
              )}
            </div>
          </div>
        )}
      </nav>

{/* //////////////////hero section/////////////////////////////////////// */}


      <div className="hero-section">
        <div className="hero-controls-parent">
          <div className="search-toggle-container">
            <div className="search-unit-container">
              <div className="search-box" ref={searchBoxRef}>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchWeatherByCity()}
                  />
                  <button onClick={() => fetchWeatherByCity()}>
                    <FaSearch />
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <ul className="suggestions">
                    {suggestions.map((s, i) => (
                      <li key={i} onClick={() => fetchWeatherByCity(s.name)}>
                        {s.name}, {s.country}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="unit-toggle">
                <span className={`unit ${unit === 'metric' ? 'active' : ''}`} onClick={() => setUnit('metric')}>°C</span>
                <label className="switch">
                  <input type="checkbox" onChange={toggleUnit} checked={unit === 'imperial'} />
                  <span className="slider round"></span>
                </label>
                <span className={`unit ${unit === 'imperial' ? 'active' : ''}`} onClick={() => setUnit('imperial')}>°F</span>
              </div>
            </div>
          </div>

          <div className="recent-favorites-container">
            {recent.length > 0 && (
              <div className="recent-carousel">
                <button onClick={handlePrevRecent} disabled={recent.length <= 2}>
                  <FaChevronLeft />
                </button>

                <div className="recent-cities">
                  {recent.slice(recentIndex, recentIndex + 2).map((city, index) => (
                    <span
                      key={index}
                      onClick={() => fetchWeatherByCity(city)}
                      style={{ marginRight: "10px", cursor: "pointer" }}
                    >
                      {city}
                    </span>
                  ))}
                </div>

                <button onClick={handleNextRecent} disabled={recent.length <= 2}>
                  <FaChevronRight />
                </button>
              </div>
            )}


            <div className="favorites-dropdown" ref={favoritesDropdownRef}>
              <button onClick={() => setShowFavorites(!showFavorites)}>
                <FaStar /> Favorites <FaCaretDown />
              </button>
              {showFavorites && (
                <ul className="favorites-list">
                  {favorites.length > 0 ? favorites.map((fav) => (
                    <li key={fav} onClick={() => { fetchWeatherByCity(fav); setShowFavorites(false); }}>
                      {fav}
                    </li>
                  )) : <li>No favorites added</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {alerts.length > 0 && (
        <div className="weather-alerts">
          <h3>Severe Weather Alerts</h3>
          {alerts.map((alert, index) => (
            <div key={index} className="alert-card">
              <h4>{alert.event}</h4>
              <p><strong>Sender:</strong> {alert.sender_name}</p>
              <p>{alert.description}</p>
              <p><em>Starts: {new Date(alert.start * 1000).toLocaleString()}</em></p>
              <p><em>Ends: {new Date(alert.end * 1000).toLocaleString()}</em></p>
            </div>
          ))}
        </div>
      )}


{/* ?????????????????????????????/threeColumnLayout??????????????????????????? */}


      <ThreeColumnLayout
        weatherCard={
          weather && (

            <div className="weather-card">
              <div className="city-head">
                <div className="city-header">
                  <div className="city-info-left">
                    <h2 className="city-name" style={{ marginRight: '10px' }}>{weather.name}</h2>
                  </div>
                  <p className="time"> {getLocalTime(weather.timezone)}</p>
                </div>
              </div>
              <div className="temp-icon-row">
                {getWeatherIcon(weather.weather[0].description)}
                <p className="temp">{Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</p>
              </div>
              <p className="details">{weather.weather[0].description}</p>

              <div className="extra-info">
                <p>Feels like: {Math.round(weather.main.feels_like)}°</p>
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind: {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
                {weather.wind.deg !== undefined && <p>Direction: {getWindDirection(weather.wind.deg).text}</p>}
                {/* <p>Local Time: {getLocalTime(weather.timezone)}</p> */}
                {weather.sys && weather.sys.sunrise && <p>Sunrise: {formatUnixToLocalTime(weather.sys.sunrise, weather.timezone)}</p>}
                {weather.sys && weather.sys.sunset && <p>Sunset: {formatUnixToLocalTime(weather.sys.sunset, weather.timezone)}</p>}
                {aqi && <p>AQI: {aqi} ({getAqiDescription(aqi)})</p>}
                {uvIndex !== null && <p>UV Index: {uvIndex} ({getUvIndexDescription(uvIndex)})</p>}
              </div>
              <button className="fav-btn fav-btn-bottom" onClick={() => toggleFavorite(weather.name)}>
                {favorites.includes(weather.name) ? "❤️" : "🤍"}
              </button>
            </div>
          )
        }
        weatherRadar={
          <div className="weather-radar">
            {weather && weather.coord && (
              <WeatherMap
                lat={weather.coord.lat}
                lon={weather.coord.lon}
                apiKey={API_KEY}
                cityName={weather.name}
              />
            )}
          </div>
        }
        adCarousel={
          <div className="ad-carousel">
            <div className="ad-carousel-track">
              <div className="ad-carousel-item">Item 1</div>
              <div className="ad-carousel-item">Item 2</div>
              <div className="ad-carousel-item">Item 3</div>
              <div className="ad-carousel-item">Item 4</div>
              <div className="ad-carousel-item">Item 5</div>
              <div className="ad-carousel-item">Item 6</div>
              <div className="ad-carousel-item">Item 7</div>
              <div className="ad-carousel-item">Item 8</div>
              <div className="ad-carousel-item">Item 9</div>
              <div className="ad-carousel-item">Item 10</div>
            </div>
          </div>
        }
      />

      {hourlyForecast.length > 0 && (
        <div id="hourly-section" className="hourly-ad-section">
          <div className="hourly-carousel-wrapper">
            <h3>Next 24 Hours</h3>
            <div className="hourly-carousel-controls">
              <button onClick={handlePrevHourly}>
                <FaChevronLeft />
              </button>
              <div className="hourly-scroll-container">
                <div className="hourly-scroll" ref={hourlyScrollRef} style={{ transform: `translateX(${hourlyCarouselOffset}px)` }}>
                  {hourlyForecast.map((hour, idx) => (
                    <div key={idx} className="hour-card">
                      <p>{new Date(hour.dt_txt).getHours()}:00</p>
                      {getWeatherIcon(hour.weather[0].description)}
                      <p>{Math.round(hour.main.temp)}°</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleNextHourly}>
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="ad-container">
            <h4>Advertisement</h4>
            <p>Your ad content here!</p>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div id="forecast-section" className="forecast-grid">
          {forecast.map((day, idx) => (
            <div key={idx} className="forecast-card">
              <p>{new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
              {getWeatherIcon(day.weather[0].description)}
              <p className="temp">{Math.round(day.main.temp)}°</p>
              <p className="details">{day.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}

      {forecast.length > 0 && (
        <div id="trend-section" className="chart-section">
          <h3>5-Day Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecast.map(d => ({ ...d, temp: d.main.temp }))}>
              <XAxis dataKey="dt_txt" tickFormatter={(str) => new Date(str).toLocaleDateString("en-US", { weekday: 'short' })} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#1E90FF" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;