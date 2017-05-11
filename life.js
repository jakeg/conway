(function() {
  'use strict';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var starting_cells = [];
  var redraw = false;
  //var zoom = 4;

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 32) redraw = !redraw;
  });
  canvas.addEventListener('click', function(e) {
    // toggle the cell we've clicked
    //var x = e.offsetX/zoom;
    //var y = e.offsetY/zoom;
    cells[e.offsetX][e.offsetY] = !cells[e.offsetX][e.offsetY];
    ctx.fillStyle = cells[e.offsetX][e.offsetY] ? 'white' : 'black';
    if (!redraw) ctx.fillRect(e.offsetX, e.offsetY, 1, 1);
  });

  document.body.appendChild(canvas);
  resizeCanvas();

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';


  // make our cells such that cells[x][y] = 0 if dead
  var cells = [];
  for (var x=0; x<canvas.width; x++) {
    cells.push([]);
  }
  for (var y=0; y<canvas.height; y++) {
    cells.forEach(function(cell) {
      cell.push(0);
    });
  }

  starting_cells.forEach(function(cell) {
    //cells[cell[0] + (cell[1]-1) * canvas.width] = 1;
    cells[cell[0]][cell[1]] = true;
  });

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

    //ctx.scale(2, 2);

    var births = [];
    var deaths = [];

    var left;
    var right;
    var above;
    var below;
    for (var x=0; x<canvas.width; x++) {
      for (var y=0; y<canvas.height; y++) {

        // draw if alive
        if (cells[x][y]) ctx.fillRect(x, y, 1, 1);

        // look at our 8 neighbouring cells (wrapping around the canvas)
        left = (x ? x - 1 : canvas.width - 1);
        right = (x < canvas.width - 1 ? x + 1 : 0);
        above = (y ? y - 1 : canvas.height - 1);
        below = (y < canvas.height - 1 ? y + 1 : 0);

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


    var end = Date.now();
    ctx.fillText(end - start + 'ms', 10, canvas.height - 20);
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
    redraw = before;
  }

  window.pause = pause;
  window.unpause = unpause;
  window.cells = cells;

})();