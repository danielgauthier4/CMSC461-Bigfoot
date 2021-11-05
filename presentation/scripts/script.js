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
}

function setSingleCountyColor() {
    counties.forEach(element => {
        element.style["fill"] = 'hsl(192,80%,'+(Math.random()*70+15)+'%)';
    });
}
