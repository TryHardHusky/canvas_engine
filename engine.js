// Preload jQuery Elements
var $canvas = $("#canvas");
var $debug = $(".debug");
var $con = $(".con");

// Dictionaries
var engine = {};

engine.images = {
    tileset: "public/img/tiles.png",
    crosshair: "public/img/crosshair.png"
};

engine.current_level = [];

engine.layers = {
    crosshair: []
};

engine.canvas = $canvas[0];
engine.canvas.tileSize = 32;
engine.images_done = false;
engine.canvas.draw_numbers = false;

engine.mouse = {};
engine.mouse.x = 0;
engine.mouse.y = 0;
engine.mouse.tileX = 0;
engine.mouse.tileY = 0;

engine.keys = {};
engine.last_update = new Date().getTime();
engine.past_update = new Date().getTime();

$canvas.on('click', function (e) {
    engine.mouse.x = e.offsetX;
    engine.mouse.y = e.offsetY;
    engine.mouse.tileX = Math.floor(engine.mouse.x / engine.canvas.tileSize);
    engine.mouse.tileY = Math.floor(engine.mouse.y / engine.canvas.tileSize);
});

engine.create_canvas = function () {
    engine.canvas.col_count = 20;
    engine.canvas.row_count = 20;
    engine.canvas.height = (engine.canvas.row_count * engine.canvas.tileSize);
    engine.canvas.width = (engine.canvas.col_count * engine.canvas.tileSize);
    for (var c = 0; c < engine.canvas.col_count; c++) {
        engine.layers[c] = [];
        engine.current_level[c] = [];
        for (var r = 0; r < engine.canvas.row_count; r++) {
            var x = Math.random(), t;
            if (x > 0 && x < 0.25) t = 300;
            if (x > 0.25 && x < 0.5) t = 301;
            if (x > 0.5 && x < 0.55) t = 302;
            if (x > 0.55 && x < 0.6) t = 332;
            if (x > 0.6 && x < 0.7) t = 331;
            if (x > 0.7 && x < 1) t = 330;
            engine.current_level[c].push(t);
            engine.layers[c].push(1);
        }
    }
    engine.ctx = engine.canvas.getContext('2d');
    if (!engine.images_done) engine.preload_images();
};

engine.preload_images = function () {
    if (Object.keys(engine.images).length == 0) return engine.images_loaded();
    var loaded_images = engine.images;
    engine.images = {};
    Object.keys(loaded_images).forEach(function (path) {
        var image = new Image;
        image.onload = function () {
            engine.images[path] = image;
            if (Object.keys(engine.images).length == Object.keys(loaded_images).length) {
                engine.images_loaded();
            }
        };
        image.onerror = function () {
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

engine.draw_numbers = function (r, c) {
    engine.ctx.beginPath();
    engine.ctx.font = "7pt monospace";
    engine.ctx.strokeStyle = "rgba(255,0,0, 0.7)";
    engine.ctx.textBaseline = "hanging";
    engine.ctx.strokeText((r + "-" + c), c * engine.canvas.tileSize + 5, r * engine.canvas.tileSize + 5);
    engine.ctx.stroke();
    engine.ctx.closePath();
};

engine.clear_canvas = function () {
    engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
};

engine.draw = function () {
    var tile, tile_row, tile_col;
    var tile_count = Math.floor(engine.images.tileset.width / engine.canvas.tileSize);
    for (var r = 0; r < engine.canvas.row_count; r++) {
        for (var c = 0; c < engine.canvas.col_count; c++) {
            tile = engine.current_level[r][c];
            tile_row = (tile / tile_count) | 0;
            tile_col = (tile % tile_count) | 0;

            engine.ctx.drawImage(
                engine.images['tileset'],
                (tile_col * engine.canvas.tileSize),
                (tile_row * engine.canvas.tileSize),
                engine.canvas.tileSize,
                engine.canvas.tileSize,
                (c * engine.canvas.tileSize),
                (r * engine.canvas.tileSize),
                engine.canvas.tileSize,
                engine.canvas.tileSize
            );
            if (engine.canvas.draw_numbers) engine.draw_numbers(r, c);

            engine.ctx.drawImage(
                engine.images['crosshair'],
                0,
                0,
                engine.canvas.tileSize,
                engine.canvas.tileSize,
                (engine.mouse.tileX * engine.canvas.tileSize),
                (engine.mouse.tileY * engine.canvas.tileSize),
                engine.canvas.tileSize,
                engine.canvas.tileSize
            );

        }
    }
};

engine.update = function () {


    //var aa = Math.floor(Math.random() * engine.canvas.col_count);
    //var bb = Math.floor(Math.random() * engine.canvas.row_count);
    //engine.current_level[aa][bb] = Math.random() < 0.5 ? 5 : 8;


    // Get Delay between updates
    engine.last_update = new Date().getTime();
    engine.update_delay = (engine.last_update - engine.past_update);
    engine.past_update = engine.last_update;

    engine.clear_canvas();
    engine.draw();

    $debug.html(
        "Update Delay : " + engine.update_delay + "ms<br/>" +
        "Mouse : " + JSON.stringify(engine.mouse)
    );

    setTimeout(function () {
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

document.body.addEventListener("keydown", function (e) {
    engine.keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    delete engine.keys[e.keyCode];
});

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

engine.create_canvas();