var map;
var mapDoc;
var mapBounds;
var mapTopUse;

var counties;
var facilityCircles;

var tooltip;

// String sent to the Application Layer with date appended to the end
var daterequestheader = "http://localhost:8080/covid/nyt-counts/state/california/date/"; // + <date value>

// Date is in format: YYYY-MM-DD
// So full string would be something like: "localhost:8080/get?date=2010-07-15"

window.addEventListener("load", prepWindow, false);

// Main display setup
function prepWindow() {
    map = document.getElementById("mapid");
    mapDoc = map.contentDocument;
    mapBounds = map.getBoundingClientRect();
    topCountyUseElem = mapDoc.getElementById("top-county");
    topFacilityUseElem = mapDoc.getElementById("top-facility");
    counties = Array.from(mapDoc.getElementsByClassName("county"));

    tooltip = document.getElementById("counties-tooltip");

    // Error loading html, yeet out of script
    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }

    // Resize map bounds whenever page is resized or zoomed
    window.addEventListener("resize", (evt) => {
        mapBounds = map.getBoundingClientRect();
    });

    // Call updateMap() when calendar date is changed
    document.getElementById("date").addEventListener("input", updateMap, false);

    var facilities = fetch("data/facilities.json")
        .then((response) => response.json())
        .then((json) => {
            drawFacilities(json);

            facilityCircles = Array.from(mapDoc.getElementsByTagName("circle"));

            addMapListeners();

            updateMap();
        });
}

function addMapListeners() {
    function addListenersTo(elements, topUseElem) {
        elements.forEach((element) => {
            // whenever the mouse moves on this element, move the tooltip to the mouse's position
            element.addEventListener(
                "mousemove",
                (evt) => {
                    tooltip.style.left = evt.clientX + mapBounds.left + "px";
                    tooltip.style.top = evt.clientY + mapBounds.top + "px";
                },
                false
            );

            // when the mouse enters this county, update the tooltip and change the county stroke
            element.addEventListener(
                "mouseenter",
                (evt) => {
                    element.classList.add("hovered");
                    // re-draw this county on top of the rest of the svg
                    topUseElem.setAttribute("href", "#" + element.id);

                    tooltip.innerText = element.getAttribute("tooltipstr");
                    tooltip.style.display = "unset";
                },
                false
            );

            // when the mouse leaves this element, unset stroke modifications and re-hide tooltip
            element.addEventListener(
                "mouseout",
                (evt) => {
                    element.classList.remove("hovered");
                    // reset the use element so the element isn't drawn on top anymore
                    topUseElem.setAttribute("href", null);

                    tooltip.style.display = null;
                },
                false
            );

            /*
			// Set current date to element date on click
			element.addEventListener("mouseclick", (evt) => {
				document.getElementById("date").value = element.getAttribute('date');
				updateMap();
			}, false);
			*/
        });
    }

    addListenersTo(counties, topCountyUseElem);
    addListenersTo(facilityCircles, topFacilityUseElem);
}

// Update county colors to reflect active date
function updateMap() {
    var date = document.getElementById("date").value; // String with format "YYYY-MM-DD"

    // Use null date if input date is invalid (ex: 2000-02-31)
    if (!dateIsValid(date)) {
        date = "0000-00-00";
    }

    var isoDate = date.replace(":", "-");

    // Grab data from Apache
    requestCountyData(isoDate).then((response) => {
        response.text().then((text) => {
            var jsonArray = Array.from(JSON.parse(text));
            var countydata = jsonArray;

            console.log(countydata);

            var countyMax = -Infinity;
            var countyMin = Infinity;

            counties.forEach((element) => {
                var FIPScode = element.getAttribute("fips");

                var dataForThisCounty = undefined;
                countydata.forEach((element) => {
                    if (element.fips == FIPScode) {
                        dataForThisCounty = element;
                    }
                });

                // Check if entry for FIPScode exists
                if (dataForThisCounty != undefined) {
                    var entry = dataForThisCounty;

                    if (entry.cases > countyMax) countyMax = entry.cases;
                    if (entry.cases < countyMin) countyMin = entry.cases;
                }
            });

            var countyDiff = countyMax - countyMin;
            if (countyDiff == 0) {
                countyDiff = countyMax;
            } // Avoid divisions by 0

            if (countyMax == -Infinity || countyMin == Infinity) {
                document.getElementById("county-colorscale-min").innerText = "?? cases";
                document.getElementById("county-colorscale-max").innerText = "?? cases";
            } else {
                document.getElementById("county-colorscale-min").innerText = countyMin + " cases";
                document.getElementById("county-colorscale-max").innerText = countyMax + " cases";
            }

            // For each county on map...
            counties.forEach((element) => {
                var FIPScode = element.getAttribute("fips");

                var dataForThisCounty = undefined;
                countydata.forEach((element) => {
                    if (element.fips == FIPScode) {
                        dataForThisCounty = element;
                    }
                });

                // Check if entry for FIPScode exists
                if (dataForThisCounty != undefined) {
                    element.classList.remove("missing");

                    var entry = dataForThisCounty; // entry = <date, count>

                    // normalize color base
                    var base = 1 - (entry.cases - countyMin) / countyDiff;

                    // Set color based on count
                    if (entry.date == isoDate) {
                        // If matching date, full saturation
                        element.style["fill"] = "hsl(192,100%," + (base * 70 + 20) + "%)";
                    } else {
                        // If date doesn't match, zero saturation
                        element.style["fill"] = "hsl(192,0%," + (base * 70 + 20) + "%)";
                    }

                    // Set tooltip string
                    element.setAttribute("tooltipstr", element.getAttribute("name") + " County" + "\nDate: " + entry.date.toString() + "\nCases: " + entry.cases.toString());
                }
                // Blank out county
                else {
                    element.style["fill"] = null;
                    element.classList.add("missing");
                    element.removeAttribute("tooltipstr");
                }
            });
        });
    });

    requestFacilityData(isoDate).then((response) => {
        response.text().then((text) => {
            var jsonArray = Array.from(JSON.parse(text));
            var prisondata = jsonArray;

            console.log(prisondata);

            // calculate min and max for prisons
            var prisonMax = -Infinity;
            var prisonMin = Infinity;

            facilityCircles.forEach((element) => {
                var id = element.getAttribute("id");

                // Check if entry for prison id exists
                var dataForThisFacility = undefined;
                prisondata.forEach((element) => {
                    if (element.facilityId == id) {
                        dataForThisFacility = element;
                    }
                });

                if (dataForThisFacility != undefined) {
                    var entry = dataForThisFacility;

                    if (entry.residentsConfirmed > prisonMax) prisonMax = entry.residentsConfirmed;
                    if (entry.residentsConfirmed < prisonMin) prisonMin = entry.residentsConfirmed;
                }
            });

            var prisonDiff = prisonMax - prisonMin;
            if (prisonDiff == 0) {
                prisonDiff = prisonMax;
            } // Avoid divisions by 0

            if (prisonMax == -Infinity || prisonMin == Infinity) {
                document.getElementById("prison-colorscale-min").innerText = "?? cases";
                document.getElementById("prison-colorscale-max").innerText = "?? cases";
            } else {
                document.getElementById("prison-colorscale-min").innerText = prisonMin + " cases";
                document.getElementById("prison-colorscale-max").innerText = prisonMax + " cases";
            }

            // For each facility circle on map...
            facilityCircles.forEach((element) => {
                var id = element.getAttribute("id");

                // Check if entry for prison id exists
                var dataForThisFacility = undefined;
                prisondata.forEach((element) => {
                    if (element.facilityId == id) {
                        dataForThisFacility = element;
                    }
                });

                if (dataForThisFacility != undefined) {
                    element.classList.remove("missing");

                    var entry = dataForThisFacility; // entry = <date, count>

                    // normalize color base
                    if (prisonDiff == 0) {
                        var base = 0.5;
                    } else {
                        var base = 1 - (entry.residentsConfirmed - prisonMin) / prisonDiff;
                    }

                    // Set color based on count
                    if (entry.date == isoDate) {
                        // If matching date, full saturation
                        element.style["fill"] = "hsl(32,100%," + (base * 70 + 20) + "%)";
                    } else {
                        // If date doesn't match, zero saturation
                        element.style["fill"] = "hsl(32,0%," + (base * 70 + 20) + "%)";
                    }

                    // Set tooltip string
                    element.setAttribute("tooltipstr", element.getAttribute("name") + "\nDate: " + entry.date.toString() + "\nCount: " + entry.residentsConfirmed.toString());
                }
                // Blank out county
                else {
                    element.style["fill"] = null;
                    element.classList.add("missing");
                    element.setAttribute("tooltipstr", "");
                }
            });
        });
    });
}

// Displays points on map
function drawFacilities(facilities) {
    var coords = facilities.map((facility) => new Coord(facility.lon, facility.lat));
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

    var x = (lon + 180) * (mapWidth / 180);

    var latRad = (lat * Math.PI) / 180;
    var mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    var y = mapHeight / 2 - (mapWidth * mercN) / (2 * Math.PI);

    return new Point(x, y * 2);
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
    var caliMaxX = 0.17933544298239068;

    var scaleFactor = svgInnerWidth / caliMaxX;

    console.log(scaleFactor);

    return points.map((point) => {
        return new Point(point.x * scaleFactor + 35.8, point.y * scaleFactor + 22);
    });
}

// Returns JSON of data for given date recieved from Apache site (TODO)
function requestCountyData(date) {
    var coviddatedata = dummydata; // Dummy data as default

    // If date is over limit
    if (datecmp(date, "2020-04-14") == 1) {
        date = "2020-04-14"; // Clamp Date
    }

    var dateurl = date.replace(":", "-") + "T05%3A00%3A00Z"; // Build string to pass in

    // Trying url directly from Swagger control page. No dice
    //fetch("http://localhost:8080/covid/nyt-counts/state/california/date/2020-02-02T05%3A00%3A00Z")

    return fetch("http://localhost:8080/covid/nyt-counts/state/california/date/" + dateurl);
}

function requestFacilityData(date) {
    // If date is over limit
    if (datecmp(date, "2020-08-31") == 1) {
        date = "2020-08-31"; // Clamp date
    }

    var dateurl = date.replace(":", "-") + "T05%3A00%3A00Z"; // Build string to pass in

    return fetch("http://localhost:8080/covid/cali-counts/date/" + dateurl);
}

function cleanJson(text) {
    var json = JSON.parse(text);

    var entries;
    var keys;

    // Counties
    entries = json["counties"];
    for (k in entries) {
        // Date or count is invalid or date is greater than input date
        if (!dateIsValid(entries[k].date) || !countIsValid(entries[k].count) || datecmp(entries[k].date, date) == 1) {
            // Remove from output
            delete entries[k];
        }
    }

    // Prisons
    entries = json["prisons"];
    for (k in entries) {
        // Date or count is invalid or date is greater than input date
        if (!dateIsValid(entries[k].date) || !countIsValid(entries[k].count) || datecmp(entries[k].date, date) == 1) {
            // Remove from output
            delete entries[k];
        }
    }

    return json;
}

// Converts date string to [year, month, day] and returns it
function dateToTriplet(datestring) {
    return [parseInt(datestring.substring(0, 4), 10), parseInt(datestring.substring(5, 7), 10), parseInt(datestring.substring(8, 10), 10)];
}

const monthdaycount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function dateIsValid(datestring) {
    if (typeof datestring === "string") {
        if (datestring.length >= "YYYY-MM-DD".length) {
            if (
                // Check if all fields contain only digits
                /^[0-9]+$/.test(datestring.substring(0, 4)) &&
                /^[0-9]+$/.test(datestring.substring(5, 7)) &&
                /^[0-9]+$/.test(datestring.substring(8, 10))
            ) {
                var d = dateToTriplet(datestring);

                if (d[1] >= 1 && d[1] <= 12) {
                    // Valid Month
                    if (d[0] % 4 == 0 && d[1] == 2) {
                        // Leap year and February
                        return d[2] >= 1 && d[2] <= 29;
                    }

                    return d[2] >= 1 && d[2] <= monthdaycount[d[1] - 1];
                }
            }
        }
    }

    return false;
}

function countIsValid(count) {
    if (typeof count === "string") {
        count = parseInt(count);
    }

    if (typeof count === "number") {
        return count >= 0;
    }

    return false;
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
    if (date1[0] > date2[0]) {
        return 1;
    }
    if (date1[0] < date2[0]) {
        return -1;
    }

    // Month
    if (date1[1] > date2[1]) {
        return 1;
    }
    if (date1[1] < date2[1]) {
        return -1;
    }

    // Day
    if (date1[2] > date2[2]) {
        return 1;
    }
    if (date1[2] < date2[2]) {
        return -1;
    }

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
		"06005": {"date": "2020-01-02", "count": 34}
	},
	"prisons": {
		"83": {"date": "2020-05-06", "count": 78}
	}
}
`;

// Dummy data disabled while testing with Swagger
/*
fetch('data/dummydata.json').then(function(response) { 
	response.text().then(function(text) {
		if (JSON.parse(text)) {dummydata = text;}
	});
});
*/
