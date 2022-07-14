let map;
var selectBorgo;
let service;
let currentInfoWindow;
let getNextPage;
var nres = 0;
var lodges = [];
var RAGGIO = 5000;


function initMap() {
  function LoadMoreHotelControl(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
   
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Carica altri risultati";
    controlDiv.appendChild(controlUI);
  
    // Set CSS for the control interior.
    const controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Carica altri risultati";
    controlUI.appendChild(controlText);
  
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", (event) => {
      if (getNextPage && nres < 60) {
        getNextPage();
      }
      else if(nres >= 60 ){
        event.stopPropagation();
        event.preventDefault();
        alert("Hai superato il numero massimo di risultati caricabili");
        controlUI.parentNode.removeChild(controlUI);
      }
      else{
        event.stopPropagation();
        event.preventDefault();
        alert("Non sono disponibili altri risultati");
        controlUI.parentNode.removeChild(controlUI);
      }
    });
  }
  var position={lat:la,lng:lo,zoom:zo};
  //console.log(position);
  var infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  
  map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: parseFloat(position.lat), lng: parseFloat(position.lng) },
      zoom: parseInt(position.zoom)
    });
  //console.log(map);
    
  const centerControlDiv = document.createElement("div");
  LoadMoreHotelControl(centerControlDiv);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Perform a Places Nearby Search Request
  function getNearbyPlaces() {
    let pos =  new google.maps.LatLng(position.lat,position.lng);
    
    let request = {
      location: pos,
      radius:RAGGIO,
      type: 'lodging',
      rankBy: google.maps.places.RankBy.PROMINENCE
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
  }
  function nearbyCallback(results, status, pagination) {
    if (status !== "OK" || !results) return;
    else{ 
      createMarkers(results);     
      centerControlDiv.disabled= !pagination || !pagination.hasNextPage;
      //console.log(pagination);
      if (pagination && pagination.hasNextPage) {
        getNextPage = () => {
          // Note: nextPage will call the same handler function as the initial call
          pagination.nextPage();
        }
      }
      else{
        alert("Non sono disponibili altri risultati");
        centerControlDiv.parentNode.removeChild(centerControlDiv);
      }
    }
  }
  getNearbyPlaces();

  function createMarkers(places) {
    //console.log(places);
    places.forEach((place) => {
      if(lodges.includes(place.place_id)){
        console.log(place.place_id+" già è stato inserito")
      }
      else{
        lodges.push(place.place_id);
        //console.log(place);
        nres = loadHotels(place, nres);
        let marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
          label: String(nres),
          animation: google.maps.Animation.DROP
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
            //PR=placeResult;
            showDetails(placeResult, marker, status);
          });
        });
      }
    });
    console.log(lodges);
  }
  

  function makeCarousel(photo,index,btnInd,carImg){
    var photoLink = photo.getUrl();
    var divCaorusel = document.createElement('div');
    divCaorusel.classList.add("carousel");
    divCaorusel.id="caroselloHotel";
    if(index==0){
      btnInd+='<button type="button" data-bs-target="#caroselloHotel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 0 "></button>'
      carImg+='<div class="carousel-item active"><img style="width:100%; max-height: 400px;;  margin: auto;" src="'+photoLink+'"></div>'
    }
    else{
      btnInd += '<button type="button" data-bs-target="#caroselloHotel" data-bs-slide-to="'+index+'"class="active" aria-current="true" aria-label="Slide 0 "'+index+'" "></button>'
      carImg+='<div class="carousel-item"><img style="width:100%; max-height: 400px;;  margin: auto;" src="'+photoLink+'"></div>'
    }
    return [btnInd,carImg];
  }

  function loadHotels(placeResult, index){
    //console.log(placeResult);
    let hotelTable = document.getElementById('hotelList');
    let row = document.createElement('tr');
    //<th scope="row">1</th>
    let thIndex = document.createElement('th');
    thIndex.scope= "row";
    let btnIndex = document.createElement('button');
    btnIndex.classList.add("btn")
    btnIndex.name="btnHotel";
    btnIndex.id=placeResult.place_id;
    btnIndex.addEventListener("click",function(){ 
      showPanel2(placeResult.place_id);
      map.setCenter(placeResult.geometry.location); 
    });
    btnIndex.textContent = index+1;
    thIndex.appendChild(btnIndex);

    row.appendChild(thIndex);
    //<td><img class="photoList">#photo</img></td>
    let tdPhoto = document.createElement('td');
    let photo = document.createElement('img');
    photo.classList.add("photoList")
    photo.src= (placeResult.photos != null) ? placeResult.photos[0].getUrl() : "../media/borghi/unavilable.jpg";
    tdPhoto.appendChild(photo);
    row.appendChild(tdPhoto);
    //<td class="h6">Nome hotel</td>
    let tdTitle = document.createElement('td');
    tdTitle.classList.add("h6");
    tdTitle.textContent = placeResult.name;
    row.appendChild(tdTitle);
    //<td>#recensioni</td>
    let divRating = document.createElement('td');
    divRating.textContent = 'Rating: '+placeResult.rating +' \u272e'+' ('+placeResult.user_ratings_total+')';
    row.appendChild(divRating);


    hotelTable.appendChild(row);

    return index+1;


  }

  function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      
    let placeInfowindow = new google.maps.InfoWindow();
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
        '</strong><br>' + 'Rating: ' + placeResult.rating + '&#9733</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    showPanel(placeResult,status);
    } else {
    console.log('showDetails failed: ' + status);
    }
  }

  function showPanel(placeResult,status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log(placeResult);
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
      var divCarousel = document.createElement('div');
        divCarousel.classList.add("carousel", "col");
        divCarousel.id="caroselloHotel";
        var btnIndicators='';
        var carouselImages='';
        (placeResult.photos).forEach((p,index) => {
            let writes= makeCarousel(p,index,btnIndicators,carouselImages);  
            btnIndicators=writes[0];
            carouselImages=writes[1];  
          });
          //console.log(btnIndicators);
          //console.log(carouselImages);
        var writeCarousel='<div class="carousel-indicators">'+btnIndicators+'</div><div class="carousel-inner" id="primi_carousel">'+carouselImages+'</div><button class="carousel-control-prev" type="button" data-bs-target="#caroselloHotel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button><button class="carousel-control-next" type="button" data-bs-target="#caroselloHotel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button>'
        divCarousel.insertAdjacentHTML("beforeend",writeCarousel);
      
      /*let firstPhoto = placeResult.photos[0];
      let photo = document.createElement('img');
      photo.classList.add('hero');
      photo.src = firstPhoto.getUrl();
      infoPane.appendChild(photo);*/
      infoPane.appendChild(divCarousel);
  }
  var divInfo = document.createElement('div');
  divInfo.classList.add("col-4");
    // Add place details with text formatting
    let name = document.createElement('h1');
    name.classList.add('place');
    name.id='place_id';
    name.textContent = placeResult.name;
    divInfo.appendChild(name);
    if (placeResult.rating != null) {
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.textContent = 'Rating: '+placeResult.rating +' \u272e'+' ('+placeResult.user_ratings_total+')';
    divInfo.appendChild(rating);
    }
    let address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    divInfo.appendChild(address);
    if (placeResult.website) {
    let websitePara = document.createElement('p');
    let websiteLink = document.createElement('a');
    let websiteUrl = document.createTextNode(placeResult.website);
    websiteLink.appendChild(websiteUrl);
    websiteLink.title = placeResult.website;
    websiteLink.href = placeResult.website;
    websiteLink.target="_blank";
    websitePara.appendChild(websiteLink);
    divInfo.appendChild(websitePara);
    }
    if (placeResult.formatted_phone_number) {
    let telephone = document.createElement('p');
    let telephoneLink = document.createElement('a');
    let number = document.createTextNode(placeResult.formatted_phone_number);
    telephoneLink.appendChild(number);
    telephoneLink.title=placeResult.formatted_phone_number;
    telephoneLink.href="tel:"+placeResult.formatted_phone_number;
    telephone.appendChild(telephoneLink);
    divInfo.appendChild(telephone);
    }
    infoPane.appendChild(divInfo);
    // Open the infoPane
    infoPane.classList.add("open");
    }
    else {
      console.log('showDetails failed: ' + status);
      }
  }
  function showPanel2(id) {
    let request = {
      placeId: id,
      fields: ['name', 'formatted_address','formatted_phone_number', 'geometry', 'rating','user_ratings_total','website', 'photos']
      };
    service.getDetails(request, (placeResult,status) => {showPanel(placeResult,status); });
    
  }
}
window.initMap = initMap;





