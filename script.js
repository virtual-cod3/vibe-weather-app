// ==========================================
// VIBE WEATHER
// ==========================================

// ==========================================
// API KEY
// ==========================================

// Put your NEW OpenWeather API key here.
// Do NOT upload the real key to GitHub.

const API_KEY = "2d9f6dc7862708dac0793650b5e6adf4";

// ==========================================
// API URLS
// ==========================================

const WEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

// ==========================================
// DOM ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const refreshBtn = document.getElementById("refreshBtn");
const themeBtn = document.getElementById("themeBtn");

const weatherInfo = document.getElementById("weatherInfo");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

// ==========================================
// CURRENT CITY
// ==========================================

let currentCity = "";

// ==========================================
// EVENTS
// ==========================================

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchCity();
    }
});

locationBtn.addEventListener("click", getCurrentLocation);

refreshBtn.addEventListener("click", function () {
    if (currentCity) {
        getWeather(currentCity);
    } else {
        showError("Search for a city first.");
    }
});

themeBtn.addEventListener("click", toggleTheme);

// ==========================================
// SEARCH CITY
// ==========================================

function searchCity() {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);
}

// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(city) {

    if (
        !API_KEY ||
        API_KEY === "YOUR_NEW_API_KEY_HERE"
    ) {
        showError("Please add your OpenWeather API key in script.js.");
        return;
    }

    showLoading();

    try {

        // ------------------------------------------
        // CURRENT WEATHER
        // ------------------------------------------

        const weatherUrl =
            WEATHER_API +
            "?q=" +
            encodeURIComponent(city) +
            "&appid=" +
            API_KEY +
            "&units=metric";

        const weatherResponse = await fetch(weatherUrl);

        const weatherData = await weatherResponse.json();

        console.log("Weather:", weatherData);

        if (!weatherResponse.ok) {
            throw new Error(
                weatherData.message || "Weather request failed"
            );
        }

        // ------------------------------------------
        // FORECAST
        // ------------------------------------------

        const forecastUrl =
            FORECAST_API +
            "?q=" +
            encodeURIComponent(city) +
            "&appid=" +
            API_KEY +
            "&units=metric";

        const forecastResponse = await fetch(forecastUrl);

        const forecastData = await forecastResponse.json();

        console.log("Forecast:", forecastData);

        if (!forecastResponse.ok) {
            throw new Error(
                forecastData.message || "Forecast request failed"
            );
        }

        // ------------------------------------------
        // SAVE CITY
        // ------------------------------------------

        currentCity = weatherData.name;

        cityInput.value = weatherData.name;

        // ------------------------------------------
        // UPDATE PAGE
        // ------------------------------------------

        updateWeather(weatherData);

        updateForecast(forecastData);

        updateBackground(weatherData);

        hideLoading();

    } catch (err) {

        console.error("Weather Error:", err);

        hideLoading();

        showError(
            "Unable to get weather. Check your city name or API key."
        );
    }
}

// ==========================================
// UPDATE CURRENT WEATHER
// ==========================================

function updateWeather(data) {

    document.getElementById("cityName").textContent =
        data.name + ", " + data.sys.country;

    document.getElementById("dateTime").textContent =
        getDateTime(data.dt);

    document.getElementById("temperature").textContent =
        Math.round(data.main.temp) + "°C";

    document.getElementById("feelsLike").textContent =
        Math.round(data.main.feels_like) + "°C";

    document.getElementById("description").textContent =
        data.weather[0].description;

    // Weather icon
    const icon = data.weather[0].icon;

    document.getElementById("weatherIcon").src =
        "https://openweathermap.org/img/wn/" +
        icon +
        "@2x.png";

    // Humidity
    document.getElementById("humidity").textContent =
        data.main.humidity + "%";

    // Wind speed
    const windSpeed =
        Math.round(data.wind.speed * 3.6);

    document.getElementById("wind").textContent =
        windSpeed + " km/h";

    // Wind direction
    document.getElementById("windDirection").textContent =
        getWindDirection(data.wind.deg);

    // Pressure
    document.getElementById("pressure").textContent =
        data.main.pressure + " hPa";

    // Visibility
    const visibility =
        data.visibility
            ? (data.visibility / 1000).toFixed(1)
            : "--";

    document.getElementById("visibility").textContent =
        visibility + " km";

    // Clouds
    document.getElementById("clouds").textContent =
        data.clouds.all + "%";

    // Sunrise
    document.getElementById("sunrise").textContent =
        formatTime(data.sys.sunrise);

    // Sunset
    document.getElementById("sunset").textContent =
        formatTime(data.sys.sunset);

    // Last updated
    document.getElementById("lastUpdated").textContent =
        "Last updated: " + formatTime(data.dt);

    weatherInfo.style.display = "block";

    error.style.display = "none";
}

// ==========================================
// 5 DAY FORECAST
// ==========================================

function updateForecast(data) {

    const forecastContainer =
        document.getElementById("forecast");

    forecastContainer.innerHTML = "";

    const dailyForecast = {};

    data.list.forEach(function (item) {

        const date =
            new Date(item.dt * 1000);

        const dateKey =
            date.toLocaleDateString("en-US");

        const hour =
            date.getHours();

        if (
            !dailyForecast[dateKey] ||
            Math.abs(hour - 12) <
            Math.abs(
                new Date(
                    dailyForecast[dateKey].dt * 1000
                ).getHours() - 12
            )
        ) {
            dailyForecast[dateKey] = item;
        }
    });

    const days =
        Object.values(dailyForecast).slice(0, 5);

    days.forEach(function (item) {

        const date =
            new Date(item.dt * 1000);

        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        const icon =
            item.weather[0].icon;

        const temperature =
            Math.round(item.main.temp);

        const description =
            item.weather[0].description;

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML =
            '<div class="forecast-day">' +
                day +
            '</div>' +

            '<img ' +
                'class="forecast-icon" ' +
                'src="https://openweathermap.org/img/wn/' +
                icon +
                '@2x.png" ' +
                'alt="' +
                description +
            '">' +

            '<div class="forecast-temp">' +
                temperature +
                "°C" +
            '</div>' +

            '<div class="forecast-description">' +
                description +
            '</div>';

        forecastContainer.appendChild(card);
    });
}

// ==========================================
// WIND DIRECTION
// ==========================================

function getWindDirection(degrees) {

    if (
        degrees === undefined ||
        degrees === null
    ) {
        return "--";
    }

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index =
        Math.round(degrees / 45) % 8;

    return directions[index];
}

// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(timestamp) {

    const date =
        new Date(timestamp * 1000);

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// ==========================================
// DATE
// ==========================================

function getDateTime(timestamp) {

    const date =
        new Date(timestamp * 1000);

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "short",
            day: "numeric"
        }
    );
}

// ==========================================
// DYNAMIC BACKGROUND
// ==========================================

function updateBackground(data) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "stormy",
        "snowy",
        "night"
    );

    const weatherId =
        data.weather[0].id;

    const icon =
        data.weather[0].icon;

    // Night
    if (icon.endsWith("n")) {

        document.body.classList.add("night");

        return;
    }

    // Thunderstorm
    if (
        weatherId >= 200 &&
        weatherId < 300
    ) {

        document.body.classList.add("stormy");

        return;
    }

    // Rain
    if (
        weatherId >= 300 &&
        weatherId < 600
    ) {

        document.body.classList.add("rainy");

        return;
    }

    // Snow
    if (
        weatherId >= 600 &&
        weatherId < 700
    ) {

        document.body.classList.add("snowy");

        return;
    }

    // Clouds
    if (
        weatherId >= 801 &&
        weatherId <= 804
    ) {

        document.body.classList.add("cloudy");

        return;
    }

    // Clear
    document.body.classList.add("sunny");
}

// ==========================================
// CURRENT LOCATION
// ==========================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Location is not supported by your browser."
        );

        return;
    }

    if (
        !API_KEY ||
        API_KEY === "YOUR_NEW_API_KEY_HERE"
    ) {

        showError(
            "Please add your OpenWeather API key first."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            console.log("Latitude:", latitude);

            console.log("Longitude:", longitude);

            try {

                // Current weather
                const weatherUrl =
                    WEATHER_API +
                    "?lat=" +
                    latitude +
                    "&lon=" +
                    longitude +
                    "&appid=" +
                    API_KEY +
                    "&units=metric";

                const response =
                    await fetch(weatherUrl);

                const data =
                    await response.json();

                console.log(
                    "Location Weather:",
                    data
                );

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Location weather unavailable"
                    );
                }

                // Forecast
                const forecastUrl =
                    FORECAST_API +
                    "?lat=" +
                    latitude +
                    "&lon=" +
                    longitude +
                    "&appid=" +
                    API_KEY +
                    "&units=metric";

                const forecastResponse =
                    await fetch(forecastUrl);

                const forecastData =
                    await forecastResponse.json();

                if (!forecastResponse.ok) {

                    throw new Error(
                        forecastData.message ||
                        "Forecast unavailable"
                    );
                }

                currentCity =
                    data.name;

                cityInput.value =
                    data.name;

                updateWeather(data);

                updateForecast(forecastData);

                updateBackground(data);

                hideLoading();

            } catch (err) {

                console.error(
                    "Location Weather Error:",
                    err
                );

                hideLoading();

                showError(
                    "Unable to get weather for your location."
                );
            }
        },

        function (error) {

            hideLoading();

            console.error(
                "Location Error:",
                error
            );

            if (error.code === 1) {

                showError(
                    "Location permission denied. Please allow location access."
                );

            } else if (error.code === 2) {

                showError(
                    "Your location could not be determined."
                );

            } else if (error.code === 3) {

                showError(
                    "Location request timed out. Try again."
                );

            } else {

                showError(
                    "Unable to get your location."
                );
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ==========================================
// THEME
// ==========================================

function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    const dark =
        document.body.classList.contains("dark-mode");

    themeBtn.textContent =
        dark ? "☀️" : "🌙";

    localStorage.setItem(
        "vibeTheme",
        dark ? "dark" : "light"
    );
}

// ==========================================
// LOAD THEME
// ==========================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("vibeTheme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        themeBtn.textContent = "☀️";
    }
}

// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loading.style.display = "block";

    weatherInfo.style.display = "none";

    error.style.display = "none";
}

function hideLoading() {

    loading.style.display = "none";
}

// ==========================================
// ERROR
// ==========================================

function showError(message) {

    loading.style.display = "none";

    weatherInfo.style.display = "none";

    error.textContent = message;

    error.style.display = "block";
}

// ==========================================
// START APP
// ==========================================

window.addEventListener("load", function () {

    loadTheme();

    // No default city
    cityInput.value = "";

});