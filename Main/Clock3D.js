
import * as THREE from "../moduleLibs/build/three.module.js";

export function createClock() {

  const clock = new THREE.Object3D();

  // Add body of the clock as an extrude Ring, from exercise 2 chapter 5
  const innerCircleRadius = 2;
  const outerCircleRadius = 2.2;
  const bodyMaterial = new THREE.MeshBasicMaterial({color:"#94bebe"});
  const outerCircle = new THREE.Shape();
  outerCircle.moveTo(outerCircleRadius, 0);
  const innerCircle = new THREE.Shape();
  innerCircle.moveTo(innerCircleRadius, 0);
  const N = 100;
  const deltaPhi = 2*Math.PI / N;

  for(let k=1; k<=N; ++k){
    outerCircle.lineTo(outerCircleRadius*Math.cos(k*deltaPhi), outerCircleRadius*Math.sin(k*deltaPhi));
    innerCircle.lineTo(innerCircleRadius*Math.cos(k*deltaPhi), innerCircleRadius*Math.sin(k*deltaPhi));
  }

  outerCircle.holes.push(innerCircle);

  const extrudeOpts = {
    depth: 0.4,
    bevelEnabled: false,
  };

  const extrudeGeo = new THREE.ExtrudeGeometry(outerCircle, extrudeOpts);
  const extrudeRing = new THREE.Mesh(extrudeGeo, bodyMaterial );

  clock.add(extrudeRing);


  // Add the white field of the clock as a cylinder
  const cylinderRadius = 2;
  const cylinderHeight = 0.2;
  const cylinderPositionZ = 0.2; //Half of depth of the body of the clock, so that it has a 0.1 protection in the front and in the back as well
  const radialSegments = 100;
  const fieldMaterial = new THREE.MeshBasicMaterial({color:"#ffffff"});
  const whiteField = new THREE.Mesh( new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, radialSegments), fieldMaterial );
  whiteField.position.set(0, 0, cylinderPositionZ);
  whiteField.rotation.set(Math.PI/2, 0, 0); // Math.PI/2 so that the white field is in the same plane as the body of the clock
  clock.add(whiteField);


  // Add big ticks
  const bigTickWidth = 0.08;
  const bigTickHeight = 0.55;
  const tickDepth = 0.001; // very small so that it looks like a 2D rectangular
  const ticksGapFromBorders = 0.05; // a small gap for the big ticks from the borders of the body of the clock
  const bigTickPositionY = innerCircleRadius - bigTickHeight/2 - ticksGapFromBorders //positioning the big ticks correctly

  const tickPositionZ = cylinderHeight/2 + cylinderPositionZ // positioning all the ticks(big and small) correctly regarding the Z axis
  const ticksMaterial = new THREE.MeshBasicMaterial({color:"black"});

  const firstBigTickMaterial = new THREE.MeshBasicMaterial({color:"#94bebe"});
  const firstBigTick = new THREE.Mesh(new THREE.BoxGeometry(bigTickWidth, bigTickHeight, tickDepth), firstBigTickMaterial);
  firstBigTick.position.set(0, bigTickPositionY, tickPositionZ)

  const firstBigTickBack = firstBigTick.clone();
  firstBigTickBack.position.set(0, bigTickPositionY, tickPositionZ - cylinderPositionZ);

  clock.add(firstBigTick);
  clock.add(firstBigTickBack);

  const omega = Math.PI/6; // 360° over 12, for each position of the big ticks

  for(let k = 1; k < 12; k++) // starting from 1 because the first tick is already positioned
  {
    const bigTicksFront = new THREE.Mesh(new THREE.BoxGeometry(bigTickWidth, bigTickHeight, tickDepth), ticksMaterial);
    bigTicksFront.position.set(-bigTickPositionY * Math.sin(k*omega), bigTickPositionY *  Math.cos(k*omega), tickPositionZ);
    bigTicksFront.rotation.set(0, 0, k * omega);
    const bigTicksBack = bigTicksFront.clone();
    bigTicksBack.position.setZ(tickPositionZ - cylinderPositionZ);
    clock.add(bigTicksFront);
    clock.add(bigTicksBack);
  }


  // Add small Ticks
  const smallTickWidth = 0.04;
  const smallTickHeight = 0.25;
  const smallTickPositionY = innerCircleRadius - smallTickHeight/2 // for small ticks there is no gap from the borders of the body
  const theta = Math.PI/30; //360° over 60, for each position of the small ticks ticks

  for(let k = 1; k < 60; k++){
    if(k%5 == 0) // every five minutes there is a big tick, so no need for a small tick
      continue;

    const smallTicksFront = new THREE.Mesh(new THREE.BoxGeometry(smallTickWidth, smallTickHeight, tickDepth), ticksMaterial);
    smallTicksFront.position.set(-smallTickPositionY * Math.sin(k*theta), smallTickPositionY *  Math.cos(k*theta), tickPositionZ);
    smallTicksFront.rotation.set(0, 0, k * theta);
    const smallTicksBack = smallTicksFront.clone();
    smallTicksBack.position.setZ(tickPositionZ - cylinderPositionZ);
    clock.add(smallTicksFront);
    clock.add(smallTicksBack);
  } 


  // Add hour-hands
  const handMaterial = new THREE.MeshBasicMaterial({color:"#000036"});
  const hourHandLength = 0.45;
  const handPositionZ = cylinderHeight/2 + cylinderPositionZ + 0.05; // same as tickPositionZ, with a 0.05 to prevent the fighting between the white field and the hands in the Z direction
  const handPositionBackZ = cylinderHeight/2 - 0.05; // 0.05 to prevent fighting
  const hourHand = new THREE.Mesh(new THREE.SphereGeometry(hourHandLength), handMaterial);
  hourHand.scale.x = 0.08;
  hourHand.scale.z = 0.05;

  const hourHandBack = hourHand.clone();

  // the positiiong of the hands is done in the functions which determine the actual time
  clock.add(hourHand);
  clock.add(hourHandBack);


  // Add minute-hands
  const minuteHandLength = 0.7;
  const minuteHand = new THREE.Mesh(new THREE.SphereGeometry(minuteHandLength), handMaterial);
  minuteHand.scale.x = 0.08;
  minuteHand.scale.z = 0.05;

  const minuteHandBack = minuteHand.clone();

  clock.add(minuteHand);
  clock.add(minuteHandBack);


  // Add second-hands
  const secondHandLength = 0.8;
  const secondHandMaterial = new THREE.MeshBasicMaterial({color:"black"});
  const secondHand = new THREE.Mesh(new THREE.SphereGeometry(secondHandLength), secondHandMaterial);
  secondHand.scale.x = 0.03; // the second hand is thinner than the two others
  secondHand.scale.z = 0.01;

  const secondHandBack = secondHand.clone();

  clock.add(secondHand);
  clock.add(secondHandBack);


  // Add blob
  const blobMaterial = new THREE.MeshBasicMaterial({color:"#3d0101"});
  const blob = new THREE.Mesh(new THREE.SphereGeometry(0.1), blobMaterial);
  blob.position.setZ(cylinderHeight/2 + cylinderPositionZ); //same as tickPositionZ
  blob.scale.z = 0.5;

  const blobBack = blob.clone();
  blobBack.position.setZ(cylinderHeight/2);

  clock.add(blob);
  clock.add(blobBack);


  // Calculate the time in Hamburg
  function timeInHambrurg() {
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    hour += minute/60; // for making the hour hand move a bit for every minute that passes, to give the feeling of a real clock
    let second = date.getSeconds();

    secondHand.position.set(-secondHandLength * Math.sin(-second*theta), secondHandLength * Math.cos(-second*theta), handPositionZ);
    secondHand.rotation.set(0, 0, -second*theta);

    minuteHand.position.set(-minuteHandLength * Math.sin(-minute*theta), minuteHandLength * Math.cos(-minute*theta), handPositionZ);
    minuteHand.rotation.set(0, 0, -minute*theta);

    hourHand.position.set(-hourHandLength * Math.sin(-hour*omega), hourHandLength * Math.cos(-hour*omega), handPositionZ);
    hourHand.rotation.set(0, 0, -hour*omega);
  }


  // Calculate the time in Japan
  function timeInJapan() {
    let date = new Date();
    date.setHours(date.getHours() + 8); // 8 hours is the differnece between Hamburg time and Japan time
    let hour = date.getHours();
    let minute = date.getMinutes();
    hour += minute/60; // for making the hour hand move a bit for every minute that passes, to give the feeling of a real clock
    let second = date.getSeconds();

    secondHandBack.position.set(-secondHandLength * Math.sin(second*theta), secondHandLength * Math.cos(second*theta), handPositionBackZ);
    secondHandBack.rotation.set(0, 0, second*theta);

    minuteHandBack.position.set(-minuteHandLength * Math.sin(minute*theta), minuteHandLength * Math.cos(minute*theta), handPositionBackZ);
    minuteHandBack.rotation.set(0, 0, minute*theta);

    hourHandBack.position.set(-hourHandLength * Math.sin(hour*omega), hourHandLength * Math.cos(hour*omega), handPositionBackZ);
    hourHandBack.rotation.set(0, 0, hour*omega);
  }

  // setting the correct time in the beginning
  timeInHambrurg();
  timeInJapan();

  setInterval(timeInHambrurg, 1000);
  setInterval(timeInJapan, 1000);
  
  return clock;

}