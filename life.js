(function() {
  'use strict';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var starting_cells = [];
  var redraw = false;
  var zoom = 8;
  var width;
  var height;

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 32) redraw = !redraw;
  });
  canvas.addEventListener('click', function(e) {
    // toggle the cell we've clicked
    var x = Math.floor(e.offsetX/zoom);
    var y = Math.floor(e.offsetY/zoom);
    console.log(e.offsetX, x);
    cells[x][y] = !cells[x][y];
    ctx.fillStyle = cells[x][y] ? 'white' : 'black';
    if (!redraw) {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.fillRect(x, y, 1, 1);
      ctx.restore();
    }
  });

  document.body.appendChild(canvas);
  resizeCanvas();

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // make our cells such that cells[x][y] = 0 if dead
  var cells = [];
  for (var x=0; x<width; x++) {
    cells.push([]);
  }
  for (var y=0; y<height; y++) {
    cells.forEach(function(cell) {
      cell.push(0);
    });
  }

  draw();
  loop();

  // FUNCTIONS

  function loop() {
    if (redraw) draw();
    window.requestAnimationFrame(loop);
  }

  function draw() {
    console.log('drawing');

    var start = Date.now();

    // blank the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';

    ctx.save();
    ctx.scale(zoom, zoom);

    var births = [];
    var deaths = [];

    var left;
    var right;
    var above;
    var below;
    for (var x=0; x<width; x++) {
      for (var y=0; y<height; y++) {

        // draw if alive
        if (cells[x][y]) ctx.fillRect(x, y, 1, 1);

        // look at our 8 neighbouring cells (wrapping around the canvas)
        left = (x ? x - 1 : width - 1);
        right = (x < width - 1 ? x + 1 : 0);
        above = (y ? y - 1 : height - 1);
        below = (y < height - 1 ? y + 1 : 0);

        var score = cells[left][above] + cells[x][above] + cells[right][above] + cells[left][y] + cells[right][y] + cells[left][below] + cells[x][below] + cells[right][below];

        if (cells[x][y] && score < 2 || score > 3) deaths.push([x, y]); // we died :(
        if (!cells[x][y] && score == 3) births.push([x, y]); // we were born!
      }
    }

    // births
    for (var i=0; i<births.length; i++) {
      cells[births[i][0]][births[i][1]] = true;
    };

    // deaths
    for (var i=0; i<deaths.length; i++) {
      cells[deaths[i][0]][deaths[i][1]] = false;
    };

    ctx.restore();


    var end = Date.now();
    ctx.fillText(width + ' x ' + height + ' ~ ' + (end - start) + 'ms ~ ' + Math.round(1000 / (end - start)) + 'fps', 10, canvas.height - 20);
  }

  function pause() {
    redraw = false;
  }

  function unpause() {
    redraw = true;
  }
  
  function resizeCanvas() {
    var before = redraw;
    redraw = false;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = Math.ceil(canvas.width/zoom);
    height = Math.ceil(canvas.height/zoom);
    redraw = before;
  }

  window.pause = pause;
  window.unpause = unpause;
  window.cells = cells;

})();