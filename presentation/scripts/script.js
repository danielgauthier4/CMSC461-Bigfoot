var map;
var mapDoc;
var mapBounds;
var mapTopUse;
var counties;

var tooltip;

window.addEventListener("load", prepWindow, false);

// Main display setup
function prepWindow() {
    map = document.getElementById("mapid");
    mapDoc = map.contentDocument;
    mapBounds = map.getBoundingClientRect();
    mapTopUse = mapDoc.getElementById("top-layer");
    counties = Array.from(mapDoc.getElementsByClassName("county"));

    tooltip = document.getElementById("counties-tooltip");
	
	// Error loading html, yeet out of script
    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }
	
	// For each county on the map...
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
		
		
		// Set FIPS code
		element.setAttribute("fips", FIPSMap[element.getAttribute("name")]);
    });
	
	// Resize map bounds whenever page is resized or zoomed
    window.addEventListener("resize", (evt) => { mapBounds = map.getBoundingClientRect(); });
	
	// Call updateMap() when calendar date is changed
	document.getElementById("date").addEventListener("input", updateMap, false);
	
    var facilities = fetch("data/facilities.json")
		.then(response => response.json())
		.then(json => drawOnCanvas(json));

	updateMap();
}

// Update county colors to reflect active date
function updateMap() {
	var date = document.getElementById("date").value; // String with format "YYYY:MM:DD"
	var json = requestDateData(date); // Grab data from Apache
	
	var jsondata = readFromJson(json); // Parse data and get map pair (Could just use the json directly though)
	var countydata = jsondata[0];	// Each entry is a County instance: <date, count>
	var prisondata = jsondata[1];	// Each entry is a Prison instance: <date, count>
	
	// For each county on map...
    counties.forEach(element => {
		// Grab <date, count> entry using FIPS code
		var FIPScode = element.getAttribute("fips");
		var entry = countydata[FIPScode];
		
		// Set color based on count
		element.style["fill"] = 'hsl(192,80%,'+(entry.count)+'%)';
		
		// Set random color
		//element.style["fill"] = 'hsl(192,80%,'+(Math.random()*70+15)+'%)';
    });
}

// Displays points on map
function drawOnCanvas(facilities) {
	var coords = facilities.map(facility => new Coord(facility.lon, facility.lat));
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

// Transforms coordinates from longitude, latitude to x, y
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

// Normalizes points to [0-1] range
function normalizePoints(points) {
    var caliMin = new Point(0.9702356695802884, 0.7614055437283428);

    return points.map((point) => {
        return new Point(point.x - caliMin.x, point.y - caliMin.y);
    });
}

// Transforms points from [0-1] range to map canvas range
function transformPoints(points) {
    var svgInnerWidth = 352.4;
    var caliMaxX = 0.17933544298239068

    var scaleFactor = svgInnerWidth / caliMaxX;
	
    console.log(scaleFactor);

    return points.map((point) => {
        return new Point(point.x * scaleFactor + 35.8, point.y * scaleFactor + 22);
    })
}

// Returns JSON string of data for given date recieved from Apache site (TODO)
function requestDateData(date) {
	return dummydata;
}

// Returns pair of data from JSON string
// [counties{}, prisons{}]
function readFromJson(jsonstring) {
	var json = JSON.parse(jsonstring);
	
	var jsoncounties = json["counties"];
	var jsonprisons = json["prisons"];
	var outcounties = {};
	var outprisons = {};
	
	var entry; // Current entry being read
	
	// Read counties
	for (var FIPScode in jsoncounties)
	{
		entry = jsoncounties[FIPScode];
		outcounties[FIPScode] = new County(entry["date"], entry["count"]);
	}
	
	// Read prisons
	for (var facilityID in jsonprisons)
	{
		entry = jsonprisons[facilityID];
		outprisons[facilityID] = new Prison(entry["date"], entry["count"]);
	}
	
	return [outcounties, outprisons];
}

// Converts date string to [year, month, day] and returns it
function dateToTriplet(datestring) {
	return [
		datestring.substring(0, 4),
		datestring.substring(5, 7),
		datestring.substring(8, 10)
	];
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

class County {
	constructor(date, count) {
		this.date = date;
		this.count = count;
	}
}

class Prison {
	constructor(date, count) {
		this.date = date;
		this.count = count;
	}
}

// Temporary data used in requestDateData()
var dummydata = `
{
	"counties": {
		"06037": {"date": "2000-10-22", "count": 58},
		"06007": {"date": "2001-05-25", "count": 50},
		"06109": {"date": "1959-11-13", "count": 36},
		"06101": {"date": "1973-03-25", "count": 15},
		"06071": {"date": "2013-08-13", "count": 34},
		"06073": {"date": "1971-08-09", "count": 31},
		"06087": {"date": "2005-01-27", "count": 94},
		"06069": {"date": "2009-07-13", "count": 33},
		"06059": {"date": "1958-05-05", "count": 14},
		"06089": {"date": "1983-02-22", "count": 81},
		"06081": {"date": "2002-05-25", "count": 71},
		"06099": {"date": "1995-05-01", "count": 94},
		"06015": {"date": "2006-09-22", "count": 60},
		"06057": {"date": "1977-03-26", "count": 51},
		"06011": {"date": "1954-02-08", "count": 40},
		"06095": {"date": "1975-05-12", "count": 32},
		"06003": {"date": "1968-06-02", "count": 10},
		"06093": {"date": "1991-10-29", "count": 43},
		"06083": {"date": "2012-05-06", "count": 49},
		"06005": {"date": "1975-07-28", "count": 1},
		"06047": {"date": "2003-08-30", "count": 68},
		"06103": {"date": "2014-05-09", "count": 4},
		"06097": {"date": "1984-02-04", "count": 17},
		"06107": {"date": "2003-05-11", "count": 29},
		"06017": {"date": "2000-08-22", "count": 95},
		"06053": {"date": "1955-06-05", "count": 20},
		"06001": {"date": "1975-11-13", "count": 6},
		"06049": {"date": "2004-09-25", "count": 7},
		"06041": {"date": "1982-03-20", "count": 74},
		"06009": {"date": "1995-01-27", "count": 89},
		"06043": {"date": "1957-06-06", "count": 48},
		"06019": {"date": "1969-08-16", "count": 46},
		"06023": {"date": "2018-07-11", "count": 65},
		"06105": {"date": "1954-11-12", "count": 46},
		"06025": {"date": "1995-03-24", "count": 99},
		"06077": {"date": "1996-09-14", "count": 95},
		"06075": {"date": "1963-09-30", "count": 39},
		"06039": {"date": "1953-06-06", "count": 58},
		"06065": {"date": "1963-11-10", "count": 22},
		"06027": {"date": "2015-11-04", "count": 4},
		"06051": {"date": "2006-10-06", "count": 74},
		"06063": {"date": "1975-03-14", "count": 78},
		"06029": {"date": "1996-10-06", "count": 58},
		"06115": {"date": "1991-01-17", "count": 38},
		"06021": {"date": "2012-08-02", "count": 29},
		"06061": {"date": "2014-02-28", "count": 8},
		"06035": {"date": "2017-11-01", "count": 85},
		"06067": {"date": "1999-02-22", "count": 8},
		"06091": {"date": "1955-03-05", "count": 1},
		"06085": {"date": "2008-02-08", "count": 67},
		"06031": {"date": "1955-04-23", "count": 84},
		"06113": {"date": "1967-03-23", "count": 3},
		"06045": {"date": "1951-07-04", "count": 80},
		"06111": {"date": "1992-03-01", "count": 46},
		"06013": {"date": "2004-01-27", "count": 53},
		"06055": {"date": "1989-08-03", "count": 15},
		"06033": {"date": "2012-09-16", "count": 48},
		"06079": {"date": "1983-09-20", "count": 69}
	},
	"prisons": {
		"97": {"date": "1951-01-14", "count": 79},
		"1356": {"date": "1958-03-26", "count": 54},
		"2298": {"date": "1995-01-04", "count": 6},
		"191": {"date": "1954-08-14", "count": 23},
		"1872": {"date": "1980-10-22", "count": 52},
		"1373": {"date": "1987-05-30", "count": 23},
		"393": {"date": "1993-04-29", "count": 51},
		"642": {"date": "2015-11-07", "count": 69},
		"103": {"date": "1997-03-30", "count": 25},
		"1784": {"date": "1990-02-30", "count": 66},
		"1559": {"date": "1991-03-26", "count": 13},
		"1174": {"date": "1995-03-16", "count": 14},
		"625": {"date": "1967-01-27", "count": 9},
		"1129": {"date": "1995-06-02", "count": 8},
		"1533": {"date": "1990-02-28", "count": 63},
		"1871": {"date": "1997-07-25", "count": 93},
		"1157": {"date": "1960-03-09", "count": 80},
		"2555": {"date": "2015-02-13", "count": 75},
		"2159": {"date": "2014-05-03", "count": 35},
		"396": {"date": "1978-11-12", "count": 93}
	}
}

`;

var FIPSMap = {
	"Alameda": "06001",
	"Alpine": "06003",
	"Amador": "06005",
	"Butte": "06007",
	"Calaveras": "06009",
	"Colusa": "06011",
	"Contra Costa": "06013",
	"Del Norte": "06015",
	"El Dorado": "06017",
	"Fresno": "06019",
	"Glenn": "06021",
	"Humboldt": "06023",
	"Imperial": "06025",
	"Inyo": "06027",
	"Kern": "06029",
	"Kings": "06031",
	"Lake": "06033",
	"Lassen": "06035",
	"Los Angeles": "06037",
	"Madera": "06039",
	"Marin": "06041",
	"Mariposa": "06043",
	"Mendocino": "06045",
	"Merced": "06047",
	"Modoc": "06049",
	"Mono": "06051",
	"Monterey": "06053",
	"Napa": "06055",
	"Nevada": "06057",
	
	"Orange": "06059",
	"Placer": "06061",
	"Plumas": "06063",
	"Riverside": "06065",
	"Sacramento": "06067",
	"San Benito": "06069",
	"San Bernardino": "06071",
	"San Diego": "06073",
	"San Francisco": "06075",
	"Joaquin": "06077",
	"San Luis Obispo": "06079",
	"San Mateo": "06081",
	"Santa Barbara": "06083",
	"Santa Clara": "06085",
	"Santa Cruz": "06087",
	"Shasta": "06089",
	"Sierra": "06091",
	"Siskiyou": "06093",
	"Solano": "06095",
	"Sonoma": "06097",
	"Stanislaus": "06099",
	"Sutter": "06101",
	"Tehama": "06103",
	"Trinity": "06105",
	"Tulare": "06107",
	"Tuolumne": "06109",
	"Ventura": "06111",
	"Yolo": "06113",
	"Yuba": "06115",
}
