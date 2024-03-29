import Konva from 'konva';
import { levels, getLevelHeight, getLevelWidth } from './levels.js';

const wallColor = 'black';
const cornerColor = 'black';

const WALL_WIDTH_TO_SCREEN_HEIGHT = 0.02;
const CORNER_RADIUS_TO_SCREEN_HEIGHT = 0.03;
const CORNER_DIST_LIMIT_TO_SCREEN_HEIGHT = 0.04;

const SCREEN_LEVEL_RATIO = 2;

const PEN_OFFSET_X = 0.1;
const PEN_OFFSET_Y = 0.25;
const SCREEN_PEN_RATIO = 6;
const PEN_ORIGINAL_HEIGHT = 27.5;
const PEN_TIP_OFFSET_ORIGINAL = 2;
const PATH_WIDTH_TO_SCREEN_HEIGHT = 0.015;

const BACKGROUND_WIDTH = 612;
const BACKGROUND_HEIGHT = 382;

const DIST_LIMIT_TO_SCREEN_WIDTH = 0.08;

const BUTTON_WIDTH_TO_SCREEN_WIDTH = 0.18;
const BUTTON_HEIGHT_TO_SCREEN_HEIGHT = 0.08;
const BUTTON_FONT_SIZE = 0.04;
const BUTTON_BORDER_TO_SCREEN_HEIGHT = 0.01;

export function getDimensions(screenWidth, screenHeight) {
	const dims = {};
	dims.penPosition = [PEN_OFFSET_X * screenWidth, PEN_OFFSET_Y * screenHeight];
	dims.penScale = screenHeight / (SCREEN_PEN_RATIO * PEN_ORIGINAL_HEIGHT);
	dims.penTipOffset = dims.penScale * PEN_TIP_OFFSET_ORIGINAL;

	dims.backgroundScaleX = screenWidth / BACKGROUND_WIDTH;
	dims.backgroundScaleY = screenHeight / BACKGROUND_HEIGHT;

	dims.distLimit = screenWidth * DIST_LIMIT_TO_SCREEN_WIDTH;
	dims.pathWidth = PATH_WIDTH_TO_SCREEN_HEIGHT * screenHeight;
	dims.cornerDistLimit = CORNER_DIST_LIMIT_TO_SCREEN_HEIGHT * screenHeight;

	dims.buttonHeight = BUTTON_HEIGHT_TO_SCREEN_HEIGHT * screenHeight;
	dims.buttonWidth = BUTTON_WIDTH_TO_SCREEN_WIDTH * screenWidth;
	dims.buttonFontSize = Math.round(BUTTON_FONT_SIZE * screenHeight);
	dims.buttonPadding = Math.round((dims.buttonHeight - dims.buttonFontSize)/2);
	dims.buttonBorder = BUTTON_BORDER_TO_SCREEN_HEIGHT * screenHeight;
	dims.buttonBasePosition = [screenWidth - 1.3 * dims.buttonWidth, screenHeight - 2 * dims.buttonHeight];

	return dims;
}

function getLevelScaled(level, screenWidth, screenHeight) {
	const levelHeight = getLevelHeight(level);
	const unit = screenHeight / (SCREEN_LEVEL_RATIO * levelHeight);
	const levelScaled = {walls:[], corners:[]};

	level.walls.forEach(function (wall) {
		const x1 = wall[0][0];
		const y1 = wall[0][1];
		const x2 = wall[1][0];
		const y2 = wall[1][1];
		levelScaled.walls.push([[unit*x1, unit*y1], [unit*x2, unit*y2]]);
	});

	level.corners.forEach(function (corner) {
		const x = corner[0];
		const y = corner[1];
		levelScaled.corners.push([unit*x, unit*y]);
	});

	return levelScaled;
}

function getOffset(level, screenWidth, screenHeight) {
	const levelHeight = getLevelHeight(level);
	const levelWidth = getLevelWidth(level);
	const unit = screenHeight / (SCREEN_LEVEL_RATIO * levelHeight);
	const offset = {};
	offset.x = (screenWidth - levelWidth * unit) / 2;
	offset.y = (screenHeight - levelHeight * unit) / 2;
	return offset;
}

function getLevelElements(levelScaled, offset, screenWidth, screenHeight) {
	const w = WALL_WIDTH_TO_SCREEN_HEIGHT * screenHeight;
	const r = CORNER_RADIUS_TO_SCREEN_HEIGHT * screenHeight;
	const levelElements = {walls:[], corners:[]};

	levelScaled.walls.forEach(function (wall) {
		if (wall[0][0]==wall[1][0]) {
			////////VERTICAL////////
			levelElements.walls.push(new Konva.Rect({
				x: offset.x + wall[0][0] - w/2,
				y: offset.y + wall[0][1],
				width: w,
				height: wall[1][1] - wall[0][1],
				fill: wallColor
			}));
		} else {
			////////HORIZONTAL/////////
			levelElements.walls.push(new Konva.Rect({
				x: offset.x + wall[0][0],
				y: offset.y + wall[0][1] - w/2,
				width: wall[1][0] - wall[0][0],
				height: w,
				fill: wallColor
			}));
		}
	});

	levelScaled.corners.forEach(function (corner) {
		levelElements.corners.push(new Konva.Circle({ 
			x: offset.x + corner[0],
			y: offset.y + corner[1],
			radius: r,
			fill: cornerColor
		}));
	});

	return levelElements;
};

function offsetLevel(levelScaled, offset) {
	const level = {walls:[], corners:[]};
	levelScaled.walls.forEach(function (wall) {
		const x1 = wall[0][0];
		const y1 = wall[0][1];
		const x2 = wall[1][0];
		const y2 = wall[1][1];
		level.walls.push([[offset.x + x1, offset.y + y1], [offset.x + x2, offset.y + y2]]);
	});

	levelScaled.corners.forEach(function (corner) {
		const x = corner[0];
		const y = corner[1];
		level.corners.push([offset.x + x, offset.y + y]);
	});

	return level;
}

function getLevel(levelData, screenWidth, screenHeight) {
	const levelScaled = getLevelScaled(levelData, screenWidth, screenHeight);
	const offset = getOffset(levelData, screenWidth, screenHeight);
	const levelElements = getLevelElements(levelScaled, offset, screenWidth, screenHeight);

	const level = offsetLevel(levelScaled, offset);

	return {walls: level.walls, corners: level.corners, elements: levelElements, intersection: (new Array(level.walls.length)).fill(0)};
}

export function getLevels(screenWidth, screenHeight) {
	const ls = [];
	levels.forEach(function (level) {
		ls.push(getLevel(level, screenWidth, screenHeight));
	});

	return ls;
}
