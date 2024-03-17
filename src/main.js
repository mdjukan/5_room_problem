import './styles.css';
import Konva from 'konva';

/////////////CONSTANTS//////////
let screenWidth = 0.75 * window.innerWidth;
let screenHeight = 0.8 * window.innerHeight;

let w = 0.01 * screenWidth;
let cornerRadius = 0.015 * screenWidth;
let L1 = 0.18 * screenWidth;
let L2 = 0.15 * screenWidth;
let L3 = (L1-w)/2;
let L4 = (3*L1+w)/2;

let totalWidth = 4*w+3*L1;
let totalHeight = 3*w+2*L2;

let offsetX = (screenWidth-totalWidth)/2;
let offsetY = (screenHeight-totalHeight)/2;

let dotX = 0.1 * screenWidth;
let dotY = 0.1 * screenHeight;
let dotRadius = cornerRadius;
let pathWidth = 0.015 * screenWidth;

let lastPos;


///////////SCREEN INIT///////////
let stage = new Konva.Stage({
	container: 'container',
	width: screenWidth,
	height: screenHeight
});

let layer = new Konva.Layer();
stage.add(layer);


///CORNERS///
let corners = [[0,0], [w+L1, 0], [2*w+2*L1, 0], [3*w+3*L1, 0],
	[0, w+L2], [w+L1, w+L2], [2*w+L1+L3, w+L2], [2*w+2*L1, w+L2], [3*w+3*L1, w+L2],
	[0, 2*w+2*L2], [w+L4, 2*w+2*L2], [3*w+3*L1, 2*w+2*L2]]

corners = corners.map(function (corner) {
	let x = corner[0];
	let y = corner[1];
	return [x+w/2, y+w/2];
});


///WALLLS////
//[true if Ver, duzina, x, y]
let walls = [
	[false, L1, w, 0],
	[false, L1, 2*w+L1, 0],
	[false, L1, 3*w+2*L1, 0],
	[true, L2, 0, w],
	[true, L2, w+L1, w],
	[true, L2, 2*w+2*L1, w],
	[true, L2, 3*w+3*L1, w],
	[false, L1, w, w+L2],
	[false, L3, 2*w+L1, w+L2],
	[false, L3, 3*w+L1+L3, w+L2],
	[false, L1, 3*w+2*L1, w+L2],
	[true, L2, 0, 2*w+L2],
	[true, L2, w+L4, 2*w+L2],
	[true, L2, 3*w+3*L1, 2*w+L2],
	[false, L4, w, 2*w+2*L2],
	[false, L4, 2*w+L4, 2*w+2*L2]
	];

let walls_rects = walls.map(function (wall) {
	return new Konva.Rect({
		x: offsetX + wall[2],
		y: offsetY + wall[3],
		width: wall[0]?w:wall[1],
		height: wall[0]?wall[1]:w,
		fill: 'black',
		stroke: 'black',
		strokeWidth: 5
	});
});

let walls_hovering = walls.map(function (wall) {return false;});
let walls_times_crossed = walls.map(function (wall) {return 0;});

walls_rects.forEach(function (wall) {
	layer.add(wall);
});

let corners_circles = corners.map(function (corner) {
	return new Konva.Circle({
		x: offsetX + corner[0],
		y: offsetY + corner[1],
		radius: cornerRadius,
		fill: 'white',
		stroke: 'black',
		strokeWidth: 8
	});
});

corners_circles.forEach(function (corner) {
	layer.add(corner);
}
);

let canvas = document.createElement('canvas');
canvas.width = screenWidth;
canvas.height = screenHeight;

let image = new Konva.Image({
	image: canvas,
	x: 0,
	y: 0,
});
layer.add(image);

let context = canvas.getContext('2d');
context.strokeStyle = '#000000';
context.lineJoin = 'round';
context.lineWidth = pathWidth;

let circle = new Konva.Circle({
	x: dotX,
	y: dotY,
	radius: dotRadius,
	fill: 'red',
	stroke: 'black',
	strokeWidth: 8,
	draggable: true,
});

layer.add(circle);

circle.on('mouseover', function () {
	document.body.style.cursor = 'pointer';
});
circle.on('mouseout', function () {
	document.body.style.cursor = 'default';
});

circle.on('dragstart', function () {
	lastPos = circle.absolutePosition()
});

circle.on('dragmove', function () {
	let currentPos = circle.absolutePosition();

	for (let i=0; i<corners_circles.length; ++i) {
		let xCorner = offsetX + corners[i][0];
		let yCorner = offsetY + corners[i][1];
		let deltaX = currentPos.x - xCorner;
		let deltaY = currentPos.y - yCorner;
		let dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
		let scale = dist / (cornerRadius + dotRadius);
		if (scale<1) {
			this.x(xCorner + deltaX/scale);
			this.y(yCorner + deltaY/scale);
			currentPos = circle.absolutePosition();
			break;
		}
	}

	for (let i=0; i<walls_rects.length; ++i) {
		if (haveIntersection(lastPos, currentPos, walls_rects[i])) {
			walls_times_crossed[i] += 1;
		}
	}
		/*
			console.log('intersection detected');
			if (!walls_hovering[i]) {
				walls_times_crossed[i] += 1;
				walls_hovering[i] = true;
			}
		} else {
			walls_hovering[i] = false;
		}
	}
	*/

	context.beginPath();
	context.moveTo(lastPos.x, lastPos.y);
	context.lineTo(currentPos.x, currentPos.y);
	context.closePath();
	context.stroke();
	layer.batchDraw();
	lastPos = currentPos;
});

function haveIntersection(lastPost, currentPos, wall) {
	let x1 = lastPos.x;
	let y1 = lastPos.y;

	let x2 = currentPos.x;
	let y2 = currentPos.y;

	let xLeft = x1<x2?x1:x2;
	let xRigth = x1>x2?x1:x2;

	let yTop = y1<y2?y1:y2;
	let yBot = y1>y2?y1:y2;

	wall = wall.getClientRect();
	let topLeftX = wall.x;
	let topLeftY = wall.y;
	let width = wall.width;
	let height =  wall.height;

	let yCut = y1+(topLeftX-x1)*(y2-y1)/(x2-x1);
	if (topLeftY<yCut && yCut<topLeftY+height && xLeft<topLeftX && topLeftX<xRigth) {
		return true;
	}

	let xCut = x1 + (topLeftY-y1)*(x2-x1)/(y2-y1);
	if (topLeftX<xCut && xCut<topLeftX+width && yTop<topLeftY && topLeftY<yBot) {
		return true;
	}

	return false;
}

document.getElementById('provera').addEventListener(
	'click',
	function () {
		for (let i=0; i<walls.length; ++i) {
			if (walls_times_crossed[i]==1) {
				walls_rects[i].fill('green');
				walls_rects[i].stroke('green');
			} else {
				walls_rects[i].fill('red');
				walls_rects[i].stroke('red');
			}
		}
	},
	false
);

document.getElementById('reset').addEventListener(
	'click',
	function () {
		walls_hovering.fill(false);
		walls_times_crossed.fill(0);

		circle.x(dotX);
		circle.y(dotY);
		context.clearRect(0, 0, canvas.width, canvas.height);
		for (let i=0; i<walls.length; ++i) {
				walls_rects[i].fill('black');
				walls_rects[i].stroke('black');
		}
	},
	false
);
