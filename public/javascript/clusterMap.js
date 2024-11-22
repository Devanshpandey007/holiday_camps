maptilersdk.config.apiKey = mapKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.DATAVIZ.DARK,
    center: [0, 20],
    zoom: 0.3
});

map.on('load', function () {
    map.addSource('campgrounds', {
        'type': 'geojson',
        'data': geojsonCampgrounds, 
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
    map.on('click', 'clusters', async function (e) {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom
      });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
      console.log(e.features[0]);
      var coordinates = e.features[0].geometry.coordinates.slice();
      var mag = e.features[0].properties.title;
      var location = e.features[0].properties.location;

    
      if (e.features[0].properties.tsunami === 1) {
        tsunami = 'yes';
      } else {
        tsunami = 'no';
      }

      // Ensure that if the map is zoomed out such that
      // multiple copies of the feature are visible, the
      // popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new maptilersdk.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `<a href="/campgrounds/${e.features[0].properties.id}">${mag}</a><p>${location}</p>`
        )
        .addTo(map);
    });

    map.on('mouseenter', 'clusters', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
      map.getCanvas().style.cursor = '';
    });
});
