document.addEventListener("DOMContentLoaded", function() {

const mainMenu = document.getElementById("mainMenu");
const dogsScreen = document.getElementById("dogsScreen");
const gameScreen = document.getElementById("gameScreen");

const dogsButton = document.getElementById("dogsButton");
const backButton = document.getElementById("backButton");
const playButton = document.getElementById("playButton");
const gameBackButton = document.getElementById("gameBackButton");

const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");

const bestScoreDisplay = document.getElementById("bestScore");
const scoreDisplay = document.getElementById("score");
const invincibilityDisplay = document.getElementById("invincibility");
const gameOverFlash = document.getElementById("gameOverFlash");

const dog = document.getElementById("dog");
const gameWorld = document.getElementById("gameWorld");

const gear = document.getElementById("gear");
const spike = document.getElementById("spike");
const cannon = document.getElementById("cannon");
const electricWire = document.getElementById("electricWire");
const beam = document.getElementById("beam");
const slimeWall = document.getElementById("slimeWall");
const portal = document.getElementById("portal");
const mace = document.getElementById("mace");
const fireSpinner = document.getElementById("fireSpinner");
const boxingGlove = document.getElementById("boxingGlove");
const trampoline = document.getElementById("trampoline");
const electricCubes = document.getElementById("electricCubes");
const batteryLaser = document.getElementById("batteryLaser");

/* =========================
AUDIO
========================= */

let audioContext = null;
let musicGain = null;
let musicTimer = null;
let musicStep = 0;

function ensureAudio() {

if (audioContext) {

if (audioContext.state === "suspended") {
audioContext.resume();
}

return;
}

try {

const AudioContext =
window.AudioContext ||
window.webkitAudioContext;

if (!AudioContext) {
return;
}

audioContext =
new AudioContext();

musicGain =
audioContext.createGain();

musicGain.gain.value =
0.045;

musicGain.connect(
audioContext.destination
);

} catch (error) {

audioContext = null;
}

}

function playTone(
frequency,
duration,
type,
volume,
startDelay
) {

if (!audioContext) {
return;
}

try {

const oscillator =
audioContext.createOscillator();

const gain =
audioContext.createGain();

const start =
audioContext.currentTime +
(startDelay || 0);

oscillator.type =
type || "sine";

oscillator.frequency.setValueAtTime(
frequency,
start
);

gain.gain.setValueAtTime(
0.0001,
start
);

gain.gain.exponentialRampToValueAtTime(
volume || 0.08,
start + 0.01
);

gain.gain.exponentialRampToValueAtTime(
0.0001,
start + duration
);

oscillator.connect(gain);
gain.connect(
audioContext.destination
);

oscillator.start(start);

oscillator.stop(
start + duration + 0.02
);

} catch (error) {}

}

function playJumpSound() {

ensureAudio();

if (!audioContext) {
return;
}

playTone(
520,
0.08,
"square",
0.055
);

playTone(
720,
0.06,
"sine",
0.035,
0.045
);

}

function playCannonSound() {

ensureAudio();

if (!audioContext) {
return;
}

playTone(
90,
0.18,
"sawtooth",
0.13
);

playTone(
180,
0.12,
"square",
0.08,
0.05
);

playTone(
420,
0.2,
"sine",
0.07,
0.1
);

}

function playPortalSound() {

ensureAudio();

if (!audioContext) {
return;
}

playTone(
220,
0.18,
"sine",
0.07
);

playTone(
330,
0.18,
"sine",
0.06,
0.07
);

playTone(
660,
0.25,
"triangle",
0.06,
0.14
);

}

function playGameOverSound() {

ensureAudio();

if (!audioContext) {
return;
}

playTone(
180,
0.18,
"sawtooth",
0.12
);

playTone(
120,
0.22,
"sawtooth",
0.10,
0.12
);

playTone(
60,
0.32,
"square",
0.08,
0.25
);

}

function musicTick() {

if (
!audioContext ||
!musicGain
) {
return;
}

const notes = [
261.63,
329.63,
392.00,
329.63,
293.66,
349.23,
440.00,
349.23
];

const note =
notes[
musicStep %
notes.length
];

const oscillator =
audioContext.createOscillator();

const gain =
audioContext.createGain();

oscillator.type =
"triangle";

oscillator.frequency.value =
note;

gain.gain.setValueAtTime(
0.0001,
audioContext.currentTime
);

gain.gain.exponentialRampToValueAtTime(
0.045,
audioContext.currentTime + 0.02
);

gain.gain.exponentialRampToValueAtTime(
0.0001,
audioContext.currentTime + 0.22
);

oscillator.connect(gain);
gain.connect(musicGain);

oscillator.start();

oscillator.stop(
audioContext.currentTime + 0.24
);

musicStep++;

}

function startMusic() {

ensureAudio();

if (
!audioContext ||
musicTimer
) {
return;
}

musicStep = 0;

musicTick();

musicTimer =
setInterval(
musicTick,
300
);

}

function stopMusic() {

if (musicTimer) {

clearInterval(
musicTimer
);

musicTimer = null;
}

}

/* =========================
SAVE / LOAD
UNCHANGED
========================= */

let saveData = {
bestScore: 0,
unlockedDogs: ["street"],
selectedDog: "street"
};

let bestScore =
saveData.bestScore;

const validDogIds = [
"street",
"romantic",
"stray",
"persian",
"love",
"bad",
"pretty",
"police"
];

function createSaveCode() {

let dogs =
saveData.unlockedDogs.filter(
function(id) {
return validDogIds.includes(id);
}
);

if (!dogs.includes("street")) {
dogs.unshift("street");
}

let score =
Math.floor(
Number(saveData.bestScore) || 0
);

if (score < 0) {
score = 0;
}

let selected =
saveData.selectedDog;

if (!dogs.includes(selected)) {
selected = "street";
}

return (
"DOGJUMP|" +
score +
"|" +
dogs.join(",") +
"|" +
selected
);

}

function loadSaveCode(code) {

if (typeof code !== "string") {
return false;
}

code = code.trim();

const parts =
code.split("|");

if (parts.length !== 4) {
return false;
}

if (parts[0] !== "DOGJUMP") {
return false;
}

const newBest =
Number(parts[1]);

if (
!Number.isFinite(newBest) ||
newBest < 0
) {
return false;
}

let newDogs =
parts[2]
.split(",")
.filter(
function(id) {
return validDogIds.includes(id);
}
);

if (!newDogs.includes("street")) {
newDogs.unshift("street");
}

let newSelected =
parts[3];

if (!newDogs.includes(newSelected)) {
newSelected = "street";
}

saveData = {
bestScore: Math.floor(newBest),
unlockedDogs: newDogs,
selectedDog: newSelected
};

bestScore =
saveData.bestScore;

updateBestScoreDisplay();
updateDogMenu();
updateDogAppearance();

return true;

}

function updateBestScoreDisplay() {

bestScoreDisplay.textContent =
"BEST: " +
bestScore +
"m";

}

const dogUnlocks = {
romantic: 100,
stray: 200,
persian: 300,
love: 400,
bad: 500,
pretty: 600,
police: 700
};

function updateDogMenu() {

document
.querySelectorAll(".dog-card")
.forEach(function(card) {

const dogId =
card.dataset.dog;

const status =
card.querySelector(
".dog-status"
);

card.classList.remove(
"locked"
);

card.classList.remove(
"selected"
);

if (
!saveData.unlockedDogs.includes(
dogId
)
) {

card.classList.add(
"locked"
);

status.textContent =
"🔒 " +
dogUnlocks[dogId] +
"m";

} else {

if (
saveData.selectedDog ===
dogId
) {

card.classList.add(
"selected"
);

status.textContent =
"✓ SELECTED";

} else {

status.textContent =
"✓ UNLOCKED";

}

}

});

}

function updateDogAppearance() {

dog.classList.remove(
"dog-street",
"dog-romantic",
"dog-stray",
"dog-persian",
"dog-love",
"dog-bad",
"dog-pretty",
"dog-police"
);

dog.classList.add(
"dog-" +
saveData.selectedDog
);

}

function checkDogUnlocks() {

const score =
Math.max(
bestScore,
metres
);

for (
const dogId in dogUnlocks
) {

if (
score >= dogUnlocks[dogId] &&
!saveData.unlockedDogs.includes(
dogId
)
) {

saveData.unlockedDogs.push(
dogId
);

}

}

updateDogMenu();

}

/* =========================
SAVE BUTTON
UNCHANGED
========================= */

saveButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

prompt(
"COPY YOUR DOG JUMP SAVE CODE:",
createSaveCode()
);

}
);

/* =========================
LOAD BUTTON
UNCHANGED
========================= */

loadButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

const code =
prompt(
"PASTE YOUR DOG JUMP SAVE CODE:"
);

if (code === null) {
return;
}

if (loadSaveCode(code)) {

alert(
"SAVE LOADED!"
);

} else {

alert(
"INVALID SAVE CODE!"
);

}

}
);

/* =========================
MENU
========================= */

dogsButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

gameRunning = false;

stopMusic();

mainMenu.style.display =
"none";

gameScreen.style.display =
"none";

dogsScreen.style.display =
"block";

updateDogMenu();

}
);

backButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

stopMusic();

dogsScreen.style.display =
"none";

gameScreen.style.display =
"none";

mainMenu.style.display =
"flex";

updateBestScoreDisplay();

}
);

document
.querySelectorAll(".dog-card")
.forEach(function(card) {

card.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

const dogId =
card.dataset.dog;

if (
!saveData.unlockedDogs.includes(
dogId
)
) {

return;

}

saveData.selectedDog =
dogId;

updateDogMenu();
updateDogAppearance();

}
);

});

/* =========================
GAME VARIABLES
========================= */

let gravity = 0.45;
let jumpPower = 10;
let wallSpeed = 4;

/* SECRET SLIDING MECHANIC */

const idleSlideDelay = 5;

let idleTime = 0;
let sliding = false;

const normalSlideSpeed = 2.2;
const honeySlideSpeed = 0.75;
const iceSlideSpeed = 8;

let velocityX = 0;
let velocityY = 0;

let jumpsLeft = 3;

let onWall = true;
let wallSide = "left";

let gameRunning = false;

let dogX = 28;
let dogY = 300;

let metres = 0;

let cameraY = 0;
let cameraTop = 180;

let lastTime = 0;

let currentObstacle = null;

let invincibleUntil = 0;

let activeBiome = null;
let biomeUntil = 0;

let portalUsed = false;

let obstacleState = {
startTime: 0,
timer: 0,
active: false
};

const obstacles = [

{ id: "gear", min: 10, chance: 0.10 },
{ id: "spike", min: 10, chance: 0.035 },
{ id: "cannon", min: 10, chance: 0.025 },

{ id: "electricWire", min: 75, chance: 0.035 },

{ id: "beam", min: 150, chance: 0.10 },

{ id: "slimeWall", min: 250, chance: 0.02 },

{ id: "portal", min: 300, chance: 0.02 },

{ id: "iceBiome", min: 400, chance: 0.02 },
{ id: "honeyBiome", min: 400, chance: 0.02 },

{ id: "mace", min: 400, chance: 0.035 },

{ id: "fireSpinner", min: 500, chance: 0.02 },

{ id: "boxingGlove", min: 700, chance: 0.035 },
{ id: "trampoline", min: 700, chance: 0.035 },
{ id: "electricCubes", min: 700, chance: 0.02 },

{ id: "batteryLaser", min: 1000, chance: 0.005 }

];

/* =========================
START GAME
========================= */

function startGame() {

ensureAudio();
startMusic();

mainMenu.style.display =
"none";

dogsScreen.style.display =
"none";

gameScreen.style.display =
"block";

updateDogAppearance();

dogX = 28;

dogY =
window.innerHeight - 180;

velocityX = 0;
velocityY = 0;

jumpsLeft = 3;

onWall = true;
wallSide = "left";

metres = 0;

cameraY = 0;

currentObstacle = null;

invincibleUntil = 0;

activeBiome = null;
biomeUntil = 0;

portalUsed = false;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

clearObstacle();

gameScreen.classList.remove(
"ice-biome",
"honey-biome",
"game-over-shake"
);

gameOverFlash.classList.remove(
"flash"
);

scoreDisplay.textContent =
"0m";

invincibilityDisplay.style.display =
"none";

gameWorld.style.transform =
"translateY(0px)";

gameRunning = true;

lastTime =
performance.now();

requestAnimationFrame(
gameLoop
);

}

playButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

ensureAudio();

startMusic();

startGame();

}
);

/* =========================
GAME LOOP
========================= */

function gameLoop(time) {

if (!gameRunning) {
return;
}

let delta =
(time - lastTime) /
16.67;

if (delta > 2) {
delta = 2;
}

lastTime = time;

updateGame(
delta,
time
);

requestAnimationFrame(
gameLoop
);

}

function updateGame(
delta,
time
) {

/* =========================
SECRET SLIDING MECHANIC
========================= */

if (onWall) {

velocityX = 0;
velocityY = 0;

/*
Ice makes the dog slide immediately.
Normal walls wait 5 seconds.
Honey waits 5 seconds but slides slowly.
*/
if (activeBiome === "ice") {

idleTime +=
delta /
60;

sliding = true;

} else {

idleTime +=
delta /
60;

if (idleTime >= idleSlideDelay) {

sliding = true;

}

}

/*
A slime wall completely prevents sliding.
*/
if (
sliding &&
currentObstacle === "slimeWall"
) {

sliding = false;

}

/*
Apply the downward sliding movement.
*/
if (sliding) {

let slideSpeed =
normalSlideSpeed;

if (activeBiome === "honey") {

slideSpeed =
honeySlideSpeed;

}

if (activeBiome === "ice") {

slideSpeed =
iceSlideSpeed;

}

dogY +=
slideSpeed *
delta;

}

} else {

velocityY +=
gravity * delta;

dogY +=
velocityY * delta;

dogX +=
velocityX * delta;

}

/* =========================
WALL CHECKS
========================= */

const screenWidth =
window.innerWidth;

const dogWidth = 62;

if (dogX <= 28) {

dogX = 28;

if (!onWall) {

onWall = true;
wallSide = "left";

velocityX = 0;
velocityY = 0;

jumpsLeft = 3;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

}

}

if (
dogX + dogWidth >=
screenWidth - 28
) {

dogX =
screenWidth -
28 -
dogWidth;

if (!onWall) {

onWall = true;
wallSide = "right";

velocityX = 0;
velocityY = 0;

jumpsLeft = 3;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

}

}

if (onWall) {

velocityX = 0;
velocityY = 0;

if (wallSide === "left") {

dogX = 28;

} else {

dogX =
screenWidth -
28 -
dogWidth;

}

}

/*
Keep the visual sliding state synchronized.
*/
if (
sliding &&
onWall
) {

dog.classList.add(
"sliding"
);

} else {

dog.classList.remove(
"sliding"
);

}

const targetCamera =
Math.max(
0,
cameraTop - dogY
);

cameraY +=
(
targetCamera -
cameraY
) *
0.08 *
delta;

gameWorld.style.transform =
"translateY(" +
cameraY +
"px)";

dog.style.left =
dogX + "px";

dog.style.top =
dogY + "px";

updateInvincibility(
time
);

updateBiome();

if (currentObstacle) {

updateObstacle(
delta,
time
);

if (!gameRunning) {
return;
}

}

if (
dogY >
window.innerHeight +
120 -
cameraY
) {

gameOver();

}

}

/* =========================
JUMP
========================= */

function jump() {

if (!gameRunning) {
return;
}

if (jumpsLeft <= 0) {
return;
}

ensureAudio();

jumpsLeft--;

metres++;

updateScore();

playJumpSound();

/*
Jumping always cancels the idle slide.
*/
idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

if (!currentObstacle) {
trySpawnObstacle();
}

onWall = false;

velocityY =
-jumpPower;

if (wallSide === "left") {

velocityX =
wallSpeed;

} else {

velocityX =
-wallSpeed;

}

}

function updateScore() {

scoreDisplay.textContent =
metres + "m";

if (metres > bestScore) {

bestScore = metres;

saveData.bestScore =
bestScore;

updateBestScoreDisplay();

}

checkDogUnlocks();

}

/* =========================
OBSTACLES
========================= */

function trySpawnObstacle() {

if (currentObstacle) {
return;
}

const available =
obstacles.filter(
function(obstacle) {

return (
metres >= obstacle.min
);

}
);

if (
available.length === 0
) {

return;

}

const roll =
Math.random();

let cumulative = 0;

for (
const obstacle of available
) {

cumulative +=
obstacle.chance;

if (
roll < cumulative
) {

spawnObstacle(
obstacle.id
);

return;

}

}

}

function spawnObstacle(id) {

clearObstacle();

currentObstacle = id;

obstacleState = {
startTime:
performance.now(),
timer: 3,
active: true
};

const y =
Math.max(
90,
dogY - 330
);

switch (id) {

case "gear":
spawnGear(y);
break;

case "spike":
spawnSpike(y);
break;

case "cannon":
spawnCannon(y);
break;

case "electricWire":
spawnElectricWire(y);
break;

case "beam":
spawnBeam(y);
break;

case "slimeWall":
spawnSlimeWall(y);
break;

case "portal":
spawnPortal(y);
break;

case "iceBiome":
startBiome("ice");
break;

case "honeyBiome":
startBiome("honey");
break;

case "mace":
spawnMace(y);
break;

case "fireSpinner":
spawnFireSpinner(y);
break;

case "boxingGlove":
spawnBoxingGlove(y);
break;

case "trampoline":
spawnTrampoline(y);
break;

case "electricCubes":
spawnElectricCubes(y);
break;

case "batteryLaser":
spawnBatteryLaser(y);
break;

}

}

function clearObstacle() {

currentObstacle = null;

obstacleState.active =
false;

gear.style.display =
"none";

spike.style.display =
"none";

cannon.style.display =
"none";

electricWire.style.display =
"none";

beam.style.display =
"none";

slimeWall.style.display =
"none";

portal.style.display =
"none";

mace.style.display =
"none";

fireSpinner.style.display =
"none";

boxingGlove.style.display =
"none";

trampoline.style.display =
"none";

electricCubes.style.display =
"none";

batteryLaser.style.display =
"none";

electricWire.classList.remove(
"live"
);

beam.classList.remove(
"laser"
);

electricCubes.classList.remove(
"spread"
);

batteryLaser.classList.remove(
"live"
);

boxingGlove.classList.remove(
"shaking"
);

}

/* =========================
SPAWN FUNCTIONS
========================= */

function spawnGear(y) {

gear.style.left =
(
Math.random() *
(
window.innerWidth -
120
) +
55
) + "px";

gear.style.top =
y + "px";

gear.style.display =
"block";

}

function spawnSpike(y) {

const side =
Math.random() <
0.5
? "left"
: "right";

spike.style.top =
y + "px";

if (side === "left") {

spike.style.left =
"28px";

spike.style.transform =
"rotate(0deg)";

} else {

spike.style.left =
(
window.innerWidth -
83
) + "px";

spike.style.transform =
"rotate(180deg)";

}

spike.style.display =
"block";

}

function spawnCannon(y) {

cannon.style.left =
(
Math.random() *
(
window.innerWidth -
140
) +
60
) + "px";

cannon.style.top =
y + "px";

cannon.style.display =
"block";

}

function spawnElectricWire(y) {

electricWire.style.left =
(
Math.random() *
(
window.innerWidth -
220
) +
50
) + "px";

electricWire.style.top =
y + "px";

electricWire.style.display =
"block";

electricWire
.querySelector(
".wire-countdown"
)
.textContent =
"3";

}

function spawnBeam(y) {

beam.style.left =
(
Math.random() *
(
window.innerWidth -
230
) +
30
) + "px";

beam.style.top =
y + "px";

beam.style.display =
"block";

beam.classList.remove(
"laser"
);

obstacleState.startTime =
performance.now();

}

function spawnSlimeWall(y) {

const side =
Math.random() <
0.5
? "left"
: "right";

slimeWall.style.top =
y + "px";

if (side === "left") {

slimeWall.style.left =
"27px";

} else {

slimeWall.style.left =
(
window.innerWidth -
59
) + "px";

}

slimeWall.style.display =
"block";

}

function spawnPortal(y) {

portalUsed = false;

portal.style.left =
(
Math.random() *
(
window.innerWidth -
130
) +
65
) + "px";

portal.style.top =
y + "px";

portal.style.display =
"block";

}

function spawnMace(y) {

mace.style.left =
(
Math.random() *
(
window.innerWidth -
130
) +
30
) + "px";

mace.style.top =
y + "px";

mace.style.display =
"block";

}

function spawnFireSpinner(y) {

fireSpinner.style.left =
(
Math.random() *
(
window.innerWidth -
210
) +
20
) + "px";

fireSpinner.style.top =
y + "px";

fireSpinner.style.display =
"block";

}

function spawnBoxingGlove(y) {

boxingGlove.style.top =
y + "px";

boxingGlove.style.left =
wallSide === "left"
? "35px"
: (
window.innerWidth -
110
) + "px";

boxingGlove.style.display =
"block";

boxingGlove.classList.add(
"shaking"
);

obstacleState.startTime =
performance.now();

}

function spawnTrampoline(y) {

trampoline.style.left =
(
Math.random() *
(
window.innerWidth -
130
) +
50
) + "px";

trampoline.style.top =
y + "px";

trampoline.style.display =
"block";

}

function spawnElectricCubes(y) {

electricCubes.style.left =
(
Math.random() *
(
window.innerWidth -
210
) +
20
) + "px";

electricCubes.style.top =
y + "px";

electricCubes.style.display =
"block";

electricCubes.classList.remove(
"spread"
);

electricCubes
.querySelector(
".cube-countdown"
)
.textContent =
"3";

obstacleState.startTime =
performance.now();

}

function spawnBatteryLaser(y) {

batteryLaser.style.left =
(
Math.random() *
(
window.innerWidth -
270
) +
20
) + "px";

batteryLaser.style.top =
y + "px";

batteryLaser.style.display =
"block";

batteryLaser.classList.remove(
"live"
);

batteryLaser
.querySelector(
".battery-countdown"
)
.textContent =
"3";

obstacleState.startTime =
performance.now();

}

/* =========================
OBSTACLE UPDATE
========================= */

function updateObstacle(
delta,
time
) {

switch (currentObstacle) {

case "gear":

if (
checkCollision(gear) &&
!isInvincible(time)
) {

gameOver();
return;

}

if (
passedObject(gear)
) {

clearObstacle();

}

break;

case "spike":

if (
checkCollision(spike) &&
!isInvincible(time)
) {

gameOver();
return;

}

if (
passedObject(spike)
) {

clearObstacle();

}

break;

case "cannon":

if (
checkCollision(cannon)
) {

launchCannon(time);
return;

}

if (
passedObject(cannon)
) {

clearObstacle();

}

break;

case "electricWire":

updateElectricWire(time);
break;

case "beam":

updateBeam(time);
break;

case "slimeWall":

/*
The slime wall is the special anti-slide surface.
While the dog is touching it, sliding is disabled.
*/
if (
checkCollision(slimeWall)
) {

sliding = false;

}

if (
passedObject(slimeWall)
) {

clearObstacle();

}

break;

case "portal":

if (
!portalUsed &&
checkCollision(portal)
) {

usePortal();
return;

}

if (
passedObject(portal)
) {

clearObstacle();

}

break;

case "mace":

updateMace(time);
break;

case "fireSpinner":

if (
checkCollision(fireSpinner) &&
!isInvincible(time)
) {

gameOver();
return;

}

if (
passedObject(fireSpinner)
) {

clearObstacle();

}

break;

case "boxingGlove":

updateBoxingGlove(time);
break;

case "trampoline":

if (
checkCollision(trampoline)
) {

trampolineLaunch();
return;

}

if (
passedObject(trampoline)
) {

clearObstacle();

}

break;

case "electricCubes":

updateElectricCubes(time);
break;

case "batteryLaser":

updateBatteryLaser(time);
break;

}

}

/* =========================
ELECTRIC WIRE
========================= */

function updateElectricWire(time) {

const elapsed =
(
time -
obstacleState.startTime
) / 1000;

const remaining =
Math.max(
0,
Math.ceil(
3 - elapsed
)
);

electricWire
.querySelector(
".wire-countdown"
)
.textContent =
remaining;

if (elapsed >= 3) {

electricWire.classList.add(
"live"
);

if (
checkCollision(electricWire) &&
!isInvincible(time)
) {

gameOver();
return;

}

}

if (
passedObject(electricWire)
) {

clearObstacle();

}

}

/* =========================
BEAM
========================= */

function updateBeam(time) {

const elapsed =
(
time -
obstacleState.startTime
) / 1000;

if (elapsed >= 2) {

beam.classList.add(
"laser"
);

if (
checkCollision(beam) &&
!isInvincible(time)
) {

gameOver();
return;

}

}

if (
passedObject(beam)
) {

clearObstacle();

}

}

/* =========================
MACE
========================= */

function updateMace(time) {

const angle =
Math.sin(
time / 400
) * 65;

mace.style.transform =
"rotate(" +
angle +
"deg)";

if (
checkCollision(mace) &&
!isInvincible(time)
) {

gameOver();
return;

}

if (
passedObject(mace)
) {

clearObstacle();

}

}

/* =========================
BOXING GLOVE
========================= */

function updateBoxingGlove(time) {

const elapsed =
(
time -
obstacleState.startTime
) / 1000;

if (elapsed >= 1.5) {

boxingGlove.classList.remove(
"shaking"
);

const targetX =
wallSide === "left"
? window.innerWidth - 100
: 35;

boxingGlove.style.left =
targetX + "px";

boxingGlove.classList.add(
"punch"
);

if (
checkCollision(boxingGlove) &&
!isInvincible(time)
) {

gameOver();
return;

}

}

if (elapsed >= 2.5) {

clearObstacle();

}

}

/* =========================
ELECTRIC CUBES
========================= */

function updateElectricCubes(time) {

const elapsed =
(
time -
obstacleState.startTime
) / 1000;

const remaining =
Math.max(
0,
Math.ceil(
3 - elapsed
)
);

electricCubes
.querySelector(
".cube-countdown"
)
.textContent =
remaining;

if (elapsed >= 3) {

electricCubes.classList.add(
"spread"
);

if (
checkCollision(electricCubes) &&
!isInvincible(time)
) {

gameOver();
return;

}

}

if (elapsed >= 4) {

clearObstacle();

}

}

/* =========================
BATTERY LASER
========================= */

function updateBatteryLaser(time) {

const elapsed =
(
time -
obstacleState.startTime
) / 1000;

const remaining =
Math.max(
0,
Math.ceil(
3 - elapsed
)
);

batteryLaser
.querySelector(
".battery-countdown"
)
.textContent =
remaining;

if (elapsed >= 3) {

batteryLaser.classList.add(
"live"
);

if (
checkCollision(batteryLaser) &&
!isInvincible(time)
) {

gameOver();
return;

}

}

if (
passedObject(batteryLaser)
) {

clearObstacle();

}

}

/* =========================
CANNON
========================= */

function launchCannon(time) {

playCannonSound();

clearObstacle();

metres += 25;

updateScore();

dogY -= 500;

velocityY =
-jumpPower * 1.8;

onWall = false;

jumpsLeft = 3;

invincibleUntil =
time + 3000;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

}

/* =========================
PORTAL
========================= */

function usePortal() {

playPortalSound();

portalUsed = true;

const boost =
Math.floor(
Math.random() * 76
) + 25;

metres += boost;

updateScore();

dogY -=
boost * 12;

velocityY =
-jumpPower * 1.5;

onWall = false;

jumpsLeft = 3;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

clearObstacle();

}

/* =========================
TRAMPOLINE
========================= */

function trampolineLaunch() {

playTone(
280,
0.12,
"sine",
0.06
);

playTone(
560,
0.16,
"triangle",
0.05,
0.08
);

clearObstacle();

dogY -= 200;

velocityY =
-jumpPower * 1.4;

onWall = false;

jumpsLeft = 3;

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

}

/* =========================
BIOMES
========================= */

function startBiome(type) {

activeBiome = type;

biomeUntil =
metres + 10;

if (type === "ice") {

gameScreen.classList.add(
"ice-biome"
);

gameScreen.classList.remove(
"honey-biome"
);

playTone(
880,
0.2,
"sine",
0.045
);

} else {

gameScreen.classList.add(
"honey-biome"
);

gameScreen.classList.remove(
"ice-biome"
);

playTone(
330,
0.2,
"triangle",
0.045
);

}

clearObstacle();

}

/* =========================
UPDATE BIOME
========================= */

function updateBiome() {

if (!activeBiome) {
return;
}

if (
metres >= biomeUntil
) {

activeBiome = null;

gameScreen.classList.remove(
"ice-biome",
"honey-biome"
);

/*
Leaving a biome returns the dog to normal
5-second idle sliding behavior.
*/
if (onWall) {

idleTime = 0;
sliding = false;

dog.classList.remove(
"sliding"
);

}

}

}

/* =========================
COLLISION
========================= */

function checkCollision(
element
) {

if (
!element ||
element.style.display ===
"none"
) {

return false;

}

const dogRect =
dog.getBoundingClientRect();

const obstacleRect =
element.getBoundingClientRect();

return !(
dogRect.right <
obstacleRect.left ||

dogRect.left >
obstacleRect.right ||

dogRect.bottom <
obstacleRect.top ||

dogRect.top >
obstacleRect.bottom
);

}

function passedObject(
element
) {

const rect =
element.getBoundingClientRect();

return (
rect.top >
window.innerHeight +
150
);

}

/* =========================
INVINCIBILITY
========================= */

function isInvincible(time) {

return (
invincibleUntil >
time
);

}

function updateInvincibility(
time
) {

if (
invincibleUntil >
time
) {

const seconds =
Math.ceil(
(
invincibleUntil -
time
) / 1000
);

invincibilityDisplay.textContent =
"🛡️ " +
seconds;

invincibilityDisplay.style.display =
"block";

dog.style.opacity =
Math.floor(
time / 100
) % 2 === 0
? "0.55"
: "1";

} else {

invincibilityDisplay.style.display =
"none";

dog.style.opacity =
"1";

}

}

/* =========================
GAME OVER EFFECTS
========================= */

function createDeathParticles() {

const rect =
dog.getBoundingClientRect();

const centerX =
rect.left +
rect.width / 2;

const centerY =
rect.top +
rect.height / 2;

const particleCount = 28;

const particleTypes = [
"💥",
"⭐",
"✨",
"🔴",
"🟡",
"⚡"
];

for (
let i = 0;
i < particleCount;
i++
) {

const particle =
document.createElement(
"div"
);

particle.className =
"death-particle";

if (i % 3 === 0) {

particle.classList.add(
"circle"
);

}

if (i % 4 === 0) {

particle.textContent =
particleTypes[
Math.floor(
Math.random() *
particleTypes.length
)
];

particle.style.width =
"auto";

particle.style.height =
"auto";

particle.style.fontSize =
(
13 +
Math.random() * 12
) + "px";

} else {

particle.style.width =
(
7 +
Math.random() * 8
) + "px";

particle.style.height =
(
7 +
Math.random() * 8
) + "px";

}

particle.style.left =
centerX + "px";

particle.style.top =
centerY + "px";

const angle =
Math.random() *
Math.PI *
2;

const distance =
60 +
Math.random() * 130;

particle.style.setProperty(
"--dx",
(
Math.cos(angle) *
distance
) + "px"
);

particle.style.setProperty(
"--dy",
(
Math.sin(angle) *
distance
) + "px"
);

particle.style.setProperty(
"--rotation",
(
Math.random() *
720 -
360
) + "deg"
);

gameScreen.appendChild(
particle
);

setTimeout(
function() {
particle.remove();
},
750
);

}

}

function triggerGameOverEffects() {

gameScreen.classList.remove(
"game-over-shake"
);

gameOverFlash.classList.remove(
"flash"
);

void gameScreen.offsetWidth;

gameScreen.classList.add(
"game-over-shake"
);

gameOverFlash.classList.add(
"flash"
);

createDeathParticles();

playGameOverSound();

setTimeout(
function() {

gameScreen.classList.remove(
"game-over-shake"
);

gameOverFlash.classList.remove(
"flash"
);

},
500
);

}

/* =========================
GAME OVER
========================= */

function gameOver() {

gameRunning = false;

sliding = false;
idleTime = 0;

dog.classList.remove(
"sliding"
);

triggerGameOverEffects();

stopMusic();

clearObstacle();

invincibleUntil = 0;

gameScreen.classList.remove(
"ice-biome",
"honey-biome"
);

setTimeout(
function() {

alert(
"GAME OVER!\n\n" +
"DISTANCE: " +
metres +
"m"
);

gameScreen.style.display =
"none";

mainMenu.style.display =
"flex";

updateBestScoreDisplay();

},
500
);

}

/* =========================
CONTROLS
========================= */

gameScreen.addEventListener(
"pointerdown",
function(event) {

if (
event.target ===
gameBackButton
) {

return;

}

jump();

}
);

gameBackButton.addEventListener(
"click",
function(event) {

event.preventDefault();
event.stopPropagation();

gameRunning = false;

sliding = false;
idleTime = 0;

dog.classList.remove(
"sliding"
);

stopMusic();

clearObstacle();

invincibleUntil = 0;

gameScreen.classList.remove(
"ice-biome",
"honey-biome",
"game-over-shake"
);

gameOverFlash.classList.remove(
"flash"
);

gameScreen.style.display =
"none";

mainMenu.style.display =
"flex";

updateBestScoreDisplay();

}
);

/* =========================
INITIALIZE
========================= */

updateBestScoreDisplay();
updateDogMenu();
updateDogAppearance();

});