//var fs = require('fs');
let map;
let service;
let currentInfoWindow;
var selection;
var position={lat:"",lng:"",zoom:""};
var borghi=[
  {  nome:"Castel Gandolfo",
      lat:"41.7487496",
      long:"12.6353254",
      zoom:"14"
  },
  {   nome:"Bard",
      lat:"45.6099622",
      long:"7.7412505",
      zoom:"16"
  },
  {   nome:"Orta San Giulio",
      lat:"45.7964467",
      long:"8.405217",
      zoom:"15"
  },
  {   nome:"Vogogna",
      lat:"46.0178943",
      long:"8.2686205",
      zoom:"14"
  }];
/*fetch("../borghi.json")
.then(response => {
   return response.json();
})
.then(jsondata => {borghi=jsondata;});
*/
function update_position(){
  selection=document.getElementById('borgo').value;
  borghi.forEach(borgo =>{
    if(borgo.nome==selection){
      position.lat=borgo.lat;
      position.lng=borgo.long;
      position.zoom=borgo.zoom;
      try{
        map.center= new google.maps.LatLng(parseInt(position.lat),parseInt(position.lng));
        map.zoom=position.zoom;
      }
      catch (error) {
        console.log(error);
      }
    }
  });
}

async function initMap() {
  
  var infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  update_position();
  console.log(position);
  map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: parseInt(position.lat), lng: parseInt(position.lng) },
      zoom: parseInt(position.zoom)
    });
  
    


  // Perform a Places Nearby Search Request
  function getNearbyPlaces() {
    let pos =  new google.maps.LatLng(position.lat,position.lng);
    
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

  getNearbyPlaces()

  function createMarkers(places) {
    places.forEach(place => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
      });
      google.maps.event.addListener(marker, 'click', () => {
        let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating','website', 'photos']
        };
        /* Only fetch the details of a place when the user clicks on a marker.
        * If we fetch the details for all place results as soon as we get
        * the search response, we will hit API rate limits. */
        service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status);
        });
      });
    });

  }

  function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
        '</strong><br>' + 'Rating: ' + placeResult.rating + '</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    showPanel(placeResult);
    } else {
    console.log('showDetails failed: ' + status);
    }
  }

  function showPanel(placeResult) {
    var infoPane = document.getElementById('panel');
    // If infoPane is already open, close it
    if (infoPane.classList.contains("open")) {
    infoPane.classList.remove("open");
    }

    // Clear the previous details
    while (infoPane.lastChild) {
    infoPane.removeChild(infoPane.lastChild);
    }

    if (placeResult.photos != null) {
      let firstPhoto = placeResult.photos[0];
      let photo = document.createElement('img');
      photo.classList.add('hero');
      photo.src = firstPhoto.getUrl();
      infoPane.appendChild(photo);
  }

    // Add place details with text formatting
    let name = document.createElement('h1');
    name.classList.add('place');
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    if (placeResult.rating != null) {
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.textContent = `Rating: ${placeResult.rating} \u272e`;
    infoPane.appendChild(rating);
    }
    let address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);
    if (placeResult.website) {
    let websitePara = document.createElement('p');
    let websiteLink = document.createElement('a');
    let websiteUrl = document.createTextNode(placeResult.website);
    websiteLink.appendChild(websiteUrl);
    websiteLink.title = placeResult.website;
    websiteLink.href = placeResult.website;
    websitePara.appendChild(websiteLink);
    infoPane.appendChild(websitePara);
    }

    // Open the infoPane
    infoPane.classList.add("open");
  }


}
window.initMap = initMap;