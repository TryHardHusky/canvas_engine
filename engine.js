// Preload jQuery Elements
var $canvas = $("#canvas");
var $debug = $(".debug");
var $con = $(".con");

// Dictionaries
var engine = {};

engine.images = {
    // tilesheet: "public/img/tileset.png"
};

engine.canvas = $canvas[0];
engine.canvas.tileSize = 64;
engine.current_level = [];
engine.images_done = false;

engine.keys = {};
engine.last_update = new Date().getTime();
engine.past_update = new Date().getTime();

engine.create_canvas = function () {
    engine.canvas.tileSize = $con.find(".size").val();
    engine.canvas.col_count = $con.find(".col").val();
    engine.canvas.row_count = $con.find(".row").val();
    engine.canvas.height = (engine.canvas.row_count * engine.canvas.tileSize);
    engine.canvas.width = (engine.canvas.col_count * engine.canvas.tileSize);
    for(var c = 0; c < engine.canvas.col_count; c++){
        engine.current_level[c] = [];
        for(var r = 0; r < engine.canvas.row_count; r++){
            engine.current_level[c].push(0);
        }
    }
    engine.ctx = engine.canvas.getContext('2d');
    if(!engine.images_done) engine.preload_images();
};

engine.preload_images = function () {
    if(Object.keys(engine.images).length == 0) return engine.images_loaded();
    var loaded_images = engine.images;
    engine.images = {};
    Object.keys(loaded_images).forEach(function (path) {
        var image = new Image;
        image.onload = function () {
            engine.images[path] = image;
            if (Object.keys(engine.images).length == Object.keys(loaded_images).length){
                engine.images_loaded();
            }
        };
        image.onerror = function(){
            engine.preload_failed();
        };
        image.src = loaded_images[path];
    });
};

engine.preload_failed = function () {
    $debug.html("Preload Images Failed");
};

engine.images_loaded = function () {
    engine.images_done = true;
    engine.ready();
};

var demo_tile = {
    0 : {color : "#000"},
    1 : {color : "#CCC"}
};

engine.draw_grid = function(){
    engine.ctx.clearRect(0,0,engine.canvas.width, engine.canvas.height);
    for(var r = 0; r < engine.canvas.row_count; r++){
        for(var c = 0; c < engine.canvas.col_count; c++){
            engine.ctx.beginPath();
            engine.ctx.fillStyle = demo_tile[ engine.current_level[c][r]].color;
            engine.ctx.rect(
                c * engine.canvas.tileSize,
                r * engine.canvas.tileSize,
                engine.canvas.tileSize,
                engine.canvas.tileSize
            );
            engine.ctx.fill();
            engine.ctx.closePath();
        }
    }
};

engine.update = function () {

    // Test shit
    var aa = Math.floor(Math.random() * engine.canvas.col_count);
    var bb = Math.floor(Math.random() * engine.canvas.row_count);
    engine.current_level[aa][bb] = Math.random() < 0.5 ? 1 : 0;

    // Get Delay between updates
    engine.last_update = new Date().getTime();
    engine.update_delay = (engine.last_update - engine.past_update);
    engine.past_update = engine.last_update;

    engine.draw_grid();

    $debug.html(
        "Update Delay : " + engine.update_delay + "ms<br/>"
    );

    setTimeout(function(){
        requestAnimationFrame(engine.update);
    }, parseInt($con.find(".delay").val()));
};

engine.ready = function () {
    engine.update();
};

/*
 LOOOONG
















 POINTLESS
















 SPACES
 */

$con.find("input").change(function(){
    engine.create_canvas();
});

document.body.addEventListener("keydown", function (e) {
    engine.keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    delete engine.keys[e.keyCode];
});

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

engine.create_canvas();