const key = mapKey;
maptilersdk.config.apiKey = key;

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: campground.coordinates ? campground.coordinates.coordinates : [16.62662018, 49.2125578],
  zoom: 14
});

if (campground.coordinates) {
    new maptilersdk.Marker()
      .setLngLat(campground.coordinates.coordinates)
      .setPopup(
        new maptilersdk.Popup({ offset: 25 }) 
          .setHTML(`<h6>${campground.title}</h6><p>${campground.location}</p>`)
      )
      .addTo(map);
}
