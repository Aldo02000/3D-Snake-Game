/* global THREE */

import * as THREE from "../moduleLibs/build/three.module.js";
import { OBJLoader } from "../moduleLibs/examples/jsm/loaders/OBJLoader.js"
import { TrackballControls } from "../moduleLibs/examples/jsm/controls/TrackballControls.js"
import { createClock } from "./Clock3D.js"


// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setClearColor('rgb(255,255,255)');
renderer.shadowMap.enabled = true;

// Create the scene
const scene = new THREE.Scene();

// Add camera and control
const camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 100);
camera.position.set(0, -15, 10);
scene.add(camera);
camera.lookAt(scene.position);
const controls = new TrackballControls(camera, renderer.domElement);


// Adding the Spotlight and the Ambient light
const spotLight = new THREE.SpotLight("rgb(255, 255, 255)");
spotLight.position.set(0,0,13);
spotLight.angle = Math.PI/2.5;
spotLight.castShadow = true;
scene.add(spotLight);
const al = new THREE.AmbientLight();
al.color = new THREE.Color(0.4, 0.4, 0.4);
scene.add(al);


// Add SkyBox
const loader = new THREE.TextureLoader();

const urls = [
  "resources/skybox/right.jpg",
  "resources/skybox/left.jpg",
  "resources/skybox/top.jpg",
  "resources/skybox/bottom.jpg",
  "resources/skybox/front.jpg",
  "resources/skybox/back.jpg",
];

let matArray = [];
urls.forEach(tn => {
  const txt = loader.load(tn);
  matArray.push(new THREE.MeshBasicMaterial({map:txt,
                                             side:THREE.DoubleSide}));
});

let skyBoxGeo = new THREE.BoxGeometry(50, 50, 50);
let skyBox = new THREE.Mesh(skyBoxGeo, matArray);
skyBox.rotation.x = Math.PI/2;
scene.add(skyBox);

// Create the ground
const groundMaterial = new THREE.MeshPhongMaterial({color:"gray"});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), groundMaterial);
ground.position.z = -0.01;
ground.receiveShadow = true;
scene.add(ground);

// Create the playing field
const fieldTxt = loader.load("resources/FloorsCheckerboard_S_Diffuse.jpg");
const fieldNormalTxt = loader.load("resources/FloorsCheckerboard_S_Normal.jpg");
const fieldMaterial = new THREE.MeshPhongMaterial({color:"#bfbfbf", map: fieldTxt, normalMap:fieldNormalTxt});
const playingField1 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), fieldMaterial);
const playingField2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), fieldMaterial);
const playingField3 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), fieldMaterial);
const playingField4 = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), fieldMaterial);
playingField1.rotation.set(0, 0, Math.PI/2);
playingField2.rotation.set(0, 0, Math.PI/2);
playingField3.rotation.set(0, 0, Math.PI/2);
playingField4.rotation.set(0, 0, Math.PI/2);
playingField1.position.set(3, 3, 0);
playingField2.position.set(3, -3, 0);
playingField3.position.set(-3, -3, 0);
playingField4.position.set(-3, 3, 0);
playingField1.receiveShadow = true;
playingField2.receiveShadow = true;
playingField3.receiveShadow = true;
playingField4.receiveShadow = true;
scene.add(playingField1);
scene.add(playingField2);
scene.add(playingField3);
scene.add(playingField4);

// Adding Walls
const wallTxt = loader.load("resources/hardwood2_diffuse.jpg");
const wallBump = loader.load("resources/hardwood2_bump.jpg");

const wallMat = new THREE.MeshPhongMaterial({map: wallTxt, bumpMap: wallBump, bumpScale: 0.1});
const wallWidth = 0.3;
const wall1 = new THREE.Mesh(new THREE.BoxGeometry(12, wallWidth, 1), wallMat);
const wall2 = new THREE.Mesh(new THREE.BoxGeometry(12, wallWidth, 1), wallMat);
const wall3 = new THREE.Mesh(new THREE.BoxGeometry(12.6, wallWidth, 1), wallMat);
const wall4 = new THREE.Mesh(new THREE.BoxGeometry(12.6, wallWidth, 1), wallMat);
wall1.position.set(0, 6 + wallWidth/2, 0.5)
wall2.position.set(0, -6 - wallWidth/2, 0.5)
wall3.position.set(6 + wallWidth/2, 0, 0.5)
wall3.rotation.z = Math.PI / 2;
wall4.position.set(-6 - wallWidth/2, 0, 0.5)
wall4.rotation.z = Math.PI / 2;
wall1.castShadow = true;
wall2.castShadow = true;
wall3.castShadow = true;
wall4.castShadow = true;
scene.add(wall1);
scene.add(wall2);
scene.add(wall3);
scene.add(wall4);

// Add Grid
const grid = new THREE.GridHelper(12, 12, "black", "black");
grid.position.set(0, 0, 0.001); // 0.001 to prevent fighting between the playing field and the grid
grid.rotation.set(Math.PI/2, 0, 0)
scene.add(grid);

// Add initial snake
const snakeTxt = loader.load("resources/lavatile.jpg");

const headMaterial = new THREE.MeshPhongMaterial({color:"#ffffff", map:snakeTxt});
const head = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95), headMaterial);
const randomPostionSnakeX = 0.5 + Math.pow(-1, Math.round(10*Math.random())) * Math.floor(6*Math.random()); // making x position random
const randomPostionSnakeY = 0.5 + Math.pow(-1, Math.round(10*Math.random())) * Math.floor(6*Math.random()); // making y position random
head.position.set(randomPostionSnakeX, randomPostionSnakeY, 0.95/2 +0.01); // 0.01 to prevent fighting between the playing field and the snake
const snakeQueue = new Deque();
snakeQueue.insertBack(head);
const snakeHead = snakeQueue.getValues()[0]
snakeHead.castShadow = true;
scene.add(snakeHead);


// Add Apple as ball

function positionBall() {
  const randomPositionBallX = 0.5 + Math.pow(-1, Math.round(10*Math.random())) * Math.floor( 5*Math.random());
  const randomPositionBallY = 0.5 + Math.pow(-1, Math.round(10*Math.random())) * Math.floor( 5*Math.random());
  ball.position.set(randomPositionBallX, randomPositionBallY, 0.5 + 0.01); // 0.01 to prevent fighting between the playing field and the ball
}

const appleTxt = loader.load("resources/Apple_BaseColor.png");
const appleNormalTxt = loader.load("resources/Apple_Normal.png");
const appleSpecularTxt = loader.load("resources/Apple_Roughness.png");
let ball = new THREE.Object3D();
const ballMaterial = new THREE.MeshPhongMaterial({color:"#ffffff", map:appleTxt, normalMap:appleNormalTxt, specularMap:appleSpecularTxt})
const Objectloader = new OBJLoader();

Objectloader.load(
	// resource URL
	'resources/Apple.obj',
	// called when resource is loaded
	function ( apple ) {
    ball = apple;
    ball.children.forEach(c => c.material = ballMaterial);
    ball.scale.set(0.01,0.01,0.01);
    ball.rotation.x = Math.PI/2;
    positionBall();
    scene.add(ball);
	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

// check if the ball is on the snake and position it elsewhere if so
function isBallOnTheSnake() {
  snakeQueue.getValues().forEach( element => {
      if (element.position.x == ball.position.x && element.position.y == ball.position.y){
        positionBall();
      }
    });
}

// Checking the arrow buttons pressed
let speed = new THREE.Vector3(0, 0, 0);
let direction = "";
function ArrowsPushed(event) {

  if(event.key === "ArrowLeft"  && (direction == "Vertical" || direction == "")) {
    speed.x = -1;
    speed.y = 0;
    direction = "Horizontal";
  }
  if(event.key === "ArrowRight" && (direction == "Vertical" || direction == "")) {
    speed.x = 1;
    speed.y = 0;
    direction = "Horizontal";
  }
  if(event.key === "ArrowUp" && (direction == "Horizontal" || direction == "")) {
    speed.y = 1;
    speed.x = 0;
    direction = "Vertical";
  }
  if(event.key === "ArrowDown" && (direction == "Horizontal" || direction == "")) {
    speed.y = -1;
    speed.x = 0;
    direction = "Vertical";
  }
}

// Check if snake is out of the field and alert Game Over if so, and also restart the game when the ok button of alert is pressed
function isSnakeOutOfTheField() {
  if(Math.abs(snakeHead.position.x) > 6 || Math.abs(snakeHead.position.y) > 6) {
    alert("Game over. Length of the snake is " + snakeQueue.size());
    window.location.reload();
    return false();
  }
}

// Make the snake longer every time it eats the ball
function makeSnakeLonger() {

  if(snakeQueue.size() == 1){
    const snakeMaterial = new THREE.MeshBasicMaterial({color:"#bfbfbf" , map:snakeTxt});
    const snakeBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95), snakeMaterial);
    snakeBox.castShadow = true;
    scene.add(snakeBox);
    snakeQueue.insertBack(snakeBox);
  }
  else {
    const lastBox = snakeQueue.getBack();
    const newLastBox = lastBox.clone();
    newLastBox.castShadow = true;
    scene.add(newLastBox);
    snakeQueue.insertBack(newLastBox);
  }
    
}

// Checking if the ball is eaten and make snake longer if so
function eatingTheBall() {
  if(snakeHead.position.x == ball.position.x && snakeHead.position.y == ball.position.y) {
    setTimeout(makeSnakeLonger, 250);
    positionBall();  
  }
}

// Count the number of blue boxes(snake body) to check if the snake eats itself
let blueBoxes = new Array();

// Check if the snake eats itself, alert Game Over if so, and restart the game when the ok button of the alert is pressed
function EatingItSelf() {
  blueBoxes.forEach( element => {
      if (element.position.x == snakeHead.position.x && element.position.y == snakeHead.position.y){
        alert("Game Over. Length of the snake is " + snakeQueue.size());
        window.location.reload();
        return false();
      }
    });
}

// Moving the snake accordingly, by placing every box at the place of the last box before that
function moveSnake() {
  const positionOfHead = snakeHead.position.clone();
  snakeHead.position.add(speed);

  if(snakeQueue.size() > 1) {
    let currentPosition = positionOfHead;
    for (let k = 1; k < snakeQueue.size(); k++) {
      let nextBox = snakeQueue.getValues()[k];
      blueBoxes.push(nextBox); // adding every next box to the blue box array to use it in the EatingItself() function
      let nextBoxPosition = nextBox.position.clone();
      nextBox.position.copy(currentPosition);
      currentPosition = nextBoxPosition;
    }
  }  
}

// The display board
const dsiplayBoardMat = new THREE.MeshPhongMaterial({color:"#bfbfbf"});
const displayBoard = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 3), dsiplayBoardMat);
displayBoard.position.set(0, 8, 2.2)
displayBoard.castShadow = true;
scene.add(displayBoard);

// Adding the clock
let clock3D = new createClock();
clock3D.scale.set(0.3, 0.3, 0.3);
clock3D.rotation.x = Math.PI/2;
clock3D.position.set(4, -0.1, 0.8)
displayBoard.add(clock3D);

// Create render target
const targetPlaneSize = {width: 8, height: 3};
const renderTarget = new THREE.WebGLRenderTarget(targetPlaneSize.width * 512, targetPlaneSize.height * 512);
const targetPlaneMat = new THREE.MeshPhongMaterial({map: renderTarget.texture});
const targetPlane = new THREE.Mesh(new THREE.PlaneGeometry(targetPlaneSize.width, targetPlaneSize.height), targetPlaneMat);
targetPlane.rotation.x = Math.PI/2;
targetPlane.position.set(-1,-0.1,0);
targetPlaneMat.needsUpdate = true;
displayBoard.add(targetPlane);

//dynamic camera
const camera2 = new THREE.PerspectiveCamera( 60, renderTarget.width / renderTarget.height, 0.5, 10);


// The render loop
let last = 0; //using a last variable to make the movement of the snake every 250 seconds without having to use setInterval()

function render(now) {
  
  if(now - last >= 250) {
        last = now;
        moveSnake();
        camera2.position.set(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z);
        camera2.up = new THREE.Vector3(0,0,1);
        camera2.lookAt(snakeHead.position.clone().add(speed));
        document.addEventListener("keydown", ArrowsPushed, {once: true});
        eatingTheBall();
  }
  
  isSnakeOutOfTheField();
  EatingItSelf();
  isBallOnTheSnake();
  
  clock3D = new createClock();
 
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera2);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  requestAnimationFrame(render);
  controls.update();
}

render();





// * Deque: https://learnersbucket.com/tutorials/data-structures/implement-deque-data-structure-in-javascript/

function Deque() {
  //To track the elements from back
  let count = 0;

  //To track the elements from the front
  let lowestCount = 0;

  //To store the data
  let items = {};
  this.getValues = () => {return Object.values(items);};

  //Add an item on the front
  this.insertFront = (elm) => {

    if(this.isEmpty()){
      //If empty then add on the back
      this.insertBack(elm);

    }else if(lowestCount > 0){
      //Else if there is item on the back
      //then add to its front
      items[--lowestCount] = elm;

    }else{
      //Else shift the existing items
      //and add the new to the front
      for(let i = count; i > 0; i--){
        items[i] = items[i - 1];
      }

      count++;
      items[0] = elm;
    }
  };

  //Add an item on the back of the list
  this.insertBack = (elm) => {
    items[count++] = elm;
  };

  //Remove the item from the front
  this.removeFront = () => {
    //if empty return null
    if(this.isEmpty()){
      return null;
    }

    //Get the first item and return it
    const result = items[lowestCount];
    delete items[lowestCount];
    lowestCount++;
    return result;
  };

  //Remove the item from the back
  this.removeBack = () => {
    //if empty return null
    if(this.isEmpty()){
      return null;
    }

    //Get the last item and return it
    count--;
    const result = items[count];
    delete items[count];
    return result;
  };

  //Peek the first element
  this.getFront = () => {
    //If empty then return null
    if(this.isEmpty()){
      return null;
    }

    //Return first element
    return items[lowestCount];
  };

  //Peek the last element
  this.getBack = () => {
    //If empty then return null
    if(this.isEmpty()){
      return null;
    }

    //Return last element
    return items[count - 1];
  };

  //Check if empty
  this.isEmpty = () => {
    return this.size() === 0;
  };

  //Get the size
  this.size = () => {
    return count - lowestCount;
  };

  //Clear the deque
  this.clear = () => {
    count = 0;
    lowestCount = 0;
    items = {};
  };

  //Convert to the string
  //From front to back
  this.toString = () => {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${items[lowestCount]}`;
    for (let i = lowestCount + 1; i < count; i++) {
      objString = `${objString},${items[i]}`;
    }
    return objString;
  };
}
