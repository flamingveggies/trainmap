var map;
var markers;
var trainMarkers;
var busMarkers;
var routeShapes;
var currentRouteShape;
var refreshInterval;

var trimetURL = "https://developer.trimet.org/ws/v2/vehicles?appID=D065A3A5DAE4622752786CEB9";

function initialize() {
  // Initialize map, set up tiles/controls/layer groups, fetch geoJSON route object

  map = L.map('map').fitBounds([
    [45.6077682, -122.9945375],
    [45.4289472, -122.4139835]
  ]);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ', {
    attribution: 'Built by <a href="http://merrittlawrenson.com">Merritt Lawrenson</a>, Transit Data &copy; <a href="https://trimet.org">TriMet</a>, Map Data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'flamingveggies.obib22pe',
    accessToken: 'pk.eyJ1IjoiZmxhbWluZ3ZlZ2dpZXMiLCJhIjoiY2lodGd4dDJzMDE5ZXUxbTF5czU1a3BxeCJ9.iqB50rVPS3yINubr2h1mbQ'
  }).addTo(map);

  L.control.locate({
    flyTo: true,
    showPopup: false,
    locateOptions: {enableHighAccuracy: true, maxZoom: 15},
    strings: {title: "Find current location", outsideMapBoundsMsg: "TriMet does not serve this location"}
  }).addTo(map);

  L.easyButton('fa-refresh', function(btn, map) {
    resetRefreshInterval();
    refresh();
  }).addTo(map);

  markers = {};
  trainMarkers = new L.LayerGroup().addTo(map);
  busMarkers = new L.LayerGroup().addTo(map);

  var overlays = {
    "Trains": trainMarkers,
    "Busses": busMarkers
  };

  L.control.layers(null, overlays).addTo(map);

  $.getJSON("./assets/tm_routes50.json", function(data) {
    routeShapes = data;
  });

}

function delayMessage(vehicle) {
  // Create delay message string for map marker popups

  if (vehicle.signMessageLong === null || vehicle.signMessageLong === "Inactive/Off-Route") {
    return "";
  } else if (vehicle.delay < 0) {
    return parseDelay(vehicle.delay) + " late";
  } else if (vehicle.delay > 0) {
    return parseDelay(vehicle.delay) + " early";
  } else {
    return "On time";
  }

}

function parseDelay(seconds) {
  // Parse seconds into min/sec string for delay message

  var absSeconds = Math.abs(seconds);
  var min = Math.floor(absSeconds / 60);
  var sec = absSeconds % 60;
  if (min === 0) {
    return sec + " sec";
  } else {
    return min + " min " + sec + " sec";
  }

}

function parseColor(vehicle) {
  // Parse route number into color for train markers

  if (vehicle.routeNumber === 90) {
    return "red";
  } else if (vehicle.routeNumber === 100) {
    return "blue";
  } else if (vehicle.routeNumber === 190) {
    return "yellow";
  } else if (vehicle.routeNumber === 200) {
    return "green";
  } else if (vehicle.routeNumber === 290) {
    return "orange";
  } else {
    return "";
  }

}

function addVehicle(vehicle) {
  // Add current vehicle to map
  
  // Configure circle markers, configure popups, add to layer groups

  if (vehicle.signMessageLong === null) {
    vehicle.signMessageLong = "Inactive/Off-Route";
  }
  markers[vehicle.vehicleID] = L.circle([vehicle.latitude, vehicle.longitude], 100, {
    color: parseColor(vehicle),
    fillOpacity: 0.5
  })
  .bindPopup("<b>" + vehicle.signMessageLong + "</b><br>" + delayMessage(vehicle) + "<br>Route: " + vehicle.routeNumber + "<br>Vehicle: " + vehicle.vehicleID);
  if (vehicle.type === "rail") {
    markers[vehicle.vehicleID].addTo(trainMarkers);
  } else if (vehicle.type === "bus") {
    markers[vehicle.vehicleID].addTo(busMarkers);
  }

  // Save direction and route number to marker object

  markers[vehicle.vehicleID].direction = vehicle.direction;
  markers[vehicle.vehicleID].routeNumber = vehicle.routeNumber;

  // Set listeners to show/hide route path with marker

  markers[vehicle.vehicleID].on("popupopen", function() {
    currentRouteShape = L.geoJSON(routeShapes, {
      style: function (feature) {
        return {color: "black", opacity: 0.5};
      },
      filter: function (routeShape) {
        return markers[vehicle.vehicleID].routeNumber == routeShape.properties.rte && markers[vehicle.vehicleID].direction == routeShape.properties.dir;
      }
    }).addTo(map);   
  });

  markers[vehicle.vehicleID].on("popupclose", function() {
    currentRouteShape.remove();
  });
  
}

function refreshVehicle () {
  // Comparison function goes here

}

function getVehicles() {
  // Get vehicle lit from TriMet API, add vehicles to map

  $.getJSON(trimetURL, function(data) {
    data.resultSet.vehicle.forEach(addVehicle);
  });

}

function refresh() {
  // Refresh markers
  // Find updated results, match with existing markers, delete marker if no new match, add marker for any new results

  $.getJSON(trimetURL, function(data) {
    for(var key in markers) {
      var exists = false;
      for(var vehicle in data.resultSet.vehicle) {
        if (data.resultSet.vehicle[vehicle].vehicleID == key) {
          exists = true;
          markers[key].setStyle({
            color: parseColor(data.resultSet.vehicle[vehicle])
          });
          if (data.resultSet.vehicle[vehicle].signMessageLong === null) {
            data.resultSet.vehicle[vehicle].signMessageLong = "Inactive/Off-Route";
          }
          markers[key].setLatLng([data.resultSet.vehicle[vehicle].latitude,data.resultSet.vehicle[vehicle].longitude]);
          markers[key].setPopupContent("<b>" + data.resultSet.vehicle[vehicle].signMessageLong + "</b><br>" + delayMessage(data.resultSet.vehicle[vehicle]) + "<br>Route: " + data.resultSet.vehicle[vehicle].routeNumber + "<br>Vehicle: " + data.resultSet.vehicle[vehicle].vehicleID);
          markers[key].direction = data.resultSet.vehicle[vehicle].direction;
          markers[key].routeNumber = data.resultSet.vehicle[vehicle].routeNumber;
          data.resultSet.vehicle.splice(vehicle, 1);
          break;
        }
      }
      if (exists == false) {
        console.log(markers[key]);
        markers[key].remove();
        delete markers[key];
      }
    }
  
    console.log(data.resultSet.vehicle);
    console.log(Date());

    data.resultSet.vehicle.forEach(addVehicle);
  });

}

function resetRefreshInterval() {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(refresh, 30000);
}

initialize();
getVehicles();
resetRefreshInterval();