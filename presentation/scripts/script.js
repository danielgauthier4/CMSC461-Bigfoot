window.addEventListener("load", prepWindow, false);

function prepWindow() {
    setSingleCountyColor();

    document.getElementById("date").addEventListener("input", setSingleCountyColor, false);
}

function setSingleCountyColor() {
    var map = document.getElementById("mapid");

    var doc = map.contentDocument;

    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }

    var counties = Array.from(doc.getElementsByClassName("county"));

    counties.forEach(element => {
        element.style["fill"] = 'hsl(192,80%,'+(Math.random()*70+15)+'%)';
    });
}
