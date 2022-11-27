function toggleDisplay(id, type) {
    if (type == 1) closeAllInfo(["b4-info", "b6-info", "b7-info", "b11-info", "b20-info", "exec-info", "gasChI-info", "arbeit-info"]);
    else if (type == 2) closeAllInfo(["ruins-info", "b31-info", "b22b-info", "terezin-info", "cstrb-info", "gasch-info", "gate-info"]);
    else if (type == 3) closeAllInfo(["monowitz-info", "forest-info"]);

    var x = document.getElementById(id);

    if (x.style.display === "none") x.style.display = "block";
    else x.style.display = "none";
}

function closeAllInfo(elementList) {
    elementList.forEach(element => {
        document.getElementById(element).style.display = "none";        
    });
}
