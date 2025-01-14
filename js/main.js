const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const Y_TO_SCALE_RATIO = 0.002;
const Y_TO_SPEED_RATIO = 0.005;

const EVENT_KEY_PRESSED = "keydown";
const EVENT_KEY_RELEASED = "keyup";

window.onload = start;

let speed = 1;

let time = 10;
let score = 0;

let character, characterRightShapes, characterLeftShapes, characterDownShapes, characterUpShapes;
let background;
let tomatoShapes;

let tomatoes = [];

function start() {
    setupCanvas(document.getElementById("canvas"), CANVAS_HEIGHT, CANVAS_WIDTH);

    background = createCompoundShapeRectSprite(0, 0, 0, 0, 1, loadObjectFromJsonById("background"), false);

    tomatoShapes = loadObjectFromJsonById("tomato");

    generateTomatoes(100);

    // Load the objects which define the shapes to draw for the two versions of our ghost:
    characterRightShapes = loadObjectFromJsonById("character-right-shapes");
    characterLeftShapes = loadObjectFromJsonById("character-left-shapes");
    characterDownShapes = loadObjectFromJsonById("character-down-shapes");
    characterUpShapes = loadObjectFromJsonById("character-up-shapes");

    // Create a rectangular sprite using that shapes object (facing right to start)
    // The parameters we pass below will be used to set the properties of the sprite object.
    // We can access and change them later by referencing the property names on the `character` object.
    //                                          x    y  dx dy  scale      shapesObj        debug
    character = createCompoundShapeRectSprite(100, 100, 0, 0, 0.2, characterRightShapes, true);

    // begin drawing frames every 15 milliseconds
    setInterval(drawEachFrame, 15);
    setInterval(updateTimer, 1000);

    addEventListener("keydown", onKeyEvent);
    addEventListener("keyup", onKeyEvent);
}



function drawEachFrame(){
    clearCanvas();
    drawBorder();
    moveAndDrawSprites();
    checkCollisions();
    scaleCharacter();
    drawTimer();
    drawScore();
}



function updateTimer(){
    if(time > 0){
        time--;
    } else {
        time = "Time's up!";
    }
}

function drawTimer(){
    drawText(CANVAS_WIDTH / 2, 0, time, 36, "black");
}

function drawScore(){
    drawText(CANVAS_WIDTH / 2, 100, score, 36, "red");
}

function checkCollisions(){
    tomatoes.forEach((t, i)=> {
        if(rectOverlapsRect(t, character)){
            if(time > 0) score++;
            removeSprite(t);
            delete tomatoes.splice(i, 1);
        }
    });
}

function scaleCharacter(){
    if(character.y > 0){
        character.scale = character.y * Y_TO_SCALE_RATIO;
        speed = character.y * Y_TO_SPEED_RATIO;
    }
}


function onKeyEvent(e){
    if(e.code === "ArrowRight"){
        onKeyEventArrowRight(e.type);
    }
    else if (e.code === "ArrowLeft"){
        onKeyEventArrowLeft(e.type);
    }
    else if (e.code === "ArrowUp"){
        onKeyEventArrowUp(e.type);
    }
    else if (e.code === "ArrowDown"){
        onKeyEventArrowDown(e.type);
    }
    // you can add more key handlers here by adding more `else if` blocks
}

function onKeyEventArrowLeft(eventType){
    // switch to left-facing version
    character.shapesObj = characterLeftShapes;

    // set `dx` property to cause the sprite to move left
    if(eventType === EVENT_KEY_PRESSED){
        character.dx = -speed;
    }
    if(eventType === EVENT_KEY_RELEASED){
        character.dx = 0;
    }
}

function onKeyEventArrowRight(eventType){
    // switch to right-facing version
    character.shapesObj = characterRightShapes;

    // set `dx` property to cause the sprite to move right
    if(eventType === EVENT_KEY_PRESSED){
        character.dx = speed;
    }
    if(eventType === EVENT_KEY_RELEASED){
        character.dx = 0;
    }
}

function onKeyEventArrowUp(eventType){
    // switch to up-facing version
    character.shapesObj = characterUpShapes;

    // set `dx` property to cause the sprite to move right
    if(eventType === EVENT_KEY_PRESSED){
        character.dy = -speed;
    }
    if(eventType === EVENT_KEY_RELEASED){
        character.dy = 0;
    }
}

function onKeyEventArrowDown(eventType){
    // switch to down-facing version
    character.shapesObj = characterDownShapes;

    // set `dx` property to cause the sprite to move right
    if(eventType === EVENT_KEY_PRESSED){
        character.dy = speed;
    }
    if(eventType === EVENT_KEY_RELEASED){
        character.dy = 0;
    }
}

function generateTomatoes(n){
    for(let i = 0; i < n; i++){
        let x = getRandom(0, CANVAS_WIDTH);
        let y = getRandom(0, CANVAS_HEIGHT);
        // tomatoes.push(createCompoundShapeRectSprite(x, y, 0, 0, 0.1 * y * Y_TO_SCALE_RATIO, tomatoShapes, true));
        tomatoes.push(createCircleSprite(x, y, 0, 0, 5 * y * Y_TO_SCALE_RATIO, "red"));
    }
}

function getRandom(min, max) {  
    return Math.random() * (max - min) + min;
  }
  
function loadObjectFromJsonById(id){
    return JSON.parse(document.getElementById(id).textContent);
}
