let pos;
let map;
let service;
let bounds;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.7487496, lng: 12.6352825 },
    zoom: 14
  });

/* TODO: Step 3B1, Call the Places Nearby Search */
// Perform a Places Nearby Search Request
function getNearbyPlaces(position) {
  let pos =  new google.maps.LatLng(position);
  console.log(position);
  let request = {
    location: pos,
    radius:10000,
    type: 'lodging'
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  createMarkers(results);
  }
}

getNearbyPlaces({ lat: 41.7487496, lng: 12.6352825 })

function createMarkers(places) {
  places.forEach(place => {
  let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name
  });

  /* TODO: Step 4B: Add click listeners to the markers */

  });

  }
}
window.initMap = initMap;