const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const result = document.getElementById('result');
const cityNameEl = document.getElementById('cityName');
const tempEl = document.getElementById('temp');
const condEl = document.getElementById('condition');
const timeEl = document.getElementById('time');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  errorEl.classList.add('hidden');
  result.classList.add('hidden');
  cityNameEl.textContent = 'Loading...';

  try {
    // 1) Geocoding - get lat/lon from city name (Open-Meteo geocoding)
    const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    if (!geoResp.ok) throw new Error('Geocoding failed');
    const geoData = await geoResp.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }
    const place = geoData.results[0];
    const { latitude, longitude, name, country } = place;

    // 2) Weather - get current weather
    const weatherResp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    if (!weatherResp.ok) throw new Error('Weather fetch failed');
    const weatherData = await weatherResp.json();
    const current = weatherData.current_weather;
    if (!current) throw new Error('No current weather data');

    // Build UI
    cityNameEl.textContent = `${name}, ${country}`;
    tempEl.textContent = `${current.temperature} °C`;
    condEl.textContent = `Wind: ${current.windspeed} m/s, Wind dir: ${current.winddirection}°`;
    const dt = new Date(current.time);
    timeEl.textContent = `As of: ${dt.toLocaleString()}`;

    result.classList.remove('hidden');

  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong';
    errorEl.classList.remove('hidden');
    cityNameEl.textContent = '';
  }
});
