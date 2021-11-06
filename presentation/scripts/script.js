var map;
var mapDoc;
var mapBounds;
var mapTopUse;
var counties;

var tooltip;

window.addEventListener("load", prepWindow, false);

function prepWindow() {
    map = document.getElementById("mapid");
    mapDoc = map.contentDocument;
    mapBounds = map.getBoundingClientRect();
    mapTopUse = mapDoc.getElementById("top-layer");
    counties = Array.from(mapDoc.getElementsByClassName("county"));

    tooltip = document.getElementById("counties-tooltip");

    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }

    counties.forEach((element) => {
        // whenever the mouse moves on this county, move the tooltip to the mouse's position
        element.addEventListener("mousemove", (evt) => {
            tooltip.style.left = evt.clientX + mapBounds.left + 'px';
            tooltip.style.top = evt.clientY + mapBounds.top + 'px';
        }, false);

        // when the mouse enters this county, update the tooltip and change the county stroke
        element.addEventListener("mouseenter", (evt) => {
            element.style["stroke"] = '#fff';
            element.style["stroke-width"] = '3';

            // re-draw this county on top of the rest of the svg
            mapTopUse.setAttribute("href", "#" + element.id);

            tooltip.innerText = element.getAttribute("name") + " County";
            tooltip.style.display = "unset";
        }, false);

        // when the mouse leaves this county, unset stroke modifications and re-hide tooltip
        element.addEventListener("mouseout", (evt) => {
            element.style["stroke"] = null;
            element.style["stroke-width"] = null;

            // reset the use element so the county isn't drawn on top anymore
            mapTopUse.setAttribute("href", null);

            tooltip.style.display = null;
        }, false);
    });

    window.addEventListener("resize", (evt) => { mapBounds = map.getBoundingClientRect(); });
    document.getElementById("date").addEventListener("input", setSingleCountyColor, false);
    setSingleCountyColor();

    drawOnCanvas();
}

function setSingleCountyColor() {
    counties.forEach(element => {
        element.style["fill"] = 'hsl(192,80%,'+(Math.random()*70+15)+'%)';
    });
}

function drawOnCanvas() {
    var points = coords.map(convertCoords);
    var normalized = normalizePoints(points);
    var transformed = transformPoints(normalized);

    transformed.forEach((point) => {
        let circle = mapDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 4);
        circle.setAttribute("stroke", "brown");
        circle.setAttribute("fill", "orange");
        mapDoc.getElementsByTagName("svg")[0].appendChild(circle);
    });
}

function convertCoords(coord) {
    var lon = coord.lon;
    var lat = coord.lat;

    var mapWidth = Math.PI;
    var mapHeight = Math.PI / 2;

    var x = (lon + 180) * (mapWidth/180);
    
    var latRad = lat * Math.PI / 180;
    var mercN = Math.log(Math.tan(Math.PI/4 + latRad/2));
    var y = (mapHeight / 2) - (mapWidth * mercN / (2*Math.PI));

    return new Point(x, y*2);
}

function normalizePoints(points) {
    var caliMin = new Point(0.9702356695802884, 0.7614055437283428);

    return points.map((point) => {
        return new Point(point.x - caliMin.x, point.y - caliMin.y);
    });
}

function transformPoints(points) {
    var svgInnerWidth = 352.4;
    var caliMaxX = 0.17933544298239068

    var scaleFactor = svgInnerWidth / caliMaxX;

    console.log(scaleFactor);

    return points.map((point) => {
        return new Point(point.x * scaleFactor + 35.8, point.y * scaleFactor + 22);
    })
}

class Coord {
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var coords = [
    new Coord(-120.1231018, 35.97394934),
    new Coord(-117.8588801, 35.1532512),
    new Coord(-120.5167302, 40.40195801),
    new Coord(-118.5703307, 35.10991489),
    new Coord(-121.1848441, 37.8947278),
    new Coord(-117.6823919, 33.98471223),
    new Coord(-117.636365, 33.94974531),
    new Coord(-121.9791645, 38.32851019),
    new Coord(-120.6989005, 35.32457413),
    new Coord(-117.5759442, 33.92691794),
    new Coord(-119.549121, 36.06081823),
    new Coord(-118.2276136, 34.69359649),
    new Coord(-121.1539037, 38.69444411),
    new Coord(-122.4903665, 37.94003982),
    new Coord(-121.9752369, 38.32077652),
    new Coord(-115.484344, 33.16569337),
    new Coord(-115.7890555, 32.82339731),
    new Coord(-120.1527098, 37.09368073),
    new Coord(-114.9095058, 33.56257951),
    new Coord(-121.3822324, 36.46964789),
    new Coord(-121.3306264, 37.74805759),
    new Coord(-121.1630324, 38.69538339),
    new Coord(-120.5258579, 40.4034569),
    new Coord(-114.9260354, 33.56098104),
    new Coord(-119.3253627, 35.76647437),
    new Coord(-118.2321, 34.0591),
    new Coord(-120.9534458, 38.37074335),
    new Coord(-121.1978212, 37.8911829),
    new Coord(-119.3098757, 35.78188512),
    new Coord(-121.1978213, 37.8911829),
    new Coord(-121.1976947, 37.89852126),
    new Coord(-117.8774523, 33.7489556),
    new Coord(-124.1490751, 41.85480851),
    new Coord(-120.2488996, 36.13147309),
    new Coord(-121.3279067, 38.2890255),
    new Coord(-116.9335763, 32.58456487),
    new Coord(-121.3743944, 36.47885699),
    new Coord(-120.5365401, 37.89168856),
    new Coord(-119.5478, 36.05396),
    new Coord(-120.1554719, 37.10547736),
    new Coord(-119.4083319, 35.59431189),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-121.4974903, 38.58298737),
    new Coord(-117.1642716, 32.71725211),
    new Coord(-121.9063, 37.35147),
    new Coord(-121.8877904, 37.71784065),
    new Coord(-117.442225, 34.559424),
    new Coord(-119.225818, 35.6681),
    new Coord(-115.541, 32.68755),
    new Coord(-118.23963, 34.05447),
    new Coord(-119.006075, 35.38009),
    new Coord(-117.170912, 32.724103),
    new Coord(-121.7303, 38.66101),
    new Coord(-121.586736, 39.140676),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-122.405441, 37.77499),
    new Coord(-118.24361, 33.97331),
    new Coord(-120.97872, 35.755566),
    new Coord(-117.52874, 33.995007),
    new Coord(-121.49376, 38.584351),
    new Coord(-117.58974, 34.15554),
    new Coord(-116.75532, 32.826938),
    new Coord(-121.2234, 37.906882),
    new Coord(-122.29612, 37.51445),
    new Coord(-119.51875, 34.402368),
    new Coord(-122.16438, 38.069204),
    new Coord(-120.95632, 37.585454),
    new Coord(-118.91642, 34.184847),
    new Coord(-119.45496, 35.95859),
    new Coord(-119.777127650233, 34.4449050199534),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-119.543418, 37.155177),
    new Coord(-120.55909, 37.3830994),
    new Coord(-121.88797, 37.7159318),
    new Coord(-120.16359, 40.1440673),
    new Coord(-120.50559, 34.676188),
    new Coord(-118.23806, 34.0535217),
    new Coord(-120.39237, 36.7307653),
    new Coord(-117.16562, 32.7137119),
    new Coord(-118.26814, 33.7271772),
    new Coord(-117.36047, 34.5722033),
    new Coord(-121.35813, 38.0167812),
    new Coord(-117.437812, 34.559426),
]
