import {DeviceRotationPrompt} from 'device-rotation-prompt';
import Konva from 'konva';
import { getLevels, getDimensions } from './draw.js';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

////////////////ROTATE DEVICE////////////////
const pleaseRotate = new DeviceRotationPrompt({
	orientation: 'landscape',
	text: 'Ротирај уређај'
});

//////////////// GETING DATA ////////////////

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

//////////////// BACKGROUND /////////////

/*
Konva.Image.fromURL('./background.jpg', function (background) {
	background.setAttrs({
		x: 0,
		y: 0,
		scaleX: dims.backgourndScaleX,
		scaleY: dims.backgroundScaleY,
	});

	background.scaleX(dims.backgroundScaleX);
	background.scaleY(dims.backgroundScaleY);
	baseLayer.add(background);
	background.zIndex(0);
});
*/


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
	paintCurrentLevel();

	nextLevelButton.hide();
	checkButton.show();
	pen.draggable(true);
});

tryAgainButton.on('mouseup touchend', function () {
	context.clearRect(0, 0, canvas.width, canvas.height);
	pen.x(dims.penPosition[0]);
	pen.y(dims.penPosition[1]);
	levels[currentLevel].elements.walls.forEach(function (wall) {
			wall.fill('black');
	});

	const numWalls = levels[currentLevel].intersection.length;
	levels[currentLevel].intersection = (new Array(numWalls)).fill(0);
nextLevelButton.hide();

	tryAgainButton.hide();
	checkButton.show();
	pen.draggable(true);
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

	pen.draggable(false);
});


///////////////// PEN //////////////////////
let penPath = "M0 0-.1-5.8 21.9-43.9 27.1-40.9 5.1-2.8 0 0";

const pen = new Konva.Path({
	x: dims.penPosition[0],
	y: dims.penPosition[1],
	scaleX: dims.penScale, //dims.penScale,
	scaleY: dims.penScale, //TODO
	data: penPath,
	fill: 'black',
	draggable: true,
});

gameLayer.add(pen);
const penHeight = 0; // pen.getClientRect().height;
let penPos = undefined;

//////////////// LEVEL /////////////////

let currentLevel = 0;

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

paintCurrentLevel();


/////////////// PEN MOVE ////////////////
pen.on('dragstart', function () {
	penPos = pen.absolutePosition();
});

pen.on('dragmove', function () {
	/////////////SPEED LIMIT///////////////
	let currentPos = pen.absolutePosition();
	let deltaX = currentPos.x - penPos.x;
	let deltaY = currentPos.y - penPos.y;
	let dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

	if (dist > dims.distLimit) {
		let shiftX = deltaX * (dims.distLimit / dist);
		let shiftY = deltaY * (dims.distLimit / dist);
		pen.x(Math.round(penPos.x + shiftX));
		pen.y(Math.round(penPos.y + shiftY));
		currentPos = pen.absolutePosition();
	}

	/////////////CORNER COLLISION//////////////
	levels[currentLevel].corners.forEach(function (corner) {
		let penTopX = currentPos.x + dims.penTipOffset;
		let penTopY = currentPos.y + dims.penTipOffset + penHeight;

		let cornerX = corner[0];
		let cornerY = corner[1];

		let distX = penTopX - cornerX;
		let distY = penTopY - cornerY;
		let dist = Math.sqrt(distX * distX + distY * distY);

		if (dist < dims.cornerDistLimit) {
			let k = dims.cornerDistLimit / dist;
			let newPenTopX = cornerX + k * (penTopX - cornerX);
			let newPenTopY = cornerY + k * (penTopY - cornerY);
			pen.x(newPenTopX - dims.penTipOffset);
			pen.y(newPenTopY - dims.penTipOffset - penHeight);
			currentPos = pen.absolutePosition();
		}
	});

	////////////////WALL CROSS///////////////////
	levels[currentLevel].walls.forEach(function (wall, idx) {
		const x1 = wall[0][0];
		const y1 = wall[0][1];
		const x2 = wall[1][0];
		const y2 = wall[1][1];

		const px1 = penPos.x + dims.penTipOffset;
		const py1 = penPos.y + dims.penTipOffset + penHeight;
		const px2 = currentPos.x + dims.penTipOffset;
		const py2 = currentPos.y + dims.penTipOffset + penHeight;

		if (x1 == x2 && Math.min(px1, px2) < x1 && x1 < Math.max(px1, px2)) {
			const cutY = py1 + (py2 - py1) / (px2 - px1) * (x1 - px1);
			if (Math.min(y1, y2) < cutY && cutY < Math.max(y1, y2)) {
				levels[currentLevel].intersection[idx] += 1;
				console.log(levels[currentLevel].intersection);
			}
		} 

		if (y1 == y2 && Math.min(py1, py2) < y1 && y1 < Math.max(py1, py2)) {
			const cutX = px1 + (px2 - px1) / (py2 - py1) * (y1 - py1);
			if (Math.min(x1, x2) < cutX && cutX < Math.max(x1, x2)) {
				levels[currentLevel].intersection[idx] += 1;
				console.log(levels[currentLevel].intersection);
			}
		}
	});
	
	//////////////LINE DRAWING/////////////////
	context.beginPath();
	context.moveTo(penPos.x + dims.penTipOffset, penPos.y + penHeight + dims.penTipOffset);
	context.lineTo(pen.absolutePosition().x + dims.penTipOffset, pen.absolutePosition().y + penHeight + dims.penTipOffset);
	context.closePath();
	context.stroke();
	gameLayer.batchDraw();
	penPos = pen.absolutePosition(); //last handeler updates position
});

/////////////RELOAD ON ORIENTATION CHANGE///////////////
window.addEventListener('resize', function () {
    window.location.reload();
});
