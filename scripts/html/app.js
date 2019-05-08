var q = function(item) {
  var svalue = location.search.match(
    new RegExp("[?&]" + item + "=([^&]*)(&?)", "i")
  );
  return svalue ? svalue[1] : svalue;
};

//main configuration
c = {
  orign: q("orign") ? [+q("orign").split(",")[0],+q("orign").split(",")[1]] : [-75.18368555231567,40.01231780433909],
  destination: q("destination") ? [+q("destination").split(",")[0],+q("destination").split(",")[1]] : [-75.12775501525252,40.025288504863425],
  center: q("center") ? [+q("center").split(",")[0],+q("center").split(",")[1]] : [-75.17826974331649,40.012921147425146], //galton's starting point && center of the map on start
  zoom: q("zoom") ? q("zoom") : 11,
  height: q("height") ? q("height") : 4.11,
  weight: q("weight") ? q("weight") : 11.79,
  system: q("system") ? q("system") : "metric"
};

function updateURLParams() {
  var u = "./?",
    t;
  for (i in c) {
    u += "&" + i + "=" + c[i];
  }
  window.history.pushState(null, "routing", u);
}

//set params in form
d3.select("#maxweight").attr("value", c.weight);
d3.select("#maxheight").attr("value", c.height);

updateURLParams();


mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpamFhZXNkOTAwMnp2bGtxOTFvMTNnNjYifQ.jUuvgnxQCuUBUpJ_k7xtkQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
  center: c.center, // starting position [lng, lat]
  zoom: c.zoom // starting zoom
});


var panel = d3.select("#panel");


var colors = {
  maxheight: "#3751D5",
  hgv_no: "#B43434",
  maxweight: "#45A86E"
}

var app_id = 'oo8vWnUj250z0MsyBMjp', app_code = '0wlGsC5OVxjmseHa9JTyhw';
newRoute = true;

var conf;

decode = (str, precision) => {
  var index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision || 6);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {

    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change;
    lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);

  }

  return coordinates;
};

var popup = new mapboxgl.Popup({
  closeButton: true,
  closeOnClick: true
});


d3.select("#metric").attr("class", c.system === "metric" ? "system-selected" : "system").on("click", () => { changeSystem("metric") });
d3.select("#imperial").attr("class", c.system === "imperial" ? "system-selected" : "system").on("click", () => { changeSystem("imperial") });


changeSystem = (system) => {
  d3.select("#metric").attr("class", system === "metric" ? "system-selected" : "system");
  d3.select("#imperial").attr("class", system === "imperial" ? "system-selected" : "system");
  d3.select("#maxweight-imperial").style("display", system === "imperial" ? "block" : "none");
  d3.select("#maxweight-metric").style("display", system === "metric" ? "block" : "none");
  d3.select("#maxheight-imperial").style("display", system === "imperial" ? "block" : "none");
  d3.select("#maxheight-metric").style("display", system === "metric" ? "block" : "none");

  c.system = system;
  recalcUnits(system === "metric" ? "imperial" : "metric");
}

recalcUnits = (fromSystem) => {

  var imperial_height,imperial_weight,metric_height,metric_height,feets,inches;

  if(fromSystem==="imperial") {
    //get from inputs
    imperial_height = d3.select("#maxheight-imperial").property("value");
    imperial_weight = d3.select("#maxweight-imperial").property("value");
    feets = +imperial_height.split("'")[0];
    inches = +imperial_height.split("'")[1].replace('"','')
    metric_height = Math.round((feets/3.281 + (inches*2.54)/100)*100)/100; //Math.round(((+imperial_height.split("'")[0]/3.281) + +imperial_height.split("'")[1].replace('"','')*2.54)*100)/100;
    metric_weight = Math.round(imperial_weight/22.04)/100;
    d3.select("#maxheight-metric").property("value", metric_height);
    d3.select("#maxweight-metric").property("value", metric_weight);

  }
  if(fromSystem === "metric") {
    metric_height = d3.select("#maxheight-metric").property("value");
    metric_weight = d3.select("#maxweight-metric").property("value");
    feets = Math.floor(+metric_height*3.281);
    inches = Math.round((((+metric_height * 3.281 - feets)/3.281)*100)/2.54);
    imperial_height = feets + "'" + inches + '"';
    imperial_weight = Math.round(metric_weight*2204);
    d3.select("#maxheight-imperial").property("value", imperial_height);
    d3.select("#maxweight-imperial").property("value", imperial_weight);
  }
  //store values
  c.height = metric_height;
  c.weight = metric_weight;
  updateURLParams();

}


//if(c.system === "imperial") recalcHeight(c.height,true);
changeSystem("imperial");

humanTime = (t) => {
  var h = Math.floor(t/3600), m = Math.floor((t - h*3600)/60), s = t - (h*3600 + m*60);
  return (h>0 ? (h + "h") : "") + " " + (m>0 ? (m + "m") : "") + " " + s + "s"


}


requestRoutes = () => {
  var maxweight, maxheight;
  d3.select("#routes").text("");
  var hereRouteDiv = d3.select("#routes").append("div").attr("class", "route").attr("id", "route-here");
  var mapboxRouteDiv = d3.select("#routes").append("div").attr("class", "route").attr("id", "route-mapbox");

  recalcUnits(c.system);
  maxheight = c.height;
  maxweight = c.weight;

  updateURLParams();

  //process mapbox route
  requestJson = {
    "locations": [
      { "lat": c.orign[1], "lon": c.orign[0] },
      { "lat": c.destination[1], "lon": c.destination[0] }
    ],
    "costing": "truck",
    "costing_options": {
      "truck": {
        "height": maxheight,
        "width": "2.6",
        "length": "21.64",
        "weight": maxweight,
        "axle_load": "9.07",
        "hazmat": false
      }
    }
  }

  url = 'https://api.mapbox.com/valhalla/v1/route?json='+JSON.stringify(requestJson)+'&access_token='+mapboxgl.accessToken;
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      var mroute = turf.featureCollection([]);
      json.trip.legs.forEach(l=>{
        mroute.features.push(turf.lineString(decode(l.shape).map(s=>[s[1],s[0]])))
    });
      map.getSource("mapbox_route").setData(mroute);
      mapboxRouteDiv.append("div").text("Mapbox").style("color", "#09F");;
      if(json.trip && json.trip.summary) {
        mapboxRouteDiv.append("div").text(Math.round(json.trip.summary.length*100)/100 + "km");
        mapboxRouteDiv.append("div").text(humanTime(json.trip.summary.time));
      } else {
        mapboxRouteDiv.append("div").text("Cant't build route");
      }
    });

  var here_url = 'https://route.api.here.com/routing/7.2/calculateroute.json?app_id='+app_id+'&app_code='+app_code+'&waypoint0=geo!'+c.orign[1]+','+c.orign[0]+'&waypoint1=geo!'+c.destination[1]+','+c.destination[0]+'&mode=fastest;truck;traffic:disabled&limitedWeight='+maxweight+'&height='+maxheight+'&shippedHazardousGoods=harmfulToWater&routeAttributes=waypoints,shape'

  fetch(here_url)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {

      var hroute = turf.featureCollection([]);

      hereRouteDiv.append("div").text("HERE").style("color", "#b3F");
      if(json.response && json.response.route && json.response.route[0]) {
        hereRouteDiv.append("div").text(Math.round(json.response.route[0].summary.distance/10)/100 + "km");
        hereRouteDiv.append("div").text(humanTime(json.response.route[0].summary.baseTime));
      } else {
        hereRouteDiv.append("div").text("Can't build route");
      }

      if(json.response && json.response.route) json.response.route.forEach(r=>{
        hroute.features.push(turf.lineString(r.shape.map(s=>[+s.split(",")[1],+s.split(",")[0]])));
    });
      map.getSource("here_route").setData(hroute);


    });

}

toggleLayer = (menuLayerId) => {
  var menuLayerIdx = conf.menuLayers.findIndex(ml=> ml.id === menuLayerId);
  conf.menuLayers[menuLayerIdx].visible = (conf.menuLayers[menuLayerIdx].visible ? false : true);
  var menuLayer = conf.menuLayers[menuLayerIdx];


  d3.select("#"+menuLayer.id).attr("class", menuLayer.visible ? "layer-visible" : "layer");
  menuLayer.layers.forEach(l=>{
    map.setLayoutProperty(l,"visibility", menuLayer.visible ? "visible" : "none");
})
}

getVisibleLayers = () => {
  var layers = [];
  conf.menuLayers.forEach(m=>{
    if(m.visible) m.layers.forEach(l=>{ layers.push(l) })
});
  return layers;
}

map.on("load", () => {
//  map.addControl(new MapboxGeocoder({ accessToken: mapboxgl.accessToken }));
  map.addSource("locations", { type: "geojson",  data: { type: "FeatureCollection", features: [] }});
map.addSource("mapbox_route", { type: "geojson",  data: { type: "FeatureCollection", features: [] }})
map.addSource("here_route", { type: "geojson",  data: { type: "FeatureCollection", features: [] }})

fetch("./data/conf.json?"+Math.random())
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    conf = json;
    conf.sources.forEach(s=>{ map.addSource(s.id,s.d) })
    conf.layers.forEach(l=>{ map.addLayer(l) });

    //build layers menu
    conf.menuLayers.forEach(m=>{
      var item = d3.select("#layers").append("div").attr("id", m.id).attr("class", m.visible ? "layer-visible" : "layer").on("click", ()=> { toggleLayer(m.id)});
    item.append("div").attr("class", "layer-bullet").style("background", m.color);
    item.append("div").attr("class", "layer-label").text(m.label);
    m.layers.forEach(l=> { map.setLayoutProperty(l,"visibility", m.visible ? "visible" : "none"); })
  });


  });

if(c.orign && c.destination) {
  var locationsJson = turf.featureCollection([]);
  locationsJson.features.push(turf.point(c.orign, { "color": "#b0b" }))
  locationsJson.features.push(turf.point(c.destination, { "color": "#09f" }));
  map.getSource("locations").setData(locationsJson);
  requestRoutes();
}

map.addLayer({
  id: "mapbox_route",
  source: "mapbox_route",
  type: "line",
  paint: {
    "line-color": "#09F",
    "line-width": 2,
    "line-opacity": 0.6
  }
});

map.addLayer({
  id: "here_route",
  source: "here_route",
  type: "line",
  paint: {
    "line-color": "#b3F",
    "line-width": 2,
    "line-opacity": 0.6
  }
});


map.addLayer({
  id: "locations",
  source: "locations",
  type: "circle",
  paint: {
    "circle-color": ["get", "color"],
    "circle-radius": 5
  }
});


map.on('mousemove', function(e) {
  // Change the cursor style as a UI indicator.

  var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
  var features = map.queryRenderedFeatures(bbox, { layers: getVisibleLayers() });
  var coordinates = [e.lngLat.lng,e.lngLat.lat];

  if(features.length>0) {
    map.getCanvas().style.cursor = 'pointer';
  } else {
    map.getCanvas().style.cursor = '';
    //opup.remove();
  }
});

});

map.on("dragend", ()=>{
  var cr = map.getCenter();
c.center = [cr.lng,cr.lat];
c.zoom = map.getZoom();
updateURLParams();
});

map.on("zoomend", ()=>{
  var cr = map.getCenter();
c.center = [cr.lng,cr.lat];
c.zoom = map.getZoom();
updateURLParams();
});




map.on("click", (e) => {

  var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
var features = map.queryRenderedFeatures(bbox, { layers: getVisibleLayers() });
var coordinates = [e.lngLat.lng,e.lngLat.lat];

if(features.length > 0) {
  var description = '<div class="params">';
  for(k in features[0].properties) {
    if(features[0].properties[k] !== "null") description += "<div class='key'>" + k + ": " + features[0].properties[k] + "</div>"
  }
  description += '</div>';
  description += "<div><a href='https://www.openstreetmap.org/" + features[0].properties["osm_id"] + "'>View on OSM</a></div>";


  // based on the feature found.
  popup.setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
} else {

  map.getSource("mapbox_route").setData({ type: "FeatureCollection", features: [] });
  map.getSource("here_route").setData({ type: "FeatureCollection", features: [] });
  var locationsJson = { type: "FeatureCollection", features: [] };
  if(newRoute) {
    c.orign =  [e.lngLat.lng,e.lngLat.lat];
    d3.select("#o").attr("value", c.orign);
    d3.select("#d").attr("value", "");
    c.destination = null;
    updateURLParams();
    newRoute = false;
  } else {
    c.destination = [e.lngLat.lng,e.lngLat.lat];
    d3.select("#d").attr("value", c.destination);
    newRoute = true;
    updateURLParams();
    requestRoutes();
  }
  locationsJson.features.push(turf.point(c.orign, { "color": "#b0b" }))
  if(c.destination) locationsJson.features.push(turf.point(c.destination, { "color": "#09f" }));
  map.getSource("locations").setData(locationsJson);
}

});


fetch("./api/statistics?")
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    var no_maxweight_mi = json.find(obj => {
      return obj.metric === 'no_maxweight_mi'
    });
    var no_maxheight_mi = json.find(obj => {
      return obj.metric === 'no_maxheight_mi'
    });
    var maxweight_tags = json.find(obj => {
      return obj.metric === 'maxweight_tags'
    });
    var maxheight_tags = json.find(obj => {
      return obj.metric === 'maxheight_tags'
    });
    d3.select("#stats").html('Statistics:');
    d3.select("#stats").append("div").attr("id", 'no_maxweight_mi').attr("class", "stat_item stat_item_first").html('Total miles without maxweight: ' + no_maxweight_mi.val);
    d3.select("#stats").append("div").attr("id", 'no_maxheight_mi').attr("class", "stat_item").html('Total miles without maxheight: ' + no_maxheight_mi.val);
    d3.select("#stats").append("div").attr("id", 'maxweight_tags').attr("class", "stat_item").html('Total maxweight tags: ' + maxweight_tags.val);
    d3.select("#stats").append("div").attr("id", 'maxheight_tags').attr("class", "stat_item").html('Total maxheight tags: ' + maxheight_tags.val);
  });
