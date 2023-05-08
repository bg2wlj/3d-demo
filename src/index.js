import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUIPanel } from "@components";
import { ValveMesh, PipelineMesh, CircuitMesh } from '@objects';
import { CIRCUIT_TYPE, COLOR, INPUTS } from '@constants';
import { Utils } from '@utils';

let camera, scene, renderer, controls, stats, gui;

let valves_mesh; //开关
let pipelines_mesh; //管道
let circuit_mesh; //线路 = 开关 + 管道
let all_mesh; //开关 + 管道 + 外载模型 


const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);
const test_inputs = INPUTS.input;

init();
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-6, 1.2, -15);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(-6.5, 1, -16);
  controls.update();


  // LIGHT

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight1.position.set(0, 20, 0);
  dirLight1.castShadow = false;
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight2.position.set(20, 0, 0);
  dirLight2.castShadow = false;
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight3.position.set(0, 0, 20);
  dirLight3.castShadow = false;
  scene.add(dirLight3);

  const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight4.position.set(0, -20, 0);
  dirLight4.castShadow = false;
  scene.add(dirLight4);

  const dirLight5 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight5.position.set(-20, 0, 0);
  dirLight5.castShadow = false;
  scene.add(dirLight5);

  const dirLight6 = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight6.position.set(0, 0, -20);
  dirLight6.castShadow = false;
  scene.add(dirLight6);

  // GROUND

  const geometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: COLOR.WHITE });

  const ground = new THREE.Mesh(geometry, planeMaterial);

  ground.position.set(0, -1, 0);
  ground.rotation.x = - Math.PI / 2;
  ground.scale.set(100, 100, 100);

  ground.castShadow = false;
  ground.receiveShadow = false;

  scene.add(ground);

  // GRID

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);


  all_mesh = new THREE.Group();
  circuit_mesh = new THREE.Group();

  Utils.connectFromHere(test_inputs);

  // 开关初始化
  valves_mesh = new ValveMesh(test_inputs, onValveClick);

  circuit_mesh.add(valves_mesh.render());


  // 管道初始化
  pipelines_mesh = new PipelineMesh(test_inputs, onPipelineClick);

  circuit_mesh.add(pipelines_mesh.render());

  all_mesh.add(circuit_mesh);

  scene.add(all_mesh);

  loader.load(
    '../models/3d_house.gltf',
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          node.userData.clickable = false;
        }
      })
      //注释下面两行不显示房间 
      scene.add(gltf.scene);
      all_mesh.add(gltf.scene);

      gltf.animations;
      gltf.scene.scale.set(2, 2, 2);
      gltf.scene.rotation.x -= Math.PI * 0.5;
      gltf.scene.position.setX(-20);
      gltf.scene.position.setZ(15);
      gltf.scene.position.setY(-1);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened: ' + error);
    }
  );

  circuit_mesh.scale.set(0.2, 0.2, 0.2);

  stats = new Stats();
  document.body.appendChild(stats.dom);

  gui = new GUIPanel('gui-container');

  window.addEventListener('resize', onWindowResize);
  document.getElementsByTagName("canvas")[0] && document.getElementsByTagName("canvas")[0].addEventListener('click', onGlobalClick);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onGlobalClick(event) {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObject(all_mesh);

  if (intersection.length > 0) {

    if (intersection[0].object.userData.isValveMesh) {

      const instanceId = intersection[0].instanceId;

      const clickInstance = CircuitMesh.findByIndex(instanceId, test_inputs, CIRCUIT_TYPE.VALVE);

      if (!!clickInstance && clickInstance.clickable) {

        clickInstance.onClickEvent();

      }

    }

    if (intersection[0].object.userData.isPipelineMesh) {

      const instanceId = intersection[0].instanceId;

      const clickInstance = CircuitMesh.findByIndex(instanceId, test_inputs, CIRCUIT_TYPE.PIPELINE);

      if (!!clickInstance && clickInstance.clickable) {

        clickInstance.onClickEvent();

      }

    }

  }

}



function animate() {

  // let cameraDirection = new THREE.Vector3();
  // camera.getWorldDirection(cameraDirection);
  // console.log(cameraDirection);

  console.log(controls.target);

  requestAnimationFrame(animate);

  // controls.target = new THREE.Vector3(camera.position.x - 0.5, camera.position.y, camera.position.z - 1)

  // controls.update();

  raycaster.setFromCamera(mouse, camera);

  render();

  stats.update();

}

function render() {

  renderer.render(scene, camera);

}

function onValveClick(valveProps) {

  gui.populateInfo(valveProps.information, valveProps.isValveOn)

  gui.onValveStatusUpdate(() => {
    valveProps.isValveOn = !valveProps.isValveOn;
    updatePipelineConnectStatus(valveProps);
    valves_mesh.rerender();
    pipelines_mesh.rerender();
  });

}

function onPipelineClick(pipelineProps) {
  gui.populateInfo(pipelineProps.information);
}

function updatePipelineConnectStatus(valveProps) {

  const isConnected = !!valveProps.isConnected;
  const childs = valveProps.child;

  if (childs) {
    if (isConnected) {
      Utils.connectFromHere([valveProps]);
    } else {
      Utils.disconnectFromHere(valveProps.child);
    }
  }

}