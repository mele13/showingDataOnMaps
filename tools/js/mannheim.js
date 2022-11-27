// Scene, renderer and cameras
let scene;
let renderer;
let camera;

// Map dimensions
let map, mapsx, mapsy;

// Latitude & longitude - image map end
let minlon = 8.4272, maxlon = 8.5405; // west, east
let minlat = 49.4669, maxlat = 49.5129; // south, north
let txwidth, txheight;
let psx, psy;
let locations = [];
let objects = [];
let lats = [], longs = [], nest;

init();
animate();

function init() {
    // Cameras initialization
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // Scene & renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Orbit controls
    camcontrols1 = new THREE.OrbitControls(camera, renderer.domElement);

    // Create map object
    mapsx = 5;
    mapsy = 5;
    addPlane(0, 0, 0, mapsx, mapsy);

    // Read csv file
    loadDataFromCsvFile();

    // Map texture
    loadMapTexture();
}

function clearScene() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}

function changeBoolean(variable) {
    variable = !variable;
}

function loadMapTexture() {
    const tx1 = new THREE.TextureLoader().load(
        "https://cdn.glitch.global/556683e7-b8fe-424a-9be3-61cde43de73b/map.png?v=1668976791138",

        // After loading
        function (texture) {
            // Dimensions
            // console.log(texture.image.width, texture.image.height);

            map.material.map = texture;
            map.material.needsUpdate = true;

            txwidth = texture.image.width;
            txheight = texture.image.height;

            // Adapt plane dimensions to the texture
            if (txheight > txwidth) {
                let factor = txheight / (maxlon - minlon);
                map.scale.set(1, factor, 1);
                mapsy *= factor;
            } else {
                let factor = txwidth / txheight;
                map.scale.set(factor, 1, 1);
                mapsx *= factor;
            }
        }
    );
}

function loadDataFromCsvFile() {
    var loader = new THREE.FileLoader();
    loader.load("../bike_mannheim.csv", function (text) {
        //console.log( text );
        let lines = text.split("\n");

        // Load csv file with bike locations
        nest = 0;
        for (let line of lines) {
            // Ignore first line - header line
            if (nest > 0) {
                // Separate lines by ;
                let values = line.split(";");
                // console.log(values);

                // Save locations in an array
                locations[nest - 1] = values[3].substring(1, values[3].length - 1);

                // Save latitude & longitude location in arrays
                // console.log("lat", values[1], "long", values[2]);
                lats[nest - 1] = Number(values[1]);
                longs[nest - 1] = Number(values[2]);
            }
            nest += 1;
        }

        // console.log("longs");
        // console.log(longs);
        // console.log("lats");
        // console.log(lats);

        // Create an object per location
        createSpherePerLocation();
    });
}

function createSpherePerLocation() {
    locations.forEach(myFunction);
    function myFunction(item, index, arr) {
        // Longitude increases to the right - x
        let mlon = mapping(longs[index], minlon, maxlon, -mapsx / 2, mapsx / 2);

        // Latitude increases upwards - y
        let mlat = mapping(lats[index], minlat, maxlat, -mapsy / 2, mapsy / 2);
        // console.log(mlon, mlat);
        drawSphere(mlon, mlat, 0, 0.02, 10, 10, 0xE800FF);
    }
}

// Value, source, range, destination range
function mapping(val, vmin, vmax, dmin, dmax) {
    // Normalizes value in the starting range, 5=0 in vmin, t=1 in vmax
    let t = 1 - (vmax - val) / (vmax - vmin);
    return dmin + t * (dmax - dmin);
}

function drawSphere(px, py, pz, radio, nx, ny, col) {
    let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
    let material = new THREE.MeshBasicMaterial({ color: col });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(px, py, pz);
    objects.push(mesh);
    scene.add(mesh);
}

function addPlane(px, py, pz, sx, sy) {
    let geometry = new THREE.PlaneBufferGeometry(sx, sy);
    let material = new THREE.MeshBasicMaterial({});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    map = mesh;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
