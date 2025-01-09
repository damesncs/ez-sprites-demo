// v0.1.1

let _canvas;
let _ctx;

 const SHAPE_TYPE_RECT = "rect";
 const SHAPE_TYPE_CIRC = "circle";
 const SHAPE_TYPE_POINT = "point";

const POINT_RADIUS = 3;
const POINT_COLOR = "black";

const SPRITES = [];

 function setupCanvas (cvs, height, width){
    _canvas = cvs;
    _canvas.width = width;
    _canvas.height = height;
    _ctx = _canvas.getContext("2d");
}

 function drawBorder (){
    _ctx.strokeStyle = "black";
    _ctx.strokeRect(0, 0, _canvas.width, _canvas.height);
}

 function drawRect (x, y, width, height, color) {
    _ctx.fillStyle = color;
    _ctx.fillRect(x, y, width, height);
}

 function drawCircle (x, y, radius, color) {
    _ctx.fillStyle = color;
    _ctx.beginPath();
    // arc(x, y, radius, startAngle, endAngle)
    _ctx.arc(x, y, radius, 0, 2 * Math.PI);
    _ctx.fill();
}

 function drawText (x, y, text, fontSize, color){
    _ctx.fillStyle = color;
    _ctx.font = `${fontSize}px sans-serif`;
    _ctx.fillText(text, x, y + fontSize);
}

 function clearCanvas(){
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
}

 function getRandomColorHexString(){
    const r = getRandom8BitIntegerAsHexString();
    const g = getRandom8BitIntegerAsHexString();
    const b = getRandom8BitIntegerAsHexString();
    return `#${r}${g}${b}`;
}

 function getRandom8BitIntegerAsHexString(){
    return Math.trunc(Math.random() * 256).toString(16);
}

function getRectEdges (rect) {
    return {
        leftEdge: rect.x,
        rightEdge: rect.x + rect.width,
        topEdge: rect.y,
        bottomEdge: rect.y + rect.height
    }
}

 function createRectSprite(x, y, dx, dy, width, height, color){
    const draw = (r) => {
        drawRect(r.x, r.y, r.width, r.height, r.color);
    }

    let sprite = createSprite(x, y, dx, dy, color, draw, getRectEdges);
    sprite.width = width;
    sprite.height = height;
    return sprite;
}

 function createCircleSprite(x, y, dx, dy, radius, color){
    const draw = (c) => {
        drawCircle(c.x, c.y, c.radius, c.color);
    }

    const getCircleEdges = (circle) =>{
        return {
            leftEdge: circle.x - circle.radius,
            rightEdge: circle.x + circle.radius,
            topEdge: circle.y - circle.radius,
            bottomEdge: circle.y + circle.radius
        }
    }
    let sprite = createSprite(x, y, dx, dy, color, draw, getCircleEdges);
    sprite.radius = radius;
    return sprite;
}

 function createCompoundShapeRectSprite(x, y, dx, dy, scale, shapesObj, debug = false) {
    const draw = (s) => {
        drawShapesObj(s.shapesObj, s.x, s.y, s.scale, debug);
    }

    let sprite = createSprite(x, y, dx, dy, null, draw, getRectEdges);
    sprite.width = shapesObj.nativeWidth * scale;
    sprite.height = shapesObj.nativeHeight * scale;
    sprite.scale = scale;
    sprite.shapesObj = shapesObj;
    return sprite;
}

 function createSprite(x, y, dx, dy, color, drawFn, findEdgesFn){
    const sprite = {
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        color: color,
        leftEdge: 0,
        rightEdge: 0,
        topEdge: 0,
        bottomEdge: 0,
        draw: drawFn,
        findEdges: findEdgesFn
    };
    SPRITES.push(sprite);
    return sprite;
}

 function moveAndDrawSprites(){
    SPRITES.forEach(s => {
        s.x += s.dx;
        s.y += s.dy;
        s.draw(s);
        const edges = s.findEdges(s);
        s.leftEdge = edges.leftEdge;
        s.rightEdge = edges.rightEdge;
        s.topEdge = edges.topEdge;
        s.bottomEdge = edges.bottomEdge
    });
}

 function removeSprite(sprite){
    SPRITES.splice(SPRITES.indexOf(sprite), 1);
}


function rectOverlapsRect(r1, r2){
    return rectOverlapsRectX(r1, r2) && rectOverlapsRectY(r1, r2);
}

function rectOverlapsRectX(r1, r2){
    return r1.rightEdge > r2.leftEdge && r2.rightEdge > r1.leftEdge;
}

function rectOverlapsRectY(r1, r2){
    return r1.bottomEdge > r2.topEdge && r1.topEdge < r2.bottomEdge;
}

// returns true if circle sprite is colliding with rectangle sprite's top edge
 function circleRectangleTopEdgeAreColliding(c, r){
    if (c.y < r.topEdge && c.rightEdge > r.leftEdge && c.leftEdge < r.rightEdge){
        return checkDistanceToPointLessThanRadius(c, c.x, r.topEdge);
    }
    return false;
}

 function circleRectangleBottomEdgeAreColliding(c, r){
    if (c.y > r.bottomEdge && c.rightEdge > r.leftEdge && c.leftEdge < r.rightEdge){
        return checkDistanceToPointLessThanRadius(c, c.x, r.bottomEdge);
    }
    return false;
}

 function circleRectangleRightEdgeAreColliding(c, r){
    if (c.x > r.rightEdge && c.bottomEdge > r.topEdge && c.topEdge < r.bottomEdge){
        return checkDistanceToPointLessThanRadius(c, r.rightEdge, c.y);
    }
    return false;
}

 function circleRectangleLeftEdgeAreColliding(c, r){
    if (c.x < r.leftEdge && c.bottomEdge > r.topEdge && c.topEdge < r.bottomEdge){
        return checkDistanceToPointLessThanRadius(c, r.leftEdge, c.y);
    }
    return false;
}

// hat tip https://www.jeffreythompson.org/collision-detection/circle-rect.php
 function checkDistanceToPointLessThanRadius(circle, testX, testY){
    let distX = circle.x - testX;
    let distY = circle.y - testY;
    const distance = Math.sqrt( (distX*distX) + (distY*distY) );
    return distance <= circle.r;
}

 function drawShapesObj(sObj, originX = 0, originY = 0, scale = 1, debug = false){
    try {
        if(debug){
            _ctx.strokeStyle = "limegreen";
            _ctx.strokeRect(originX, originY, sObj.nativeWidth * scale, sObj.nativeHeight * scale);
        }
        sObj.shapes.forEach((s, i) => {
            if(s.type){
                const shapeX = originX + s.x * scale;
                const shapeY = originY + s.y * scale;
                switch(s.type) {
                    case SHAPE_TYPE_RECT:
                        drawRect(shapeX, shapeY, s.w * scale, s.h * scale, s.constantColor);
                        break;
                    case SHAPE_TYPE_CIRC:
                        drawCircle(shapeX, shapeY, s.r * scale, s.constantColor);
                        break;
                    case SHAPE_TYPE_POINT: // designer only
                        drawCircle(shapeX, shapeY, POINT_RADIUS, POINT_COLOR);
                        break;
                }
            }
            else {
                throw new Error("no shape type for shape at index " + i);
            }
        });
    }
    catch(e) {
        console.error(e);
    }
}
