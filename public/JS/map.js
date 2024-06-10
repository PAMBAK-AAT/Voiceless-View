
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

console.log('Coordinates:', coordinates);

const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(`<h4>listing.location</h4><p>Exact location will be provided after booking</p>`))
    .addTo(map)