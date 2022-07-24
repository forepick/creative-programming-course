import * as THREE from "/js/three.module.js"
import {OrbitControls} from "/js/OrbitControls.js"

let w = window.innerWidth;
let h = window.innerHeight;

const canvas = $("canvas");

const scene = new THREE.Scene();
//scene.background = new THREE.Color( "black");

const camera = new THREE.PerspectiveCamera(60, w / h, 1, 100000);
const renderer = new THREE.WebGLRenderer({canvas: canvas[0], antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding;

let cube;

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
}

let setupLights = () => {
    let omni = new THREE.AmbientLight("white", 0.2);
    scene.add(omni);

    let point = new THREE.SpotLight("white", 0.8)
    point.position.y = 30;
    point.position.x = 40;
    scene.add(point);
}
let setupScene = async () => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath( '/img/env/' );
    let envCube;
    let envSphere;

     envCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] , function(e){
        console.log("env loaded");
    });

    const textureLoader = new THREE.TextureLoader();
    envSphere = textureLoader.load( '/img/env/spherical.jpg' );
    envSphere.mapping = THREE.EquirectangularReflectionMapping;
    envSphere.encoding = THREE.sRGBEncoding;

    envCube.mapping = THREE.CubeReflectionMapping;
    //envCube.mapping = THREE.CubeRefractionMapping;
    envCube.encoding = THREE.sRGBEncoding;

    console.log(envCube)
    let geo = new THREE.BoxBufferGeometry(10, 10, 10);
    let mat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        envMap: envCube,
        reflectivity: 0.5,
        refractionRatio: 0.98,
        metalness: 1,
        roughness: 0.1
    });

    mat.needsUpdate = true;

    scene.background = envCube;

    cube = new THREE.Mesh(geo, mat);
    scene.add(cube);
}

let setupCamera = () => {
    camera.position.z = 50;
    camera.position.y = 20;
    camera.lookAt(0, 0, 0);
}
let setupControls = () => {
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 50;
    controls.maxDistance = 250;
}

let render = function(now){
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}


let init = async () => {
    setupRenderer();
    setupCamera();
    setupLights();
    setupControls();
    await setupScene();
    renderer.setAnimationLoop(now => render(now));

}
init();
