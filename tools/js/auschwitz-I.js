let scene, renderer;
let camera;
let camcontrols;
let objetos = [];
let nodes = [], ways = [], relations = [];
let minlat, maxlat, minlon, maxlon;
let t0
let line;


let b26Clicked = false;

init();
animationLoop();

function init() {
    // Cameras initialization
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Scene & renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Reading xml
    var loader = new THREE.FileLoader();
    loader.load("../osm/auschwitz-I.osm", function (text) {
        // Source https://www.w3schools.com/xml/xml_parser.asp
        var text, parser, xmlDoc;
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(text, "text/xml");

        // Traversing xml
        // Obtaining map boundaries
        var x = xmlDoc.getElementsByTagName("bounds");
        minlat = x[0].getAttribute("minlat");
        maxlat = x[0].getAttribute("maxlat");
        minlon = x[0].getAttribute("minlon");
        maxlon = x[0].getAttribute("maxlon");

        // Node elements for each reference contain latitude and longitude
        let nodes = xmlDoc.getElementsByTagName("node");

        // Relations elements (unused)
        // let relations = xmlDoc.getElementsByTagName("relations");

        // Accessing way elements
        x = xmlDoc.getElementsByTagName("way");

        // Checking for highway or buildings
        for (let i = 0; i < x.length; i++) {
            ways.push(x[i].getAttribute("id"));
            let tags = x[i].getElementsByTagName("tag");
            let interest = 0; // Default - not an element of interest

            // Traversing element way tags
            for (let j = 0; j < tags.length; j++) {
                if (tags[j].hasAttribute("k")) {
                    if (tags[j].getAttribute("k") == "highway") { interest = 1; break; }
                    if (tags[j].getAttribute("k") == "building") { interest = 2; break; }
                    if (tags[j].getAttribute("v") == "Block 20") { interest = 3; break; }
                    if (tags[j].getAttribute("v") == "Block 11") { interest = 4; break; }
                    if (tags[j].getAttribute("v") == "Block 4") { interest = 5; break; }

                    if (tags[j].getAttribute("v") == "arbeitMachtFrei") { interest = 6; break; }
                    
                    if (tags[j].getAttribute("v") == "Dziedziniec") { interest = 7; break; }
                    if (tags[j].getAttribute("v") == "Block 6") { interest = 8; break; }
                    if (tags[j].getAttribute("v") == "Block 7") { interest = 9; break; }
                    if (tags[j].getAttribute("v") == "gas-chamber-I") { interest = 10; break; }                    
                }
                // console.log("v", tags[j].getAttribute("v"));
            }

            //If element way is of interest
            if (interest > 0) {
                const points = [];

                // Loop through element nodes
                let nds = x[i].getElementsByTagName("nd");
                for (let k = 0; k < nds.length; k++) {
                    let ref = nds[k].getAttribute("ref");

                    // Look iteratively for references to obtain coordinates
                    // xmlDoc.querySelector might be a better option to do so
                    for (let nd = 0; nd < nodes.length; nd++) {
                        if (nodes[nd].getAttribute("id") == ref) {
                            let lat = Number(nodes[nd].getAttribute("lat"));
                            let lon = Number(nodes[nd].getAttribute("lon"));

                            // Longitude increases to the right - x
                            let mlon = mapping(lon, minlon, maxlon, -5, 5);

                            // Latitude increases upwards - y
                            let mlat = mapping(lat, minlat, maxlat, -5, 5);

                            // Create element node object
                            //   drawObject(mlon, mlat, 0, 0.02, 10, 10, 0xffffff);

                            // Adds point
                            points.push(new THREE.Vector3(mlon, mlat, 0));

                            // Break traverse - node located
                            break;
                        }
                    }
                }

                // Create an object according to element of interest
                switch (interest) {
                    case 1: drawHighway(points); break; // Highways
                    case 2: drawBuildings(points, 0x686868); break; // Buildings
                    case 3: drawBuildings(points, 0x00FFF7); break; // Block 20
                    case 4: drawBuildings(points, 0xC30000); break; // Block 11
                    case 5: drawBuildings(points, 0x7CFF00); break; // Block 4
                    case 6: drawBuildings(points, 0x5DFBC7); break; // 
                    case 7: drawBuildings(points, 0xFF7F48); break; // The Death Wall
                    case 8: drawBuildings(points, 0x0B09AC); break; // Block 6
                    case 9: drawBuildings(points, 0xFBFF00); break; // Block 7
                    case 10: drawBuildings(points, 0xF00BFF); break; // Gas chamber I
                }

                drawSphere(-1.35, 1.3, 0, 0.1, 10, 10, 0x10503F); // Gate - Arbeit macht frei                
            }
        }

        // console.log("Obtenidos " + ways.length + " elementos");
    });

    // OrbitControls
    camcontrols = new THREE.OrbitControls(camera, renderer.domElement);

    t0 = new Date();
}

function drawHighway(points) {
    const hmaterial = new THREE.LineBasicMaterial({ color: 0xB5B3B3 });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, hmaterial);
    scene.add(line);
}

function drawSphere(px, py, pz, radio, nx, ny, col) {
    let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
    let material = new THREE.MeshBasicMaterial({ color: col });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(px, py, pz);
    scene.add(mesh);
}

function drawBuildings(points, col) {
    const shape = new THREE.Shape();
    shape.autoClose = true;

    // Extrusion object
    for (let np = 0; np < points.length; np++) {
        if (np > 0) shape.lineTo(points[np].x, points[np].y);
        else shape.moveTo(points[np].x, points[np].y);
    }

    let bmaterial = new THREE.LineBasicMaterial({ color: col });
    
    const extrudeSettings = {
        steps: 1,
        depth: 0.2 + THREE.MathUtils.randFloat(-0.05, 0.05),
        bevelThickness: 0,
        bevelSize: 0,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, bmaterial);
    scene.add(mesh);
}

// Value, source, range, destination range
function mapping(val, vmin, vmax, dmin, dmax) {
    // Normalizes value in the starting range, 5=0 in vmin, t=1 in vmax
    let t = 1 - (vmax - val) / (vmax - vmin);
    return dmin + t * (dmax - dmin);
}

function drawObject(px, py, pz, radio, nx, ny, col) {
    let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
    let material = new THREE.MeshBasicMaterial({});

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    objetos.push(mesh);
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    //TrackballControls
    let t1 = new Date();
    let secs = (t1 - t0) / 1000;
    camcontrols.update(1 * secs);
    renderer.render(scene, camera);
}