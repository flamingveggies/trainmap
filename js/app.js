var map = L.map('map').fitBounds([
    [45.6077682, -122.9945375],
    [45.4289472, -122.4139835]
]);


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'flamingveggies.obib22pe',
    accessToken: 'pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ'
}).addTo(map);

var markers = {};
var trainMarkers = new L.LayerGroup().addTo(map);
var busMarkers = new L.LayerGroup().addTo(map);

var overlays = {
  "Trains": trainMarkers,
  "Busses": busMarkers
};

L.control.layers(null, overlays).addTo(map);

function parseDelay(seconds) {
  var absSeconds = Math.abs(seconds);
  var min = Math.floor(absSeconds / 60);
  var sec = absSeconds % 60;
  if (min === 0) {
    return sec + " sec";
  } else {
    return min + " min " + sec + " sec";
  }
}

function getVehicles(url) {
  $.getJSON(url, function(data) {
    trainMarkers.clearLayers();
    busMarkers.clearLayers();
    $.each(data.resultSet.vehicle, function(i, vehicle) {
      var vehicleRoute;
      var delayMessage;
      if (vehicle.routeNumber === 90) {
        vehicleRoute = "red";
      } else if (vehicle.routeNumber === 100) {
        vehicleRoute = "blue";
      } else if (vehicle.routeNumber === 190) {
        vehicleRoute = "yellow";
      } else if (vehicle.routeNumber === 200) {
        vehicleRoute = "green";
      } else if (vehicle.routeNumber === 290) {
        vehicleRoute = "orange";
      }
      if (vehicle.delay < 0) {
        delayMessage = parseDelay(vehicle.delay) + " late";
      } else if (vehicle.delay > 0) {
        delayMessage = parseDelay(vehicle.delay) + " early";
      } else {
        delayMessage = "On time";
      }
      markers[vehicle.vehicleID] = L.circle([vehicle.latitude, vehicle.longitude], 100, {
        color: vehicleRoute,
        fillOpacity: 0.5
      })
      .bindPopup("<b>" + vehicle.signMessageLong + "</b><br>" + delayMessage + "<br>Route: " + vehicle.routeNumber + "<br>Vehicle: " + vehicle.vehicleID);
      if (vehicle.type === "rail") {
        markers[vehicle.vehicleID].addTo(trainMarkers);
      } else if (vehicle.type === "bus") {
        markers[vehicle.vehicleID].addTo(busMarkers);
      }
    });
  });
}

function refreshVehicles() {

  $.getJSON("https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9", function(data) {
    
    for(var key in markers) {
      var exists = false;
      for(var vehicle in data.resultSet.vehicle) {
        if (data.resultSet.vehicle[vehicle].vehicleID == key) {
          exists = true;
          var delayMessage;
          if (data.resultSet.vehicle[vehicle].delay < 0) {
            delayMessage = parseDelay(data.resultSet.vehicle[vehicle].delay) + " late";
          } else if (data.resultSet.vehicle[vehicle].delay > 0) {
            delayMessage = parseDelay(data.resultSet.vehicle[vehicle].delay) + " early";
          } else {
            delayMessage = "On time";
          }
          if (data.resultSet.vehicle[vehicle].type === "rail") {
            var vehicleRoute;
            if (data.resultSet.vehicle[vehicle].routeNumber === 90) {
              vehicleRoute = "red";
            } else if (data.resultSet.vehicle[vehicle].routeNumber === 100) {
              vehicleRoute = "blue";
            } else if (data.resultSet.vehicle[vehicle].routeNumber === 190) {
              vehicleRoute = "yellow";
            } else if (data.resultSet.vehicle[vehicle].routeNumber === 200) {
              vehicleRoute = "green";
            } else if (data.resultSet.vehicle[vehicle].routeNumber === 290) {
              vehicleRoute = "orange";
            }
            markers[key].setStyle({
              color: vehicleRoute
            });
          }
          markers[key].setLatLng([data.resultSet.vehicle[vehicle].latitude,data.resultSet.vehicle[vehicle].longitude]);
          markers[key].setPopupContent("<b>" + data.resultSet.vehicle[vehicle].signMessageLong + "</b><br>" + delayMessage + "<br>Route: " + data.resultSet.vehicle[vehicle].routeNumber + "<br>Vehicle: " + data.resultSet.vehicle[vehicle].vehicleID);
          data.resultSet.vehicle.splice(vehicle, 1);
        }
      }
      if (exists == false) {
        console.log(markers[key]);
        markers[key].remove();
        delete markers[key];
      }
    }
  
    console.log(data.resultSet.vehicle);

    $.each(data.resultSet.vehicle, function(i, vehicle) {
      var vehicleRoute;
      var delayMessage;
      if (vehicle.routeNumber === 90) {
        vehicleRoute = "red";
      } else if (vehicle.routeNumber === 100) {
        vehicleRoute = "blue";
      } else if (vehicle.routeNumber === 190) {
        vehicleRoute = "yellow";
      } else if (vehicle.routeNumber === 200) {
        vehicleRoute = "green";
      } else if (vehicle.routeNumber === 290) {
        vehicleRoute = "orange";
      }
      if (vehicle.delay < 0) {
        delayMessage = parseDelay(vehicle.delay) + " late";
      } else if (vehicle.delay > 0) {
        delayMessage = parseDelay(vehicle.delay) + " early";
      } else {
        delayMessage = "On time";
      }
      markers[vehicle.vehicleID] = L.circle([vehicle.latitude, vehicle.longitude], 100, {
        color: vehicleRoute,
        fillOpacity: 0.5
      })
      .bindPopup("<b>" + vehicle.signMessageLong + "</b><br>" + delayMessage + "<br>Route: " + vehicle.routeNumber + "<br>Vehicle: " + vehicle.vehicleID);
      if (vehicle.type === "rail") {
        markers[vehicle.vehicleID].addTo(trainMarkers);
      } else if (vehicle.type === "bus") {
        markers[vehicle.vehicleID].addTo(busMarkers);
      }
    });
  });

}

getVehicles("https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9");
setInterval(refreshVehicles, 30000);