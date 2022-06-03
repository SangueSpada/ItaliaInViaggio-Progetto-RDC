let map;
var selectBorgo;
let service;
let currentInfoWindow;


function initMap() {

  /*selectBorgo = document.getElementById("borgo");
  google.maps.event.addDomListener(selectBorgo,"change",() => {
 
    let selection =selectBorgo.value;
    borghi.forEach(borgo =>{
      if(borgo.nome==selection){
        console.log(borgo.nome);
        position.lat=borgo.lat;
        position.lng=borgo.long;
        position.zoom=borgo.zoom;
        try{
          map.setCenter({ lat: parseFloat(position.lat), lng: parseFloat(position.lng) });
          map.setZoom(parseInt(position.zoom));
          getNearbyPlaces();
          console.log("posti aggiornati");
        }
        catch (error) {
          console.log(error);
        }
      }
    });
  });*/
  var position={lat:la,lng:lo,zoom:zo};
  console.log(position);
  var infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  
  map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: parseFloat(position.lat), lng: parseFloat(position.lng) },
      zoom: parseInt(position.zoom)
    });
  //console.log(map);
    


  // Perform a Places Nearby Search Request
  function getNearbyPlaces() {
    let pos =  new google.maps.LatLng(position.lat,position.lng);
    
    let request = {
      location: pos,
      radius:3000,
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

  getNearbyPlaces();

  function createMarkers(places) {
    console.log(places);
    places.forEach(place => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
      });
      google.maps.event.addListener(marker, 'click', () => {
        let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address','formatted_phone_number', 'geometry', 'rating','user_ratings_total','website', 'photos']
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
    rating.textContent = 'Rating: '+placeResult.rating +' \u272e'+' ('+placeResult.user_ratings_total+')';
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
    let telephone = document.createElement('p');
    let telephoneLink = document.createElement('a');
    let number = document.createTextNode(placeResult.formatted_phone_number);
    telephoneLink.appendChild(number);
    telephoneLink.title=placeResult.formatted_phone_number;
    telephoneLink.href="tel:"+placeResult.formatted_phone_number;
    telephone.appendChild(telephoneLink);
    infoPane.appendChild(telephone);

    }

    // Open the infoPane
    infoPane.classList.add("open");
  }


}
window.initMap = initMap;

function checkin_fun() {


  var checkin = document.getElementById("CheckInDate");
  var checkout = document.getElementById("CheckOutDate");
  var in_date = new Date(checkin.value);
  var out_date = in_date;
  var today = new Date();
  if (in_date <= today) {
      alert("data non valida!");
      checkin.value = new Date();
      checkout.value = new Date();
  } else {
      out_date.setDate(out_date.getDate() + 1);
      checkout.value = out_date.toISOString().split('T')[0];
  }
}

function checkout_fun() {

  var checkin = document.getElementById("CheckInDate");
  var checkout = document.getElementById("CheckOutDate");
  var in_date;
  var out_date = new Date(checkout.value);
  if (checkin.value == '') {
      alert("Scegli prima la data di partenza");
      checkout.value = new Date();
      return
  } else {
      in_date = new Date(checkin.value);
      if (in_date >= out_date) {
          alert("data non valida!");
          checkout.value = new Date();
      }
  }
}

function lessBtnRangeA() {
  var lessBtn = document.getElementById("lessBtnA");
  var moreBtn = document.getElementById("moreBtnA");
  var part = document.getElementById("adulti");

  if (part.valueAsNumber == 1) {
      lessBtn.disabled = true;
  } else {
      lessBtn.disabled = false;
      moreBtn.disabled = false;
      part.value = part.valueAsNumber - 1;
  }
}

function moreBtnRangeA() {
  var lessBtn = document.getElementById("lessBtnA");
  var moreBtn = document.getElementById("moreBtnA");
  var part = document.getElementById("adulti");

  if (part.valueAsNumber == 10) {
      moreBtn.disabled = true;
  } else {
      moreBtn.disabled = false;
      lessBtn.disabled = false;
      part.value = part.valueAsNumber + 1;
  }
}
function lessBtnRangeR() {
  var lessBtn = document.getElementById("lessBtnR");
  var moreBtn = document.getElementById("moreBtnR");
  var part = document.getElementById("ragazzi");

  if (part.valueAsNumber == 0) {
      lessBtn.disabled = true;
  } else {
      lessBtn.disabled = false;
      moreBtn.disabled = false;
      part.value = part.valueAsNumber - 1;
  }
}

function moreBtnRangeR() {
  var lessBtn = document.getElementById("lessBtnR");
  var moreBtn = document.getElementById("moreBtnR");
  var part = document.getElementById("ragazzi");

  if (part.valueAsNumber == 10) {
      moreBtn.disabled = true;
  } else {
      moreBtn.disabled = false;
      lessBtn.disabled = false;
      part.value = part.valueAsNumber + 1;
  }
}

function tempo(citta){
  console.log(citta);
  for(var i=0;i<n.length;i++){
      if(n[i]==citta){
          var lat=la[i];
          var long=lo[i];
          break;
      }
  }
  


  var httpreq= new XMLHttpRequest();
  httpreq.responseType='json';
  httpreq.onreadystatechange= function(e){
      if(this.readyState==4 && this.status == 200){
          let meteos=this.response;
          $("#meteo")[0].hidden=false;
         //document.getElementById("meteo").textContent=document.getElementById("meteo").textContent+(meteos[t].weather[0].description+'+++');
         $("#date").find("th").each(function(index){
             var data=new Date(meteos[index].dt*1000);
         $(this)[0].textContent=String(new Intl.DateTimeFormat().format(data));});

         $("#icone").find("td").each(function(index){

          var url_icon='http://openweathermap.org/img/wn/'+meteos[index].weather[0].icon+'@2x.png';
          $(this).find("img")[0].src=url_icon;
         });

         $("#descrizioni").find("td").each(function(index){
          $(this)[0].textContent=meteos[index].weather[0].description;
         });



      }



      else if(this.readyState==4 && this.status ==500){
          console.log('errore 500 '+this.response);
       }
      else if(this.readyState==4 && this.status !=500 & this.status!=200){
          console.log(this.response);
       }   

  }

var url="https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+long+"&exclude=alerts&appid=";

httpreq.open("POST","/owm",true);

httpreq.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
httpreq.send('url='+url);


}
//tempo(document.getElementById("testo_ricerca").value);






