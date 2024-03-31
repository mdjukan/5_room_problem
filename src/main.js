import { DeviceRotationPrompt } from 'device-rotation-prompt';
import Konva from 'konva';
import { getLevels, getDimensions } from './draw.js';
import { analyitics } from './analyitics.js';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

////////////////ROTATE DEVICE////////////////
const pleaseRotate = new DeviceRotationPrompt({
	orientation: 'landscape',
	text: 'Ротирај уређај'
});

//////////////// GET DATA ////////////////
const dims = getDimensions(screenWidth, screenHeight);
const levels = getLevels(screenWidth, screenHeight);

//////////////// KONVA INIT ////////////////
const stage = new Konva.Stage({
	container: 'container',
	width: screenWidth,
	height: screenHeight,
});

const baseLayer = new Konva.Layer();
stage.add(baseLayer);

//////////////// CANVAS /////////////
const canvas = document.createElement('canvas');
canvas.width = screenWidth;
canvas.height = screenHeight;

const context = canvas.getContext('2d');
context.strokeStyle = '#040273';
context.lineJoin = 'round';
context.lineWidth = dims.pathWidth;

const canvasImage = new Konva.Image({
	image: canvas,
	x: 0,
	y: 0,
});

const gameLayer = new Konva.Layer();
stage.add(gameLayer);
gameLayer.add(canvasImage);

////////////////// BUTTONS /////////////////
function createButton(dims, text) {
	const button = new Konva.Group({
		x: dims.buttonBasePosition[0],
		y: dims.buttonBasePosition[1],
		width: dims.buttonWidth,
		height: dims.buttonHeight,
	});

	button.add(new Konva.Rect({
		width: dims.buttonWidth,
		height: dims.buttonHeight,
		stroke: 'black',
		strokeWidth: dims.buttonBorder,
	}));

	button.add(new Konva.Text({
		text: text,
		fontSize: dims.buttonFontSize,
		fontFamily: 'Calibri',
		fontWeight: 'bold',
		fill: '#000',
		width: dims.buttonWidth,
		padding: dims.buttonPadding,
		align: 'center'
	}));

	return button;
}

const checkButton = createButton(dims, 'Провера');
const tryAgainButton = createButton(dims, 'Покушај поново');
const nextLevelButton = createButton(dims, 'Следећи ниво');

gameLayer.add(checkButton);
gameLayer.add(tryAgainButton);
gameLayer.add(nextLevelButton);

nextLevelButton.hide();
tryAgainButton.hide();

nextLevelButton.on('mouseup touchend', function () {
	removeCurrentLevel();
	currentLevel += 1;
	context.clearRect(0, 0, canvas.width, canvas.height);
	pen.x(dims.penPosition[0]);
	pen.y(dims.penPosition[1]);

	penContainer.x(pen.x());
	penContainer.y(pen.y() - penContainer.height());

	paintCurrentLevel();

	nextLevelButton.hide();
	checkButton.show();
	penContainer.draggable(true);

	analyitics('next-level');
});

tryAgainButton.on('mouseup touchend', function () {
	context.clearRect(0, 0, canvas.width, canvas.height);

	pen.x(dims.penPosition[0]);
	pen.y(dims.penPosition[1]);
	penContainer.x(pen.x());
	penContainer.y(pen.y() - penContainer.height());

	levels[currentLevel].elements.walls.forEach(function (wall) {
			wall.fill('black');
	});

	const numWalls = levels[currentLevel].intersection.length;
	levels[currentLevel].intersection = (new Array(numWalls)).fill(0);
nextLevelButton.hide();

	tryAgainButton.hide();
	checkButton.show();
	penContainer.draggable(true);

	analyitics('try-again');
});

checkButton.on('mouseup touchend', function () {
	let fail = false;
	levels[currentLevel].elements.walls.forEach(function (wall, idx) {
		if (levels[currentLevel].intersection[idx]!=1) {
			wall.fill('red');
			fail = true;
		} else {
			wall.fill('green');
		}

	});

	checkButton.hide();
	if (!fail) {
		nextLevelButton.show();
	} else {
		tryAgainButton.show();
	}

	const numWalls = levels[currentLevel].intersection.length;
	levels[currentLevel].intersection = (new Array(numWalls)).fill(0);

	penContainer.draggable(false);
	analyitics('check');
});

//////////////// ADDING GAME INFO /////////////////
let message = "Оловком нацртај линију која сече сваку од дужи тачно једном.";

const messageElement = new Konva.Group({
		x: 0,
		y: 0,
		width: screenWidth,
		height: dims.buttonHeight,
	});

messageElement.add(new Konva.Text({
		text: message,
		fontSize: dims.buttonFontSize,
		fontFamily: 'Calibri',
		fontWeight: 'bold',
		fill: '#000',
		width: screenWidth,
		padding: dims.buttonPadding,
		align: 'center'
	}));

baseLayer.add(messageElement);

///////////////// PEN //////////////////////
let penPath = "M0 0-.1-5.8 21.9-43.9 27.1-40.9 5.1-2.8 0 0";

const pen = new Konva.Path({
	x: dims.penPosition[0],
	y: dims.penPosition[1],
	scaleX: dims.penScale,
	scaleY: dims.penScale,
	data: penPath,
	fill: 'black',
});

const penRect = pen.getClientRect();
const penContainer = new Konva.Rect({
	x: penRect.x,
	y: penRect.y,
	width: penRect.width,
	height: penRect.height,
	stroke: 'black',
	strokeWidth: 0,
	draggable: true,
});

gameLayer.add(pen);
gameLayer.add(penContainer);

let penPos = undefined;

//////////////// LEVEL /////////////////
function paintCurrentLevel() {
	levels[currentLevel].elements.walls.forEach(function (element) {
		baseLayer.add(element);
	});

	levels[currentLevel].elements.corners.forEach(function (element) {
		baseLayer.add(element);
	});
}

function removeCurrentLevel() {
	levels[currentLevel].elements.walls.forEach(function (element) {
		element.destroy();
	});

	levels[currentLevel].elements.corners.forEach(function (element) {
		element.destroy();
	});

	baseLayer.draw();
}

let currentLevel = 0;
paintCurrentLevel();

/////////////// PEN MOVE ////////////////
function between(a,x,b) {
	return Math.min(a,b)<x && x<Math.max(a,b);
}

penContainer.on('dragstart', function () {
	penPos = penContainer.absolutePosition();
});

penContainer.on('dragmove', function () {
	let currentPos = penContainer.absolutePosition();
	/////////////SPEED LIMIT///////////////
	let deltaX = currentPos.x - penPos.x;
	let deltaY = currentPos.y - penPos.y;
	let dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

	if (dist > dims.distLimit) {
		let shiftX = deltaX * (dims.distLimit / dist);
		let shiftY = deltaY * (dims.distLimit / dist);
		penContainer.x(Math.round(penPos.x + shiftX));
		penContainer.y(Math.round(penPos.y + shiftY));
		currentPos = penContainer.absolutePosition();
	}

	/////////////CORNER COLLISION//////////////
	let penTopX = currentPos.x;
	let penTopY = currentPos.y + penContainer.height();
	levels[currentLevel].corners.forEach(function (corner) {
		let cornerX = corner[0];
		let cornerY = corner[1];

		let distX = penTopX - cornerX;
		let distY = penTopY - cornerY;
		let dist = Math.sqrt(distX * distX + distY * distY);

		if (dist < dims.cornerDistLimit) {
			let k = dims.cornerDistLimit / dist;
			let newPenTopX = cornerX + k * (penTopX - cornerX);
			let newPenTopY = cornerY + k * (penTopY - cornerY);
			penContainer.x(newPenTopX);
			penContainer.y(newPenTopY - penContainer.height());
			currentPos = penContainer.absolutePosition();
		}
	});

	////////////////WALL CROSS///////////////////
	const px1 = penPos.x;
	const py1 = penPos.y + penContainer.height();
	const px2 = currentPos.x;
	const py2 = currentPos.y + penContainer.height();

	let verticalPath = px1==px2;

	levels[currentLevel].walls.forEach(function (wall, idx) {
		const x1 = wall[0][0];
		const y1 = wall[0][1];
		const x2 = wall[1][0];
		const y2 = wall[1][1];

		let wallCut = false;
		const verticalWall = x1 == x2;

		if (verticalWall && x1==px2 && between(y1, py2, y2)) {
			wallCut = true;
		} 

		if (!verticalWall && y1==py2 && between(x1, px2, x2)) {
			wallCut = true;
		}

		if (verticalPath && !verticalWall) {
			if (between(py1, y1, py2) && between(x1, px2, x2)) {
				wallCut = true;
			}
		}

		if (!verticalPath) {
			let k = (py2-py1)/(px2-px1); 

			if (verticalWall) {
				if (between(px1, x1, px2)) {
					const yCut = k * (x1 - px1) + py1;
					if (between(y1, yCut, y2)) {
						wallCut = true;
					}
				}
			} else {
				if (between(py1, y1, py2)) {
					const xCut = (y1-py1)/k + px1;
					if (between(x1, xCut, x2)) {
						wallCut = true;
					}
				}
			}
		}

		if(wallCut) {
			levels[currentLevel].intersection[idx] += 1;
		}
	});

	//////////////LINE DRAWING/////////////////
	context.beginPath();
	context.moveTo(px1, py1);
	context.lineTo(px2, py2);
	context.closePath();
	context.stroke();
	gameLayer.batchDraw();
	penPos = penContainer.absolutePosition(); //last handeler updates position
	pen.x(penPos.x);
	pen.y(penPos.y + penContainer.height() );
});

/////////////RELOAD ON ORIENTATION CHANGE///////////////
window.addEventListener('resize', function () {
    window.location.reload();
});

/////////////ANALYITICS ON LOAD//////////////////
window.addEventListener('load', function () {
	console.log('LOAD');
	analyitics('load');
});
