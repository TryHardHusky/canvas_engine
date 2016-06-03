// Preload jQuery Elements
var $canvas = $("#canvas");
var $debug = $(".debug");

// Dictionaries
var engine = {};

var TILES = {
    36: {
        "name": "gravestone_a",
        "solid": true
    },
    21: {
        "name": "small_bush",
        "solid": false
    },
    642: {
        name: "small_tree",
        "solid": true
    },
    643: {
        name: "large_tree",
        "solid": true
    }
};

engine.images = {
    tileset_old: "public/img/tiles.png",
    crosshair: "public/img/crosshair.png",
    tileset: "public/img/tileset.png"
};

engine.layers = {
    background: [],
    objects: [],
    collisions: []
};

engine.canvas = $canvas[0];
engine.canvas.tileSize = 32;
engine.images_done = false;
engine.canvas.draw_numbers = false;
engine.canvas.show_collisions = false;

engine.mouse = {};
engine.mouse.x = 0;
engine.mouse.y = 0;
engine.mouse.tileX = 0;
engine.mouse.tileY = 0;
engine.mouse.down = false;

engine.keys = {};
engine.last_update = new Date().getTime();
engine._fps = 0;
engine.fps = 0;

$canvas.on('click', function (e) {
    console.log("Fuck2");
    engine.mouse.x = e.offsetX;
    engine.mouse.y = e.offsetY;
    engine.mouse.tileX = Math.floor(engine.mouse.x / engine.canvas.tileSize);
    engine.mouse.tileY = Math.floor(engine.mouse.y / engine.canvas.tileSize);

    var a = engine.layers.objects[engine.mouse.tileY][engine.mouse.tileX];
    if (a == 36) {
        engine.layers.collisions[engine.mouse.tileY][engine.mouse.tileX] = 0;
        engine.layers.objects[engine.mouse.tileY][engine.mouse.tileX] = 21;
    } else if (a == 21) {
        engine.layers.collisions[engine.mouse.tileY][engine.mouse.tileX] = 0;
        engine.layers.objects[engine.mouse.tileY][engine.mouse.tileX] = 0;
    } else if (a == 0) {
        engine.layers.collisions[engine.mouse.tileY][engine.mouse.tileX] = 1;
        engine.layers.objects[engine.mouse.tileY][engine.mouse.tileX] = 36;
    }
});

engine.create_canvas = function () {
    engine.canvas.col_count = 15;
    engine.canvas.row_count = 15;
    engine.canvas.height = (engine.canvas.row_count * engine.canvas.tileSize);
    engine.canvas.width = (engine.canvas.col_count * engine.canvas.tileSize);
    for (var c = 0; c < engine.canvas.col_count; c++) {
        engine.layers.background[c] = [];
        engine.layers.objects[c] = [];
        engine.layers.collisions[c] = [];
        for (var r = 0; r < engine.canvas.row_count; r++) {
            var x = Math.random(), t;
            if (x > 0 && x < 0.25) t = 0;
            if (x > 0.25 && x < 0.57) t = 1;
            if (x > 0.57 && x < 0.58) t = 9;
            if (x > 0.58 && x < 0.59) t = 10;
            if (x > 0.59 && x < 0.7) t = 1;
            if (x > 0.7 && x < 1) t = 8;
            console.log(t);
            engine.layers.background[c].push(t);
            engine.layers.objects[c].push(0);
            engine.layers.collisions[c].push(0);
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

engine.draw_collisions = function (r, c) {
    engine.ctx.beginPath();
    engine.ctx.fillStyle = "rgba(255,0,0,.3)";
    if (engine.layers.collisions[r][c])
        engine.ctx.fillRect(
            c * engine.canvas.tileSize,
            r * engine.canvas.tileSize,
            engine.canvas.tileSize,
            engine.canvas.tileSize
        );
    engine.ctx.closePath();
};

engine.clear_canvas = function () {
    engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
};

engine.draw_background = function () {
    var tile, tile_row, tile_col;
    var tile_count = Math.floor(engine.images.tileset.width / engine.canvas.tileSize);
    for (var r = 0; r < engine.canvas.row_count; r++) {
        for (var c = 0; c < engine.canvas.col_count; c++) {
            tile = engine.layers.background[r][c];
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
        }
    }
};

engine.draw = function () {
    var tile, tile_row, tile_col;
    var tile_count = Math.floor(engine.images.tileset.width / engine.canvas.tileSize);
    for (var r = 0; r < engine.canvas.row_count; r++) {
        for (var c = 0; c < engine.canvas.col_count; c++) {
            tile = engine.layers.objects[r][c];
            tile_row = (tile / tile_count) | 0;
            tile_col = (tile % tile_count) | 0;
            if (TILES[tile]) {
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
                if(TILES[tile].solid){
                    if(engine.canvas.show_collisions) engine.draw_collisions(r, c);
                }
            }
            if (engine.canvas.draw_numbers) engine.draw_numbers(r, c);
        }
    }
};

engine.draw_crosshair = function () {
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
};

engine.count_frame = function () {
    var now = new Date().getTime();
    if (( engine.last_update + 1000 ) <= now) {

        engine.last_update = now;
        engine.fps = engine._fps;
        engine._fps = 0;

    } else engine._fps++;

};

engine.update = function () {
    engine.count_frame();


    //var aa = Math.floor(Math.random() * engine.canvas.col_count);
    //var bb = Math.floor(Math.random() * engine.canvas.row_count);
    //engine.current_level[aa][bb] = Math.random() < 0.5 ? 5 : 8;


    // Get Delay between updates

    engine.clear_canvas();
    engine.draw_background();
    engine.draw();

    $debug.html(
        "FPS : " + engine.fps,
        "Mouse : " + JSON.stringify(engine.mouse)
    );

    requestAnimationFrame(engine.update);
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