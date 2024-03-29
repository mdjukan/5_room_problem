const walls0 = [[[0,0], [1,0]],
													[[0,0], [0,1]],
	            [[0,1], [1,1]],
	            [[1,0], [1,1]]]

const walls1 = [[[0,0], [1,0]],
													[[1,0], [2,0]],
	            [[0,0], [0,1]],
	            [[1,0], [1,1]],
													[[2,0], [2,1]],
	            [[0,1], [1,1]],
	            [[1,1], [2,1]],
													[[1,0], [2,0]],
	            [[1,1], [1,2]],
	            [[2,1], [2,2]],
													[[0,2], [1,2]],
	            [[2,1], [2,2]],
													[[0,1], [0,2]],
	            [[1,2], [2,2]]];

const walls2 = [[[0, 0], [1, 0]], 
             [[1, 0], [3, 0]],
             [[3, 0], [4, 0]],
             [[0, 0], [0, 1]],
             [[1, 0], [1, 1]],
             [[3, 0], [3, 1]],
             [[4, 0], [4, 1]],
             [[0, 1], [1, 1]],
             [[1, 1], [2, 1]],
             [[2, 1], [3, 1]],
             [[3, 1], [4, 1]],
             [[0, 1], [0, 2]],
             [[2, 1], [2, 2]],
             [[4, 1], [4, 2]],
             [[0, 2], [2, 2]],
             [[2, 2], [4, 2]]];


function cornerAdded(corner, corners) {
		for (let j=0; j<corners.length; ++j) {
			if (corners[j][0]==corner[0] && corners[j][1]==corner[1]) {
				return true;
			}
		}
	return false;
}

function getCorners(walls) {
	let corners = []
	for (let i=0; i<walls.length; ++i) {
		let c1 = walls[i][0];
		let c2 = walls[i][1];

		if (!cornerAdded(c1, corners)) {
			corners.push(c1);
		}

		if (!cornerAdded(c2, corners)) {
			corners.push(c2);
		}
	}

	return corners;
}

function getLevel(walls) {
	return {walls: walls, corners: getCorners(walls)};
}

export function getLevelHeight(level) {
	let levelHeight = 0;
	level.walls.forEach(function (wall) {
		const y1 = wall[0][1];
		const y2 = wall[1][1];
		levelHeight = Math.max(levelHeight, Math.max(y1, y2));
	});
	return levelHeight;
}

export function getLevelWidth(level) {
	let levelWidth = 0;
	level.walls.forEach(function (wall) {
		const x1 = wall[0][0];
		const x2 = wall[1][0];
		levelWidth = Math.max(levelWidth, Math.max(x1, x2));
	});
	return levelWidth;
}

const level0 = getLevel(walls0);
const level1 = getLevel(walls1);
const level2 = getLevel(walls2);

export const levels = [level0, level1, level2];
