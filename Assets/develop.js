/*
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
*/

// Get date
var today = moment().format("MM-DD-YYYY");

// Add history basket
var searchHistory = [];

// function for current weather condition
function currentWeather(city) {

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=f885eb5bc5def9b9dd9868e8e9a359ad`,
        method: "GET"
    }).then(function(weatherInfo) {
        
        $("#weatherInfo").css("display", "inline");

        // Clear out data
        $("#cityInfo").empty();
        

        // Icon representation of weather conditions
        var iconCode = weatherInfo.weather[0].icon;
        var iconLink = `https://openweathermap.org/img/w/${iconCode}.png`;

        // WHEN I view current weather conditions for that city
        // THEN I am presented with the city name
        // the date
        
        // the temperature
        // the humidity
        // the wind speed
        var currentCity = $(`
            <h2 id="currentCity">
                ${weatherInfo.name} ${today} <img src="${iconLink}" alt="${weatherInfo.weather[0].description}" />
            </h2>
            <p>Temperature: Lo ${weatherInfo.main.temp_min} °F / Hi ${weatherInfo.main.temp_max} °F</p>
            <p>Humidity: ${weatherInfo.main.humidity}\%</p>
            <p>Wind Speed: ${weatherInfo.wind.speed} MPH</p>
        `);

        $("#cityInfo").append(currentCity);

        // UV index
        var lat = weatherInfo.coord.lat;
        var lon = weatherInfo.coord.lon;

        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=f885eb5bc5def9b9dd9868e8e9a359ad`,
            method: "GET"
        }).then(function(uvInfo) {

            var uvIndexValue = uvInfo.value;
            var uvIndexContent = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndexValue}</span>
                </p>
            `);

            $("#cityInfo").append(uvIndexContent);

            futureWeather(lat, lon);

            // WHEN I view the UV index
            // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
            if (uvIndexValue >= 1 && uvIndexValue <= 2) {
                $("#uvIndexColor").css("background-color", "green").css("color", "white").after(" Low");
            } else if (uvIndexValue >= 3 && uvIndexValue <= 5) {
                $("#uvIndexColor").css("background-color", "yellow").after(" Moderate");
            } else if (uvIndexValue >= 6 && uvIndexValue <= 7) {
                $("#uvIndexColor").css("background-color", "orange").after(" High");
            } else if (uvIndexValue >= 8 && uvIndexValue <= 10) {
                $("#uvIndexColor").css("background-color", "red").css("color", "white").after(" Very high");
            } else {
                $("#uvIndexColor").css("background-color", "purple").css("color", "white").after(" Extreme"); 
            };  
        });
    });
}

// function for future condition
function futureWeather(lat, lon) {

    // THEN I am presented with a 5-day forecast
    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=f885eb5bc5def9b9dd9868e8e9a359ad`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function(futureResponse) {

        // Clear out data
        $("#futureForecast").empty();
        
        // For loop function for 5 day forecast
        for (var i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                humidity: futureResponse.daily[i].humidity
            };

            var currentDate = moment.unix(cityInfo.date).format("MM-DD-YYYY");
            var iconLink = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            var futureContent = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 px-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <p>${iconLink}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#futureForecast").append(futureContent);
        }
    }); 
}

// Search button event listener
$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentWeather(city);
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchedCity = $(`
            <li class="list-group-item">${city}</li>
            `);
        $("#searchList").append(searchedCity);
    };
    
    localStorage.setItem("city", JSON.stringify(searchHistory));
});

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast

