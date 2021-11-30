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
	function addListenersTo(elements, topUseElem) {
		elements.forEach(element => {
			// whenever the mouse moves on this element, move the tooltip to the mouse's position
			element.addEventListener("mousemove", (evt) => {
				tooltip.style.left = evt.clientX + mapBounds.left + 'px';
				tooltip.style.top = evt.clientY + mapBounds.top + 'px';
			}, false);

			// when the mouse enters this county, update the tooltip and change the county stroke
			element.addEventListener("mouseenter", (evt) => {
				element.classList.add("hovered");
				// re-draw this county on top of the rest of the svg
				topUseElem.setAttribute("href", "#" + element.id);
				
				tooltip.innerText = element.getAttribute("tooltipstr");
				tooltip.style.display = "unset";
			}, false);
	
			// when the mouse leaves this element, unset stroke modifications and re-hide tooltip
			element.addEventListener("mouseout", (evt) => {
				element.classList.remove("hovered");
				// reset the use element so the element isn't drawn on top anymore
				topUseElem.setAttribute("href", null);
				
				tooltip.style.display = null;
			}, false);
		});
	}

	addListenersTo(counties, topCountyUseElem);
	addListenersTo(facilityCircles, topFacilityUseElem);
}

// Update county colors to reflect active date
function updateMap() {
	var date = document.getElementById("date").value; // String with format "YYYY:MM:DD"
	var isoDate = date.replace(':', '-');
	var json = requestDateData(date); // Grab data from Apache
	
	var countydata = json["counties"];	// Each entry is a County instance: <date, count>
	var prisondata = json["prisons"];	// Each entry is a Prison instance: <date, count>

	var countyMax = -Infinity;
	var countyMin = Infinity;
	
	counties.forEach(element => {
		var FIPScode = element.getAttribute("fips");
		
		// Check if entry for FIPScode exists
		if (FIPScode in countydata) {
			var entry = countydata[FIPScode];

			if (entry.count > countyMax) countyMax = entry.count;
			if (entry.count < countyMin) countyMin = entry.count;
		}
	});
	
	var countyDiff = countyMax - countyMin;

	document.getElementById("county-colorscale-min").innerText = countyMin;
	document.getElementById("county-colorscale-max").innerText = countyMax;
	
	// For each county on map...
    counties.forEach(element => {
		var FIPScode = element.getAttribute("fips");
		
		// Check if entry for FIPScode exists
		if (FIPScode in countydata) {
			element.classList.remove("missing");

			var entry = countydata[FIPScode]; // entry = <date, count>

			// normalize color base
			var base = 1 - ((entry.count - countyMin) / countyDiff);

			// Set color based on count
			if (entry.date == isoDate) {
				// If matching date, full saturation
				element.style["fill"] = 'hsl(192,100%,'+ (base * 70 + 20) +'%)';
			} else {
				// If date doesn't match, zero saturation
				element.style["fill"] = 'hsl(192,0%,'+ (base * 70 + 20) +'%)';
			}

			// Set tooltip string
			element.setAttribute('tooltipstr', 
				element.getAttribute('name') + " County" +
				"\nDate: " + entry.date.toString() +
				"\nCount: " + entry.count.toString()
				);
		}
		// Blank out county
		else {
			element.style["fill"] = null;
			element.classList.add("missing");
			element.removeAttribute("tooltipstr");
		}
    });

	// calculate min and max for prisons
	var prisonMax = -Infinity;
	var prisonMin = Infinity;

	facilityCircles.forEach(element => {
		var id = element.getAttribute("id");
		
		// Check if entry for prison id exists
		if (id in prisondata) {
			var entry = prisondata[id];

			if (entry.count > prisonMax) prisonMax = entry.count;
			if (entry.count < prisonMin) prisonMin = entry.count; 
		}
	});

	var prisonDiff = prisonMax - prisonMin;

	document.getElementById("prison-colorscale-min").innerText = prisonMin;
	document.getElementById("prison-colorscale-max").innerText = prisonMax;

	// For each facility circle on map...
	facilityCircles.forEach(element => {
		var id = element.getAttribute("id");
		
		// Check if entry for prison id exists
		if (id in prisondata) {
			element.classList.remove("missing");

			var entry = prisondata[id]; // entry = <date, count>			
			
			// normalize color base
			var base = 1 - ((entry.count - prisonMin) / prisonDiff);

			// Set color based on count
			if (entry.date == isoDate) {
				// If matching date, full saturation
				element.style["fill"] = 'hsl(32,100%,'+ (base * 70 + 20) +'%)';
			} else {
				// If date doesn't match, zero saturation
				element.style["fill"] = 'hsl(32,0%,'+ (base * 70 + 20) +'%)';
			}
			
			// Set tooltip string
			element.setAttribute('tooltipstr', 
				element.getAttribute('name') +
				"\nDate: " + entry.date.toString() +
				"\nCount: " + entry.count.toString()
				);
		}
		// Blank out county
		else {
			element.style["fill"] = null;
			element.classList.add("missing");
			element.setAttribute('tooltipstr', '');
		}
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
		circle.setAttribute("id", facility.id); // Used in updateMap()
		circle.setAttribute("tooltipstr", facility.name);
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
	var json = JSON.parse(dummydata);
	var entries;
	var keys;
	
	// Counties
	entries = json["counties"];
	for (k in entries)
	{
		// Date is greater than current date
		if ( datecmp(entries[k].date, date) == 1 )
		{
			// Remove from output
			delete entries[k];
		}
	}
	
	// Prisons
	entries = json["prisons"];
	for (k in entries)
	{
		// Date is greater than current date
		if ( datecmp(entries[k].date, date) == 1 )
		{
			// Remove from output
			delete entries[k];
		}
	}
	return json;
}

// Converts date string to [year, month, day] and returns it
function dateToTriplet(datestring) {
	return [
		datestring.substring(0, 4),
		datestring.substring(5, 7),
		datestring.substring(8, 10)
	];
}

/* Returns: 
	1 if date1 > date2,
	0 if date1 == date2
	-1 if date1 < date2
*/
function datecmp(datestr1, datestr2) {
	var date1 = dateToTriplet(datestr1);
	var date2 = dateToTriplet(datestr2);
	
	// Year
	if (date1[0] > date2[0]) {return 1;}
	if (date1[0] < date2[0]) {return -1;}
	
	// Month
	if (date1[1] > date2[1]) {return 1;}
	if (date1[1] < date2[1]) {return -1;}
	
	// Day
	if (date1[2] > date2[2]) {return 1;}
	if (date1[2] < date2[2]) {return -1;}
	
	// Same date
	return 0;
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
		"06005": {"date": "2020-02-28", "count": 38},
		"06089": {"date": "2020-01-20", "count": 3},
		"06111": {"date": "2020-01-09", "count": 19},
		"06069": {"date": "2020-06-13", "count": 26},
		"06041": {"date": "2020-01-07", "count": 74},
		"06097": {"date": "2020-09-25", "count": 26},
		"06035": {"date": "2020-03-02", "count": 63},
		"06001": {"date": "2020-10-17", "count": 59},
		"06019": {"date": "2020-09-26", "count": 88},
		"06009": {"date": "2020-11-23", "count": 27},
		"06105": {"date": "2020-08-20", "count": 78},
		"06011": {"date": "2020-10-18", "count": 97},
		"06093": {"date": "2020-03-11", "count": 0},
		"06095": {"date": "2020-10-27", "count": 13},
		"06081": {"date": "2020-06-09", "count": 0},
		"06023": {"date": "2020-07-27", "count": 5},
		"06037": {"date": "2020-09-12", "count": 70},
		"06013": {"date": "2020-03-02", "count": 53},
		"06073": {"date": "2020-05-03", "count": 34},
		"06027": {"date": "2020-06-07", "count": 91},
		"06099": {"date": "2020-08-28", "count": 71},
		"06031": {"date": "2020-09-02", "count": 63},
		"06075": {"date": "2020-04-22", "count": 6},
		"06113": {"date": "2020-03-18", "count": 30},
		"06049": {"date": "2020-02-12", "count": 14},
		"06025": {"date": "2020-04-09", "count": 8},
		"06043": {"date": "2020-01-08", "count": 13},
		"06071": {"date": "2020-05-10", "count": 49},
		"06077": {"date": "2020-08-08", "count": 84},
		"06017": {"date": "2020-07-22", "count": 8},
		"06079": {"date": "2020-04-03", "count": 66},
		"06061": {"date": "2020-10-23", "count": 52},
		"06083": {"date": "2020-09-07", "count": 3},
		"06055": {"date": "2020-01-02", "count": 72},
		"06053": {"date": "2020-11-08", "count": 99},
		"06051": {"date": "2020-03-15", "count": 77},
		"06047": {"date": "2020-01-17", "count": 87},
		"06045": {"date": "2020-03-12", "count": 22},
		"06065": {"date": "2020-08-10", "count": 27},
		"06087": {"date": "2020-07-04", "count": 3},
		"06039": {"date": "2020-11-14", "count": 85},
		"06109": {"date": "2020-10-11", "count": 70},
		"06063": {"date": "2020-09-04", "count": 75},
		"06085": {"date": "2020-05-25", "count": 73},
		"06107": {"date": "2020-07-18", "count": 85},
		"06067": {"date": "2020-03-01", "count": 72},
		"06015": {"date": "2020-07-23", "count": 91},
		"06103": {"date": "2020-11-01", "count": 72},
		"06091": {"date": "2020-05-21", "count": 78},
		"06007": {"date": "2020-05-16", "count": 53},
		"06003": {"date": "2020-09-13", "count": 83},
		"06057": {"date": "2020-07-05", "count": 76},
		"06101": {"date": "2020-11-09", "count": 5},
		"06021": {"date": "2020-03-03", "count": 43},
		"06029": {"date": "2020-10-09", "count": 99},
		"06059": {"date": "2020-07-18", "count": 50},
		"06115": {"date": "2020-07-20", "count": 36},
		"06033": {"date": "2020-08-19", "count": 59}
	},
	"prisons": {
		"83": {"date": "2020-10-12", "count": 76},
		"88": {"date": "2020-09-07", "count": 75},
		"89": {"date": "2020-04-30", "count": 40},
		"90": {"date": "2020-02-03", "count": 63},
		"91": {"date": "2020-02-29", "count": 79},
		"92": {"date": "2020-09-02", "count": 85},
		"93": {"date": "2020-11-10", "count": 80},
		"94": {"date": "2020-09-29", "count": 33},
		"95": {"date": "2020-10-05", "count": 29},
		"96": {"date": "2020-11-18", "count": 61},
		"97": {"date": "2020-06-18", "count": 65},
		"98": {"date": "2020-03-06", "count": 31},
		"99": {"date": "2020-06-22", "count": 50},
		"100": {"date": "2020-06-25", "count": 21},
		"101": {"date": "2020-04-16", "count": 99},
		"102": {"date": "2020-08-04", "count": 22},
		"111": {"date": "2020-03-17", "count": 13},
		"112": {"date": "2020-06-26", "count": 3},
		"113": {"date": "2020-06-20", "count": 59},
		"115": {"date": "2020-09-24", "count": 7},
		"116": {"date": "2020-04-16", "count": 6},
		"120": {"date": "2020-09-18", "count": 64},
		"128": {"date": "2020-01-01", "count": 5},
		"129": {"date": "2020-01-25", "count": 38},
		"131": {"date": "2020-10-11", "count": 42},
		"135": {"date": "2020-08-18", "count": 37},
		"139": {"date": "2020-05-23", "count": 14},
		"140": {"date": "2020-04-04", "count": 67},
		"141": {"date": "2020-01-06", "count": 64},
		"142": {"date": "2020-11-12", "count": 47},
		"143": {"date": "2020-03-27", "count": 35},
		"144": {"date": "2020-04-14", "count": 53},
		"145": {"date": "2020-04-07", "count": 64},
		"147": {"date": "2020-02-07", "count": 47},
		"148": {"date": "2020-10-02", "count": 19},
		"150": {"date": "2020-04-24", "count": 97},
		"152": {"date": "2020-07-29", "count": 15},
		"158": {"date": "2020-07-27", "count": 39},
		"161": {"date": "2020-01-28", "count": 69},
		"164": {"date": "2020-02-17", "count": 25},
		"171": {"date": "2020-02-06", "count": 83},
		"1724": {"date": "2020-11-18", "count": 94},
		"1725": {"date": "2020-11-30", "count": 85},
		"1726": {"date": "2020-03-11", "count": 89},
		"1727": {"date": "2020-01-16", "count": 90},
		"1879": {"date": "2020-05-21", "count": 90},
		"2178": {"date": "2020-09-18", "count": 91},
		"2340": {"date": "2020-01-17", "count": 28},
		"2361": {"date": "2020-10-19", "count": 76},
		"2381": {"date": "2020-07-17", "count": 87},
		"2390": {"date": "2020-08-06", "count": 54},
		"2392": {"date": "2020-11-14", "count": 42},
		"2402": {"date": "2020-04-05", "count": 34},
		"2428": {"date": "2020-07-07", "count": 35},
		"2439": {"date": "2020-05-21", "count": 28},
		"2445": {"date": "2020-04-11", "count": 75}
	}
}

`
