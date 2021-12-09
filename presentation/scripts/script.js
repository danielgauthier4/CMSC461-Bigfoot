/*
	"script.js" for COVID-19 History Map
	JavaScript code for displaying and interacting with site map of California.
	
	Team: Infinite Monkey Theorem
	Authors: Campbell Jones, Isaiah Hull
	GitHub:
		https://github.com/447-IMT/Infinite-Monkey-Theorem
	
	Last Modified: 12/9/21
*/

// Display and html document variables
var map;
var mapDoc;
var mapBounds;
var mapTopUse;
var tooltip;

// Data variables. Both use 'KeyValueMapWithArray' class to store data. (See end of script)
var counties;
var facilities;

// =================================================================================
// Html Element Functions 
// =================================================================================

window.addEventListener("load", prepWindow, false);

// Main display setup
function prepWindow() {
	// Retrieve elements from html document
    map = document.getElementById("mapid");
    mapDoc = map.contentDocument;
    mapBounds = map.getBoundingClientRect();
    topCountyUseElem = mapDoc.getElementById("top-county");
    topFacilityUseElem = mapDoc.getElementById("top-facility");
    counties = new KeyValueMapWithArray(mapDoc.getElementsByClassName("county"), it => it.getAttribute("uid"));
    tooltip = document.getElementById("tooltip");
	
    // Error loading html, yeet out of script
    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }

    // Resize map bounds whenever page is resized or zoomed
    window.addEventListener("resize", evt => {
        mapBounds = map.getBoundingClientRect();
    });

    // Call updateMap() when calendar date is changed
    document.getElementById("date").addEventListener("input", updateMap, false);
	
	// Populate 'facilities' variable with map of circle elements from svg
    fetch("data/facilities.json")
        .then(response => response.json())
        .then(json => {
            drawFacilities(json);

            facilities = new KeyValueMapWithArray(
                mapDoc.getElementsByClassName("prison"),
                it => it.getAttribute("uid")
            );

            addMapListeners();
            updateMap();
        });
}

// Define user interactions for county and prison elements
function addMapListeners() {
	// Used below to populate 'counties' and 'facilities' variables
    function addListenersTo(elements, topUseElem) {
        elements.forEach(element => {
            // whenever the mouse moves on this element, move the tooltip to the mouse's position
            element.addEventListener("mousemove", evt => {
                tooltip.style.left = evt.clientX + mapBounds.left + "px";
                tooltip.style.top = evt.clientY + mapBounds.top + "px";
            }, false);

            // when the mouse enters this element, update the tooltip and element style
            element.addEventListener("mouseenter", evt => {
                element.classList.add("hovered");
                // re-draw this element on top of the rest of the svg
                topUseElem.setAttribute("href", "#" + element.id);

                tooltip.innerText = element.getAttribute("tooltipstr");
                tooltip.style.display = "unset";
            }, false);

            // when the mouse leaves this element, unset stroke modifications and re-hide tooltip
            element.addEventListener("mouseout", evt => {
                element.classList.remove("hovered");
                // reset the use element so the element isn't drawn on top anymore
                topUseElem.setAttribute("href", null);

                tooltip.style.display = null;
            }, false);
        });
    }

    addListenersTo(counties.array, topCountyUseElem);
    addListenersTo(facilities.array, topFacilityUseElem);
}

// Update county colors to reflect active date
function updateMap() {
    // get the currently selected date as a string and validate it
    var date = new Date(document.getElementById("date").value + "T05:00:00Z");
    if ( !(date instanceof Date) || isNaN(date.valueOf()) ) {
        date = new Date("0000-00-00");
    }
	
    // function to normalize count based on min and difference between min and max
    function normalizeCount(count, min, diff) {
        return (diff > 0 && count > 0) ? 1 - (count - min) / diff : 1;
    }
	
	// Returns color based on count value. Saturation used if date matches active date
    function calcColor(entryDate, base, hue) {
        // If matching date, full saturation. If previous date, no saturation
        let saturation = (entryDate.valueOf() == date.valueOf()) ? "100%" : "0%";
        return "hsl(" + hue + "," + saturation + "," + (base * 60 + 25) + "%)";
    }
	
	// Returns pair of [min, max] values for given array
    function calcMinAndMax(array) {
        let min = Infinity, max = -Infinity;
        array.forEach(it => {
            if (it.cases > max) max = it.cases;
            if (it.cases < min) min = it.cases;
        })
        return [min, max];
    }
	
	// Updates map element colors using new data points
    function visualizeData(elements, dataPoints, colorscalePrefix, colorHue) {
        let filteredData = dataPoints.filter(it => it.isValid);
        let dataKVM = new KeyValueMapWithArray(filteredData, it => it.uid);

        let [min, max] = calcMinAndMax(dataKVM.array);

        document.getElementById(colorscalePrefix + "-colorscale-min").innerText = 
            (min == Infinity) ? "? cases" : min + " cases";
        document.getElementById(colorscalePrefix + "-colorscale-max").innerText = 
            (max == -Infinity) ? "? cases" : max + " cases";

        // For each element of this type on the map...
        elements.array.forEach(element => {
            let uid = element.getAttribute("uid");

            if (!(uid in dataKVM.map)) {
                element.style["fill"] = null;
                element.classList.add("missing");
                element.removeAttribute("tooltipstr");
                return;
            }

            element.classList.remove("missing");
            let entry = dataKVM.map[uid]; // entry = <date, count>
            let base = normalizeCount(entry.cases, min, max - min); // normalize color

            // Set color based on count
            element.style["fill"] = calcColor(entry.date, base, colorHue);

            // Set tooltip string
            element.setAttribute("tooltipstr", element.getAttribute("name") + entry.tooltip);
        });
    }

    // Grab county data from Maven server
    requestData("/nyt-counts/state/california", date)
        .then(response => response.json())
        .then(jsonArray => {
            let mapped = Array.from(jsonArray).map(it => {
                return new DataPoint(it.fips, it.date, it.cases, undefined);
            });
            visualizeData(counties, mapped, "county", 192);
        });

    // Grab prison data from Maven server
    requestData("/cali-counts", date)
        .then(response => response.json())
        .then(jsonArray => {
            let mapped = Array.from(jsonArray).map(it => {
                return new DataPoint(it.facilityId, it.date, it.residentsConfirmed, it.residentsDeaths);
            });
            visualizeData(facilities, mapped, "prison", 32);
        });
}

// Displays points on map
function drawFacilities(facilities) {
    let coords = facilities.map(facility => new Coord(facility.lon, facility.lat));
    let points = coords.map(convertCoords);		// [lon., lat.] -> [x, y]
    let normalized = normalizePoints(points);	// [x, y] -> [0, 1] 
    let transformed = transformPoints(normalized);	// [0, 1] -> Map canvas bounds

    let facilitiesGroup = mapDoc.getElementById("facilities");
	
    for (let i = 0; i < facilities.length; i++) {
        let point = transformed[i];
        let facility = facilities[i];

        let circle = mapDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.classList.add("prison", "missing");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", 4);
        circle.setAttribute("name", facility.name);
        circle.setAttribute("uid", facility.id); // Used in updateMap()
        circle.setAttribute("tooltipstr", facility.name);
        facilitiesGroup.appendChild(circle);
    }
}

// =================================================================================
// Helper Functions
// =================================================================================

// Transforms coordinates from [longitude, latitude] to [x, y]
function convertCoords(coord) {
    let lon = coord.lon;
    let lat = coord.lat;

    let mapWidth = Math.PI;
    let mapHeight = Math.PI / 2;

    let x = (lon + 180) * (mapWidth / 180);

    let latRad = (lat * Math.PI) / 180;
    let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    let y = mapHeight / 2 - (mapWidth * mercN) / (2 * Math.PI);

    return new Point(x, y * 2);
}

// Normalizes points to [0-1] range
function normalizePoints(points) {
    let caliMin = new Point(0.9702356695802884, 0.7614055437283428);
	
    return points.map(point => new Point(point.x - caliMin.x, point.y - caliMin.y));
}

// Transforms points from [0-1] range to map canvas range
function transformPoints(points) {
    var svgInnerWidth = 352.4;
    var caliMaxX = 0.17933544298239068;

    var scaleFactor = svgInnerWidth / caliMaxX;

    return points.map(point => new Point(point.x * scaleFactor + 35.8, point.y * scaleFactor + 22));
}

// Returns JSON of data for given date recieved from Maven site
function requestData(endpoint, date) {
    return fetch("http://localhost:8080/covid" + endpoint + "/date/" + date.toISOString());
}

// =================================================================================
// Classes
// =================================================================================

// Holds longitude and latitude values
class Coord {
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
}

// Holds x and y values
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Contains <uid, date, cases, deaths>. Used when fetching data from Maven Server (See updateMap())
class DataPoint {
    constructor(uid, date, cases, deaths) {
        this.uid = uid.toString();	// Unique identifier
        this.date = new Date(date + "T05:00:00Z");	// Date that this data point represents
        this.cases = parseInt(cases);
        this.deaths = (deaths !== undefined) ? parseInt(deaths) : undefined;
    }
	
	// Returns true if all values for this data point are valid
    get isValid() {
        return this.date instanceof Date && !isNaN(this.date.valueOf()) &&
            this.cases >= 0 && !isNaN(this.cases) && isFinite(this.cases) &&
            this.deaths === undefined || 
                (this.deaths >= 0 && !isNaN(this.deaths) && isFinite(this.deaths));
    }
	
	// Returns tooltip string for this data point
    get tooltip() {
        return "\nDate: " + this.date.toDateString() +
            "\nCases: " + this.cases.toString() +
            ((this.deaths !== undefined) ? "\nDeaths: " + this.deaths.toString() : "");
    }
}

// Contains an array and map of <key, array values> for given array and key function
class KeyValueMapWithArray {
    constructor(arr, mapKeyPropGetter) {
        this.array = Array.from(arr);
        this.map = Object.assign({}, ...this.array.map(it => ({[mapKeyPropGetter(it)]: it})))
    }
}
