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
        
        element.addEventListener("mouseover", (evt) => {
            element.style["stroke"] = '#fff';
            element.style["stroke-width"] = '.5';

            var parent = element.parentNode;

            parent.removeChild(element);
            parent.appendChild(element);
        });

        element.addEventListener("mouseout", (evt) => {
            element.style["stroke"] = '#000';
            element.style["stroke-width"] = '.1';
        });
    });
}
