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

    var tip = document.createElement("div");
    tip.classList.add("tooltip");
    document.body.appendChild(tip);

    counties.forEach(element => {
        element.style["fill"] = 'hsl(192,80%,'+(Math.random()*70+15)+'%)';

        element.addEventListener("mousemove", (evt) => {
            tip.style.left = evt.screenX + 'px';
            tip.style.top = (evt.screenY + evt.clientY) / 2 + 'px';
            tip.innertText = evt.screenX;
            console.log("moved");
        }, false);
        
        element.addEventListener("mouseenter", (evt) => {
            element.style["stroke"] = '#fff';
            element.style["stroke-width"] = '.5';

            var parent = element.parentNode;

            parent.removeChild(element);
            parent.appendChild(element);

            console.log(evt);

            tip.innerText = element.id;
            tip.style.visibility = "unset";
        }, false);

        element.addEventListener("mouseout", (evt) => {
            element.style["stroke"] = '#000';
            element.style["stroke-width"] = '.1';
            tip.style.visibility = "hidden";
        }, false);
    });
}
