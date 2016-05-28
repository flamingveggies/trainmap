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

L.control.locate().addTo(map);

var trainMarkers, busMarkers, overlays;
var routeList = [];

function initialize() {
  trainMarkers = new L.LayerGroup().addTo(map);
  busMarkers = new L.LayerGroup().addTo(map);
  
  overlays = {
    "Trains": trainMarkers,
    "Busses": busMarkers
  };
  
  L.control.layers(null, overlays).addTo(map);
  
  $.getJSON("https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9", function(data) {
    $.each(data.resultSet.vehicle, function(vehicle) {
      routeList.push(this.routeNumber);
    });
    routeList = uniq(routeList);
    routeList = routeList.sort(function (a, b) {  return a - b;  });
    console.log(routeList);
  });
  
  $.each(routeList, function(route) {
    overlays.push({ route : new L.LayerGroup().addTo(map) })
  })
}

// remove duplicate numbers
function uniq(a) {
  var seen = {};
  return a.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

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
    parseVehicles(data);
  });
}

function parseVehicles(data) {
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
      var marker = L.circle([vehicle.latitude, vehicle.longitude], 100, {
        color: vehicleRoute,
        fillOpacity: 0.5
      })
      .bindPopup("<b>" + vehicle.signMessageLong + "</b><br>" + delayMessage);
      if (vehicle.type === "rail") {
        marker.addTo(trainMarkers);
      } else if (vehicle.type === "bus") {
        marker.addTo(busMarkers);
      }
      // var marker = L.marker([vehicle.latitude, vehicle.longitude], {
      //   color: vehicleRoute,
      //   title: vehicle.signMessage,
      //   opacity: 0.5
      // })
      // .addTo(trainMarkers)
      // .bindPopup("<b>" + vehicle.signMessageLong + "</b><br>" + delayMessage);
    });
}

function refreshVehicles() {
  console.log(".");
  var trimetURL;
  if (map.hasLayer(trainMarkers) === true && map.hasLayer(busMarkers) === true) {
    trimetURL = "https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9";
  } else if (map.hasLayer(trainMarkers) === true) {
    trimetURL = "https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9&routes=90,100,190,200,290";
  } else if (map.hasLayer(busMarkers) === true) {
    trimetURL = "https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9";
  } else {
    return;
  }
  getVehicles(trimetURL);
}


initialize();
refreshVehicles();
setInterval(refreshVehicles, 30000);