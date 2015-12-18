var map = L.map('map').setView([45.5200, -122.6189], 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'flamingveggies.obib22pe',
    accessToken: 'pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ'
}).addTo(map);

function getTrains() {
  console.log("Boom! Trains!");
  $.getJSON("https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9&routes=90,100,190,200,290", function(data) {
    $.each(data.resultSet.vehicle, function(i, train) {
      var trainRoute
      var delayMessage
      if (train.routeNumber === 90) {
        trainRoute = "red";
      } else if (train.routeNumber === 100) {
        trainRoute = "blue";
      } else if (train.routeNumber === 190) {
        trainRoute = "yellow";
      } else if (train.routeNumber === 200) {
        trainRoute = "green";
      } else if (train.routeNumber === 290) {
        trainRoute = "orange";
      }
      if (train.delay < 0) {
        delayMessage = "late by " + Math.abs(train.delay) + " seconds!";
      } else if (train.delay > 0) {
        delayMessage = "early by " + train.delay + " seconds!";
      } else {
        delayMessage = "on time!"
      }
      var circle = L.circle([train.latitude, train.longitude], 100, {
        color: trainRoute,
        // fillColor: '#f03',
        fillOpacity: 0.5
      })
      .addTo(map)
      .bindPopup("This train is " + trainRoute + " and its bearing is " + train.bearing + "! It's " + delayMessage);
    });
  });
};

getTrains();
setInterval(getTrains, 15000);

// https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9&routes=90,100,190,200,290

// 90  = red
// 100 = blue
// 190 = yellow
// 200 = green
// 290 = orange