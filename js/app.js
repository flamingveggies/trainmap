var map = L.map('map').setView([45.5200, -122.6189], 11);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'flamingveggies.obib22pe',
    accessToken: 'pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ'
}).addTo(map);

function getTrains() {
  // map.clearLayers();
  $.getJSON("https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9&routes=90,100,190,200,290", function(data) {
    $.each(data.resultSet.vehicle, function(i, train) {
      console.log(train.latitude + " , " + train.longitude);
      var trainRoute
      console.log(train.routeNumber);
      if (train.routeNumber === 90) {
        trainRoute = "red";
        console.log(trainRoute);
      } else if (train.routeNumber === 100) {
        trainRoute = "blue";
        console.log(trainRoute);
      } else if (train.routeNumber === 190) {
        trainRoute = "yellow";
        console.log(trainRoute);
      } else if (train.routeNumber === 200) {
        trainRoute = "green";
        console.log(trainRoute);
      } else if (train.routeNumber === 290) {
        trainRoute = "orange";
        console.log(trainRoute);
      }
      var circle = L.circle([train.latitude, train.longitude], 100, {
        color: trainRoute,
        // fillColor: '#f03',
        fillOpacity: 0.5
      }).addTo(map);
    });
  });
};

// setInterval({getTrains();}, 15000);
getTrains();



// https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9&routes=90,100,190,200,290

// 90  = red
// 100 = blue
// 190 = yellow
// 200 = green
// 290 = orange