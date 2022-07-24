import * as THREE from "/js/three.module.js"
import {OrbitControls} from "/js/OrbitControls.js"

let w = window.innerWidth;
let h = window.innerHeight;

const canvas = $("canvas");

const scene = new THREE.Scene();

const toRad = deg => Math.PI * deg / 180;
const toDeg = rad => 180 * rad / Math.PI;


const camera = new THREE.PerspectiveCamera(60, w / h, 1, 100000);
const renderer = new THREE.WebGLRenderer({canvas: canvas[0], antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding;


let setupRenderer = () => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);

    $(window).on('resize', e => {
        w = window.innerWidth;
        h = window.innerHeight;

        renderer.setSize(w, h );

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });


    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

let setupLights = () => {
    let omni = new THREE.AmbientLight("white", 0.5);
    scene.add(omni);

    let point = new THREE.SpotLight("white", 1)
    point.position.y = 30;
    point.position.x = 40;
    point.position.z = -55;
    scene.add(point);

    point.castShadow = true;
    //point.shadowDarkness = 0.1;
    //point.shadow.camera.near = 10;
    //point.shadow.camera.far = 4000;
    point.shadow.mapSize = new THREE.Vector2(2048, 2048);
}

let TILE_SIZE = {x: 7, y: 0.5, z: 7};
let TILE_COUNT = {x: 5, z: 5};

const FRONT_SIDE_FIRST_VERTEX = 8   ;


let tiles = [];
let setupTiles = async () => {

    let frontMaterial = new THREE.MeshStandardMaterial({
        color: "white",
        map: await (new THREE.TextureLoader()).load("/img/dr_brown.jpg")
    })
    let backMaterial = new THREE.MeshStandardMaterial({
        color: "white",
    })
    let sideMaterial = new THREE.MeshStandardMaterial({
        color: "white",
    })

    let materials = [
        sideMaterial,
        sideMaterial,
        frontMaterial,
        backMaterial,
        sideMaterial,
        sideMaterial,
    ]

    for(let x = 0; x < TILE_COUNT.x; x++){
        for(let z = 0; z < TILE_COUNT.z; z++) {
            let geo = new THREE.BoxBufferGeometry(TILE_SIZE.x, TILE_SIZE.y, TILE_SIZE.z);
            let tile = new THREE.Mesh(geo, materials);

            tile.position.x = TILE_SIZE.x * (x - (TILE_COUNT.x - 1) / 2);
            tile.position.z = TILE_SIZE.z * ((TILE_COUNT.z - 1) / 2 - z);

            let uvAttribute = geo.attributes.uv;

            let minU = x * (1 / TILE_COUNT.x);
            let maxU = (x + 1) * (1 / TILE_COUNT.x);
            let minV = z * (1 / TILE_COUNT.z);
            let maxV = (z + 1) * (1 / TILE_COUNT.z);

            uvAttribute.setXY( FRONT_SIDE_FIRST_VERTEX + 0, minU, maxV);
            uvAttribute.setXY( FRONT_SIDE_FIRST_VERTEX + 1, maxU, maxV);
            uvAttribute.setXY( FRONT_SIDE_FIRST_VERTEX + 2, minU, minV);
            uvAttribute.setXY( FRONT_SIDE_FIRST_VERTEX + 3, maxU, minV);

            tile.receiveShadow = true;
            tile.castShadow = true;

            scene.add(tile);
            tiles.push(tile);
        }
    }
}

let setupContainer = () => {
    let mat = new THREE.MeshStandardMaterial({
        color: "white"
    })

    let geo = new THREE.BoxBufferGeometry(300, TILE_SIZE.y, 200);
    let wallBack = new THREE.Mesh(geo, mat);
    wallBack.position.z = -100 - TILE_SIZE.z * TILE_COUNT.z / 2;
    wallBack.receiveShadow = true;
    scene.add(wallBack);

    let wallFront = new THREE.Mesh(geo, mat);
    wallFront.position.z = 100 + TILE_SIZE.z * TILE_COUNT.z / 2;
    wallFront.receiveShadow = true;
    scene.add(wallFront);

    geo = new THREE.BoxBufferGeometry(300, TILE_SIZE.y, TILE_SIZE.z * TILE_COUNT.z);
    let wallRight = new THREE.Mesh(geo, mat);
    wallRight.position.x = 150 + TILE_SIZE.x * TILE_COUNT.x / 2;
    wallRight.receiveShadow = true;
    scene.add(wallRight);

    let wallLeft = new THREE.Mesh(geo, mat);
    wallLeft.position.x = -150 - TILE_SIZE.x * TILE_COUNT.x / 2;
    wallLeft.receiveShadow = true;
    scene.add(wallLeft);


}
let setupScene = async () => {
    scene.background = new THREE.Color( "black");
    setupContainer();
    setupTiles();

}

let setupCamera = () => {
    camera.position.z = 50;
    camera.position.y = 20;
    camera.position.x = 30;
    camera.lookAt(0, 0, 0);
}

const TILE_ANIMATION_DURATION_AVG = 4000;
const TILE_ANIMATION_DURATION_FUZZ = 800;
const fuzzAround = (avg, fuzz) => {
    return fuzz * (1 - Math.random() * 2) + avg;
}
let setupInteraction = () => {
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 50;
    controls.maxDistance = 250;

    canvas.click(e => {
        tiles.map(tile => {
            tile.rotation.z = toRad(Math.random() > 0.5 ? 360 : -360);
            new TWEEN.Tween(tile.rotation).to({z: 0}, fuzzAround(TILE_ANIMATION_DURATION_AVG, TILE_ANIMATION_DURATION_FUZZ))
                .easing(TWEEN.Easing.Elastic.Out)
                .delay(Math.random() * 1000)
                .start();
        })
    })
}

let render = function(now){
    TWEEN.update();
    renderer.render(scene, camera);
}


let init = async () => {
    setupRenderer();
    setupCamera();
    setupLights();
    setupInteraction();
    await setupScene();
    renderer.setAnimationLoop(now => render(now));

}
init();
