var map;
var mapDoc;
var mapBounds;
var mapTopUse;

var counties;
var facilityCircles;

var tooltip;

window.addEventListener("load", prepWindow, false);

// Main display setup
function prepWindow() {
    map = document.getElementById("mapid");
    mapDoc = map.contentDocument;
    mapBounds = map.getBoundingClientRect();
    topCountyUseElem = mapDoc.getElementById("top-county");
	topFacilityUseElem = mapDoc.getElementById("top-facility")
    counties = Array.from(mapDoc.getElementsByClassName("county"));

    tooltip = document.getElementById("counties-tooltip");
	
	// Error loading html, yeet out of script
    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }
	
	// Resize map bounds whenever page is resized or zoomed
    window.addEventListener("resize", (evt) => { mapBounds = map.getBoundingClientRect(); });
	
	// Call updateMap() when calendar date is changed
	document.getElementById("date").addEventListener("input", updateMap, false);
	
    var facilities = fetch("data/facilities.json")
		.then(response => response.json())
		.then(json => {
			drawFacilities(json);
			
			facilityCircles = Array.from(mapDoc.getElementsByTagName("circle"));

			addMapListeners();

			updateMap();
		});
}

function addMapListeners() {
	// For each county and facility on the map...
    (counties.concat(facilityCircles)).forEach((element) => {
        // whenever the mouse moves on this element, move the tooltip to the mouse's position
        element.addEventListener("mousemove", (evt) => {
            tooltip.style.left = evt.clientX + mapBounds.left + 'px';
            tooltip.style.top = evt.clientY + mapBounds.top + 'px';
        }, false);
	});

	counties.forEach(element => {
		// when the mouse enters this county, update the tooltip and change the county stroke
        element.addEventListener("mouseenter", (evt) => {
            element.style["stroke"] = '#fff';
            element.style["stroke-width"] = '1';

            // re-draw this county on top of the rest of the svg
            topCountyUseElem.setAttribute("href", "#" + element.id);

            tooltip.innerText = element.getAttribute("name") + " County";
            tooltip.style.display = "unset";
        }, false);

		// when the mouse leaves this element, unset stroke modifications and re-hide tooltip
		element.addEventListener("mouseout", (evt) => {
			element.style["stroke"] = null;
			element.style["stroke-width"] = null;

			// reset the use element so the element isn't drawn on top anymore
			topCountyUseElem.setAttribute("href", null);

			tooltip.style.display = null;
		}, false);
    });

	facilityCircles.forEach(element => {
		// when the mouse enters this facility, update the tooltip and change the circle's stroke
        element.addEventListener("mouseenter", (evt) => {
            element.style["stroke"] = '#fff';
            element.style["stroke-width"] = '1';

            // re-draw this facility on top of the rest of the svg
            topFacilityUseElem.setAttribute("href", "#" + element.id);

            tooltip.innerText = element.getAttribute("name");
            tooltip.style.display = "unset";
        }, false);

		// when the mouse leaves this element, unset stroke modifications and re-hide tooltip
		element.addEventListener("mouseout", (evt) => {
			element.style["stroke"] = null;
			element.style["stroke-width"] = null;

			// reset the use element so the element isn't drawn on top anymore
			topFacilityUseElem.setAttribute("href", null);

			tooltip.style.display = null;
		}, false);
    });
}

// Update county colors to reflect active date
function updateMap() {
	var date = document.getElementById("date").value; // String with format "YYYY:MM:DD"
	var json = JSON.parse(requestDateData(date)); // Grab data from Apache
	
	var countydata = json["counties"];	// Each entry is a County instance: <date, count>
	var prisondata = json["prisons"];	// Each entry is a Prison instance: <date, count>
	
	var max = -Infinity;
	var min = Infinity;

	counties.forEach(element => {
		var FIPScode = element.getAttribute("fips");
		var entry = countydata[FIPScode];

		if (entry.count > max) max = entry.count;
		if (entry.count < min) min = entry.count; 
	});

	var diff = max - min;

	// For each county on map...
    counties.forEach(element => {
		// Grab <date, count> entry using FIPS code
		var FIPScode = element.getAttribute("fips");
		var entry = countydata[FIPScode];

		// normalize color base
		var base = 1 - ((entry.count - min) / diff);

		// Set color based on count
		element.style["fill"] = 'hsl(192,80%,'+ (base * 70 + 20) +'%)';
    });

	facilityCircles.forEach(element => {
		element.style["fill"] = 'hsl(32,100%,' + (Math.random() * 70 + 20) + '%)';
	})
}

// Displays points on map
function drawFacilities(facilities) {
	var coords = facilities.map(facility => new Coord(facility.lon, facility.lat));
    var points = coords.map(convertCoords);
    var normalized = normalizePoints(points);
    var transformed = transformPoints(normalized);

	var facilitiesGroup = mapDoc.getElementById("facilities");

	for (let i = 0; i < facilities.length; i++) {
		let point = transformed[i];
		let facility = facilities[i];

		let circle = mapDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.classList.add("prison");
		circle.setAttribute("cx", point.x);
		circle.setAttribute("cy", point.y);
		circle.setAttribute("r", 4);
		circle.setAttribute("name", facility.name);
		circle.setAttribute("id", 'facility-' + facility.id);
		facilitiesGroup.appendChild(circle);
	}
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
