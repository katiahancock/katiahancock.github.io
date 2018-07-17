// The polygon shape that defines Vermont, but leaves out a couple of NH-border towns.
let vermontPolygon = L.geoJSON(border_data);

let vermontBounds = vermontPolygon.getBounds();

let vermontCenter = vermontBounds.getCenter();

let map = L.map("map").setView([vermontCenter.lat, vermontCenter.lng], 7);

// This is setting control things - zoom and drag lock.
map.zoomControl.disable();
map.dragging.disable();
map.setMaxZoom(7);
map.setMinZoom(7);

$("#countyButtons").hide();

vermontPolygon.addTo(map);

// Sets the map layer - specifically satellite, in this case.
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

}).addTo(map);

// Defining variables to be used below.
let randomLon = 0;
let randomLat = 0;

let currentLat;
let currentLon;

let marker;

function setToRandom() {
    
    let loops = 0;
    // This says that if it's in NH, generate a new set of coordinates until it's in VT.
    while (leafletPip.pointInLayer([randomLon, randomLat], vermontPolygon).length === 0) {
        pickRandomPoint(); 
        console.log({loops});
        loops += 1;  
    }

    marker = L.marker([randomLat, randomLon]).addTo(map);
    let randomCoords = [randomLon, randomLat];
    console.log({randomCoords})

    return randomCoords
}

// Pick a random point within the Vermont bounding box!
function pickRandomPoint () {

    // This is the Vermont thing to prevent NH!
    let boundingBox = {
        maxLon: -73.3654,
        minLon: -71.5489,
        maxLat: 45.0065,
        minLat: 42.7395
    };

    randomLat = Math.random() * (boundingBox.maxLat - boundingBox.minLat) + boundingBox.minLat;
    randomLon = Math.random() * (boundingBox.maxLon - boundingBox.minLon) + boundingBox.minLon;
    
    currentLat = randomLat;
    currentLon = randomLon;
}

// Set the coordinates!
function setCoords() {

    map.setView([randomLat, randomLon], 16);
    return map;
}

// If latitude and longitude are zero, generate a new one!
function latLonAreZero () {
    randomLat === 0 && randomLon === 0
}

// Makes movement buttons functional!
function nordSudEstOuest() {

    let northButton = document.getElementById("north");

    northButton.addEventListener("click", () => {
        
        currentLat += 0.00050;
        map.setView([currentLat, currentLon], 16);
    });

    let southButton = document.getElementById("south");

    southButton.addEventListener("click", () => {
        
        currentLat -= 0.00050;
        map.setView([currentLat, currentLon], 16);
    });

    let eastButton = document.getElementById("east");

    eastButton.addEventListener("click", () => {
        
        currentLon += 0.00050;
        map.setView([currentLat, currentLon], 16);
    });

    let westButton = document.getElementById("west");

    westButton.addEventListener("click", () => {
        
        currentLon -= 0.00050;
        map.setView([currentLat, currentLon], 16);
    });

    let returnButton = document.getElementById("return");

    returnButton.addEventListener("click", () => {

        map.setView([randomLat, randomLon], 16);
    });
};

// This turns on the game!
let startButton = document.getElementById("start");

startButton.addEventListener("click", () => {
    
    // Takes all listed values and clears the text content.
    document.getElementById("latitude").textContent = "";
    document.getElementById("longitude").textContent = "";
    document.getElementById("county").textContent = "";
    document.getElementById("town").textContent = "";

    document.getElementById("start").disabled = true;
    document.getElementById("quit").disabled = false;

    map.setMaxZoom(16);
    map.setMinZoom(16);   

    // You wanted dragging? You did not get it. You poor bastard. 
    map.dragging.disable();

    if (!latLonAreZero()) {
        pickRandomPoint();
    }
    setToRandom();
    setCoords();
    nordSudEstOuest();
});

// Changes text content for each div to the lat, lon, and county. Town still in progress.
function displayLocationInfo(polygonInfo) {
    document.getElementById("latitude").textContent = randomLat;
    document.getElementById("longitude").textContent = randomLon;
    document.getElementById("county").textContent = polygonInfo.address.county;
    document.getElementById("town").textContent = "";
};

// Fetch request API to Nominatim to get location data (in plain English!) when inserting our random coordinates into a Nominatim link. 
function getCounty() {
    fetch("https://nominatim.openstreetmaps.org/reverse/?format=json&lat=" + randomLat + "&lon=" + randomLon)
        
        .then(function (response) {
            
            return response.json();
        })

        .then(function (polygonInfo) {

            displayLocationInfo(polygonInfo)
        });
};

// Displays county buttons div when you click guess button, and allows you to select a county.
let guessButton = document.getElementById("guess");

guessButton.addEventListener("click", () => {

    $("#countyButtons").show();
});

// function buttonGuess() {

//     if (polygonInfo.address.county === )    {

//     } else {


//     }
// };

// Give up! Uses the getCounty() function to display the lat, lon, county, etc.
let giveUpButton = document.getElementById("quit");

giveUpButton.addEventListener("click", () => {

    // map.setMaxZoom(13);
    // map.setMinZoom(13);
    getCounty();
    $("#countyButtons").hide();
});

// When you click the "I give up" button, the start button is enabled again!
let giveUpRefresh = document.getElementById("quit");

giveUpRefresh.addEventListener("click", () => {

    document.getElementById("quit").disabled = true;
    document.getElementById("start").disabled = false;
});