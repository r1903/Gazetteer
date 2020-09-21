
/* function to get current location*/
$(document).ready(function() {

    $('#preloader').fadeOut(4000, function() { $(this).remove(); });
    $("#container").show();

  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    /* scheduling function to run every hour to update weather*/
    setInterval(updateWeather,3600000);
  }
  else 
  {    
    alert('Geolocation is not enabled in your browser.');
  } 
});


/*Success function for finding current location*/
function successFunction(position) 
{
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;
  $.ajax({
    url: "libs/php/getCountryName.php",
    type: 'POST',
    dataType: 'json',
    data: {
      latitude: lat,
      longitude:lng
    },
    success: function(result) {
      
      let countryName = result.results[0].components.country;
      let isoCode = result.results[0].components["ISO_3166-1_alpha-3"];
      let countryCode = result.results[0].components.country_code;

      if(window.localStorage.getItem(countryName)){

        updateUi(JSON.parse(window.localStorage.getItem(countryName)),0);
     
      }else{

        getContryInfo(isoCode,countryCode,countryName,0);

      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  }); 
   
}

/*function to handle error while finding current location*/
function errorFunction(position) 
{
  let mapOptions = {
    center: [51.50998, -0.1337],
    zoom: 4
  }
  map = new L.map('map', mapOptions);
  let layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  map.addLayer(layer);
}
	
/*function to draw leaflet map on div*/
function drawMap(searchCountry,capitalCity,lat,lng,isoCode,wikiData){

  let mapOptions = {
    center: [lat, lng],
    zoom: 6
  }

  map = new L.map('map', mapOptions);
  let layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  map.addLayer(layer);

  const markers = new L.FeatureGroup().addTo(map);
 
  wikiData = wikiData.filter(data=>(data.title!=capitalCity && data.title!=searchCountry));

   // Creating a custom icon for wikipedia search
  let cityIcon = L.ExtraMarkers.icon({
    markerColor: 'cyan',
  });
  
  wikiData.forEach((data, i) => {
    const m = new L.Marker([data.lat,data.lng], {icon:cityIcon})
            m.bindPopup(`<h6 style="text-align:center;font-weight:bold">${data.title}</h6> <p><a href=https://${data.wikipediaUrl} target="blank">Click link for more info... </a></p>`).openPopup();
            markers.addLayer(m)
  });

  var redMarker = L.ExtraMarkers.icon({
    markerColor: 'blue',
  });


  let markerOptions = {
    icon: redMarker
  }

  let marker = new L.Marker([lat, lng],markerOptions);
  marker.bindPopup(`<h6 style="text-align:center;font-weight:bold">${capitalCity}</h6><p>capital city of <b>${searchCountry}</b></p>`).openPopup();
  markers.addLayer(marker);
   
  let country = countries.filter( element => element.properties.ISO_A3 === isoCode);
  let multiPolygonOptions = {color:'orange', weight:4,opacity:0.5};
  jsonLayer = L.geoJson(country,multiPolygonOptions);
  jsonLayer.addTo(map);
  map.fitBounds(jsonLayer.getBounds());
}


/* function to get current weather for capital city*/
function getWeather(capitalCity,countryName) 
{
  $.ajax({
    url: "libs/php/getCurrentWeather.php",
    type: 'POST',
    dataType: 'json',
    data: {
      capitalCity,
      countryName
    },
    success: function(result) {
    
      let temp = `${Math.round(parseFloat(result.data.main.temp)-273.15)}°C`;
      console.log('weather');
      $('#weather').html(`<b>Current weather in Capital city:</b> ${temp}`);
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    }
  }); 
   
}

/* function to get country info for searched country*/
function getContryInfo(isoCode,countryCode,countryName,load){
  console.log(countryName);
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: 'POST',
    dataType: 'json',
    data: {
      countryCode,
      countryName:encodeURI(countryName)
    },
    success: function(result) {
       
        let lat = result.capital.results[0].geometry.lat;
        let lng = result.capital.results[0].geometry.lng;
        let capitalCity = result.data[0].capital;
        let wikiData=null;
   
        if(result.wikiData.geonames){
          wikiData = result.wikiData.geonames.filter(element=> (element.summary.includes(countryName)));
        }
   
        const country = {
          name : countryName,
          capital : capitalCity,
          latitude: lat,
          longitude :lng,
          isocode: isoCode,
          flag : result.data[0].flag,
          population : result.data[0].population,
          currencyName :result.data[0].currencies[0].name,
          currencySymbol : result.data[0].currencies[0].symbol,
          region:result.data[0].region,
          wikiData : wikiData
        };

        window.localStorage.setItem(`${countryName}`, JSON.stringify(country));
        
        updateUi(country,load); 
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    }
  }); 
}

/*AJAX call after selceting the value in autocomplete*/
let result = countries.map(a => a.properties.ADMIN);

$("#countries").autocomplete({
  source: result,
  minLength: 2,
  select: function(e,ui) {
    let country =ui.item.label;
    $.ajax({
      url: "libs/php/getCountryName.php",
      type: 'POST',
      dataType: 'json',
      data: {
        country:country
      },
      success: function(result) {
        console.log(result);
        let countryName = result.results[0].components.country;
        let isoCode = result.results[0].components["ISO_3166-1_alpha-3"];
        let countryCode = result.results[0].components.country_code;

        if(window.localStorage.getItem(countryName)){
          updateUi(JSON.parse(window.localStorage.getItem(countryName)),1); 
        }else{
          getContryInfo(isoCode,countryCode,countryName,1);
        }

      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('error');
      }
    }); 
  }
});

/*Function to fetch current weather for capital city*/

function updateWeather () {
  
  let country = $('#name').text().split(':')[1];
  let city = $('#capitalCity').text().split(':')[1];

  if(country && city){
    getWeather(city,country);
  }

}


/*function to update country info on UI*/
function updateUi(countryInfo,load) {

  const {name,capital,latitude,longitude,isocode,flag,population,currencyName,currencySymbol,region,wikiData} = countryInfo ;
   
  if(load==1){
    map.remove();
  }

  $('#exampleModalLabel').html(`<span>${name}</span><img src=${flag} alt="flag" width="50px" height="50px">`);
  $('#capitalCity').html(`<b>Capital City:</b> ${capital}`);
  $('#population').html(`<b>Population:</b> ${population}`);
  $('#currency').html(`<b>Currency:</b> ${currencyName} (<b>Currency symbol:</b> ${currencySymbol})`);
  $('#region').html(`<b>Region:</b> ${region}`);
  
  if(wikiData){
    let data='';
    wikiData.map(wikiData=>{
      data += `<h4> ${wikiData.title == name ?'': wikiData.title} </h4><img src=${wikiData.thumbnailImg}><p>${wikiData.summary}</p><p><a href=https://${wikiData.wikipediaUrl} target="_blank">For more information </a></p>`
    }) 

    $('#wikiData').html(data);
  }

  drawMap(name,capital,latitude,longitude,isocode,wikiData);
  getWeather(capital,name);

}
