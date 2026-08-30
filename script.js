// IMPORTANT: Get your free API key from https://openweathermap.org/api
const API_KEY = "6fd8eb01edc88ee0e1617329f478dd28";


const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');

// Click and Enter key both work
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if(!city) {
    alert("Please enter a city name");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if(data.cod === 200) {
      // Update UI with weather data
	  const time = new Date(data.dt * 1000).toLocaleTimeString();
	  console.log("Weather data time: ", time);
	  document.getElementById('lastUpdated').textContent = "Last updated: " + time;
      document.getElementById('cityName').textContent = data.name + ", " + data.sys.country;
      document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
      document.getElementById('description').textContent = data.weather[0].description;
      document.getElementById('wind').textContent = Math.round(data.wind.speed);
      document.getElementById('humidity').textContent = data.main.humidity;

      document.getElementById('weatherInfo').style.display = 'block';
      document.getElementById('error').style.display = 'none';
    } else {
      // Show error
      document.getElementById('error').textContent = "City not found 😅";
      document.getElementById('error').style.display = 'block';
      document.getElementById('weatherInfo').style.display = 'none';
    }
  } catch(err) {
    document.getElementById('error').textContent = "Network error. Check your internet.";
    document.getElementById('error').style.display = 'block';
  }
}

// Load Bangalore weather on start
window.onload = () => {
  cityInput.value = "Bangalore";
  getWeather();
}