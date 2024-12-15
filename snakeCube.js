const fs = require('fs');
const logger = new console.Console(fs.createWriteStream('./snakeCubeLog.txt'), fs.createWriteStream('./snakeCubeLog_error.txt'));
let enableLog = false;
function log(...x) {
    if(!enableLog) return;
    console.log(...x);
    logger.log(...x);
}

const inputSnake = [2,3,1,1,1,1,1,1,1,1,1,2,1,3,1,1,1,3,2,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,2,1,2,1,2,1,3,1,1,2,1,2];
// const inputSnake = [2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1, 2];
// const inputSnake = [3,2,2,2,1,1,1,2,2,1,1,2,1,2,1,1,2];
const gridSize = [4, 4, 4];
// const gridSize = [3,3,3];
class Snake {

    next = null;
    prev = null;
    x = 0; y = 0; z = 0;
    pos = 0;
    axis = null;
    length = 0;
    axisDir = 1;

    constructor(length) {
        this.length = length;
    }

    setPos1D(i) {
        this.pos = i;
        ({ x: this.x, y: this.y, z: this.z } = Snake.oneToThree(i));
    }

    setPos3D(x, y, z, axis, axisDir) {
        this.axis = axis;
        this.axisDir = axisDir;
        this.pos = Snake.threeToOne(x, y, z);
        [this.x, this.y, this.z] = [x,y,z];
        // ({ x: this.x, y: this.y, z: this.z } = { x, y, z });
    }

    getEndingPoint() {
        if (this.axis == 'X') return { x: this.x + this.axisDir*(this.length-1), y: this.y, z: this.z };
        if (this.axis == 'Y') return { x: this.x, y: this.y + this.axisDir*(this.length-1), z: this.z };
        if (this.axis == 'Z') return { x: this.x, y: this.y, z: this.z + this.axisDir*(this.length-1) };
    }

    static threeToOne(x, y, z) {
        if ([x, y, z].includes(null)) return null;
        return 16 * z + 4 * y + x;
    }

    static oneToThree(i) {
        if (i == null) return {};
        let z = Math.floor(i / 16);
        i = i % 16;
        let y = Math.floor(i / 4);
        i = i % 4;
        let x = i;
        return { x, y, z };
    }
}

let start = new Snake(inputSnake[0]);
let current = start;
for (let i = 1; i < inputSnake.length; i++) {
    current.next = new Snake(inputSnake[i]);
    current.next.prev = current;
    current = current.next;
}
enableLog = false;
spaceFilled = Array(gridSize[0]).fill(0).map(e => Array(gridSize[1]).fill(0).map(ee => Array(gridSize[2]).fill(false)));
console.log('Start = ' + new Date().getTime());
let outcome = recurse(0, start, null, spaceFilled);
console.log(outcome);
console.log('End = ' + new Date().getTime());
enableLog = true;

log('\n\n');
let ii=0;
while(start != null) {
    log('Piece ' + ii++ + ' => ' , ({x:start.x, y:start.y, z:start.z}) , start.getEndingPoint() , start.axisDir, start.axis , start.length);
    start = start.next;
}


function recurse(pieceNo, curNode, lastNode, spaceFilled) {
    // log(' '.repeat(pieceNo) + `PieceLast=${pieceNo - 1}  , X=${lastNode.x} , Y=${lastNode.y} , Z=${lastNode.z}           ${lastNode?.pos}`);
    log(' '.repeat(pieceNo) , 'PieceNo = ' + pieceNo , (lastNode?lastNode.getEndingPoint():{}) , lastNode?.axis, lastNode?.axisDir);
    if (pieceNo == inputSnake.length) return true;
    if (pieceNo == 0) {

        //iterate over every 3d coordinate
        for (let i = 0; i < gridSize[0]; i++) {
            for (let j = 0; j < gridSize[1]; j++) {
                for (let k = 0; k < gridSize[2]; k++) {
                    //check validity of placing first piece at given coordinate
                    //laying on X axis
                    if (i + curNode.length-1 < gridSize[0]) {
                        curNode.setPos3D(i, j, k, 'X', 1);
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'X', curNode.length, 1, true);
                        let possible = recurse(pieceNo + 1, curNode.next, curNode, spaceFilled);
                        if (possible) return true;
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'X', curNode.length, 1, false);
                    }
                    //laying on Y axis
                    if (j + curNode.length-1 < gridSize[1]) {
                        curNode.setPos3D(i, j, k, 'Y', 1);
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'Y', curNode.length, 1, true);
                        let possible = recurse(pieceNo + 1, curNode.next, curNode, spaceFilled);
                        if (possible) return true;
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'Y', curNode.length, 1, false);
                    }
                    //laying on Z axis
                    if (k + curNode.length-1 < gridSize[2]) {
                        curNode.setPos3D(i, j, k, 'Z', 1);
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'Z', curNode.length, 1, true);
                        let possible = recurse(pieceNo + 1, curNode.next, curNode, spaceFilled);
                        if (possible) return true;
                        markPlacesFilled(spaceFilled, { x:i, y:j, z:k }, 'Z', curNode.length, 1, false);
                    }
                }
            }
        }

        return false;

    } else {
        let lastPoint = lastNode.getEndingPoint();
        // log('#$#$', lastPoint);
        let axesToTry = ['X', 'Y', 'Z'];
        axesToTry = axesToTry.filter(a => a != lastNode.axis);

        for (let ax of axesToTry) {
            let axPropMap = { 'X': 'x', 'Y': 'y', 'Z': 'z' };
            let axIndexMap = { 'X': 0, 'Y': 1, 'Z': 2 };
            //check positive direction
            let startPoint = { ...lastPoint };
            startPoint[axPropMap[ax]] += 1;

            let endingPoint = { ...startPoint };
            endingPoint[axPropMap[ax]] += curNode.length-1;

            // log('#$#$ test +ve ' , startPoint , ax, endingPoint);

            if (endingPoint[axPropMap[ax]] < gridSize[axIndexMap[ax]] && placeable(spaceFilled, startPoint, curNode.length, ax, 1)) {
                // log('recurse +ve');
                curNode.setPos3D(startPoint.x, startPoint.y, startPoint.z, ax, 1);
                markPlacesFilled(spaceFilled, startPoint, ax, curNode.length, 1, true);
                let possible = recurse(pieceNo + 1, curNode.next, curNode, spaceFilled);
                if (possible) return true;
                markPlacesFilled(spaceFilled, startPoint, ax, curNode.length, 1, false);
            }

            //check negative direction
            startPoint = { ...lastPoint };
            startPoint[axPropMap[ax]] -= 1;

            endingPoint = { ...startPoint };
            endingPoint[axPropMap[ax]] -= (curNode.length-1);

            // log('#$#$ test -ve ' , startPoint , ax, endingPoint);

            if (endingPoint[axPropMap[ax]] >= 0 && placeable(spaceFilled, startPoint, curNode.length, ax, -1)) {
                // log('recurse -ve');
                curNode.setPos3D(startPoint.x, startPoint.y, startPoint.z, ax, -1);
                markPlacesFilled(spaceFilled, startPoint, ax, curNode.length, -1, true);
                let possible = recurse(pieceNo + 1, curNode.next, curNode, spaceFilled);
                if (possible) return true;
                markPlacesFilled(spaceFilled, startPoint, ax, curNode.length, -1, false);
            }
        }
        return false;
    }
}

function placeable(spaceFilled, { x, y, z }, length, ax, axisDir) {
    // log('** Placeable = ' , {x , y , z} , length , ax, axisDir);
    let retVal = true;
    if (ax == 'X') {
        for (let i = x; i != x + length*axisDir; i+=axisDir) {
            // log('^^ ' + i);
            if (spaceFilled[i][y][z]) {
                // log('NOT PLACEABLE => ' , i , y , z);
                retVal = false; break;
            }
        }
    }
    if (ax == 'Y') {
        for (let i = y; i != y + length*axisDir; i+=axisDir) {
            // log('^^ ' + i);
            if (spaceFilled[x][i][z]) {
                // log('NOT PLACEABLE => ' , x , i , z);
                retVal = false; break;
            }
        }
    }
    if (ax == 'Z') {
        for (let i = z; i != z + length*axisDir; i+=axisDir) {
            if (spaceFilled[x][y][i]) {
                // log('NOT PLACEABLE => ' , x , y , i);
                retVal = false; break;
            }
        }
    }
    return retVal;
}

function markPlacesFilled(spaceFilled, { x, y, z }, axis, length, axisDir, mark) {
    // log('** markPlacesFilled = ' , {x , y , z} , length , axis, axisDir, mark);
    if (axis == 'X') {
        for (let i = x; i != x + length*axisDir; i+=axisDir) {
            spaceFilled[i][y][z] = mark;
        }
    }
    if (axis == 'Y') {
        for (let i = y; i != y + length*axisDir; i+=axisDir) {
            spaceFilled[x][i][z] = mark;
        }
    }
    if (axis == 'Z') {
        for (let i = z; i != z + length*axisDir; i+=axisDir) {
            spaceFilled[x][y][i] = mark;
        }
    }
}

function clone(arr) {
    return JSON.parse(JSON.stringify(arr));
}




/*

BABYLON SIMULATION TO TEST THE SOLUTION MANUALLY BY MARKING CUBES IN A 3D GRID

const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 4, Math.PI / 4, 4, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    let box;

    for(let i=0;i<3;i++) {
        for(let j=0;j<3;j++) {
            for(let k=0;k<3;k++) {
                box = BABYLON.MeshBuilder.CreateBox("box", {height: 1, width: 1, depth: 1});
                box.position.x = i + 0.5;
                box.position.y = j + 0.5;
                box.position.z = k + 0.5;
                box.material = new BABYLON.StandardMaterial("box_mat", scene);
            }
        }
    }

    new BABYLON.AxesViewer(scene, 1);


    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type == BABYLON.PointerEventTypes.POINTERUP) {
            let box = pointerInfo.pickInfo.pickedMesh;
            // scene.meshUnderPointer.outlineColor = new BABYLON.Color3(1, 0.98, 0);
            box.renderOutline = true;
            box.outlineColor = new BABYLON.Color3(0,0,0);
            box.material.diffuseColor = BABYLON.Color3.Green();
        }
    });

    return scene;

};;

*/