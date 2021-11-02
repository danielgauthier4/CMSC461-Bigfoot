window.addEventListener("load", setSingleCountyColor, false);

function setSingleCountyColor() {
    console.log("running");

    var map = document.getElementById("mapid");

    var doc = map.contentDocument;

    console.log(map);

    if (map.contentDocument === null || map.contentDocument === undefined) {
        alert("Failed to apply style to SVG.");
        return;
    }
    var nevada = doc.getElementById("057 Nevada");
    var alameda = doc.getElementById("001 Alameda");
    var alpine = doc.getElementById("003 Alpine");

    nevada.style["fill"] = "green";
    alameda.style["fill"] = "blue";
    alpine.style["fill"] = "red"; 
}
