(function() {
  'use strict';

  var canvas = document.createElement('canvas');
  var bg = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var bg_ctx = bg.getContext('2d');
  var starting_cells = [];
  var redraw = false;
  var last_start = 0;
  var speed = 15; // speed/1000 is the max frames per second we try to draw. so speed = 10 gives 100fps max
  var zoom = 4;
  var generation = 0;
  var width;
  var height;

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 32) redraw = !redraw; // space bar
    if (e.keyCode == 187) speed = Math.min(100, speed + 1);
    if (e.keyCode == 189) speed = Math.max(1, speed - 1);
  });
  canvas.addEventListener('click', function(e) {
    // toggle the cell we've clicked
    var x = Math.floor(e.offsetX/zoom);
    var y = Math.floor(e.offsetY/zoom);
    cells[x][y] = !cells[x][y];
    ctx.fillStyle = cells[x][y] ? 'white' : 'black';
    if (!redraw) {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.fillRect(x, y, 1, 1);
      ctx.restore();
    }
  });

  document.body.appendChild(bg);
  document.body.appendChild(canvas);
  resizeCanvas();

  // we use our background canvas to show visited trails (so we don't have to redraw every pixel on every draw)
  bg_ctx.fillStyle = 'black';
  bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
  bg_ctx.fillStyle = 'rgba(0, 100, 0, 0.01)';
  bg_ctx.scale(zoom, zoom);

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


  // seed with several random clumps of cells
  var clumping = 5; // % of the screen the clump fills
  var clumpings = 20;
  for (var i=0; i<clumpings; i++) {
    var m = Math.floor(Math.random() * (100-clumping));
    var n = Math.floor(Math.random() * (100-clumping));
    for (var x=Math.floor(width * m/100); x<Math.floor(width * (m+clumping)/100); x++) {
      for (var y=Math.floor(height * n/100); y<Math.floor(height * (n+clumping)/100); y++) {
        if (Math.floor(Math.random() * 3) + 1 === 1) starting_cells.push([x, y]);
      }
    }
  }

  starting_cells.forEach(function(cell) {
    cells[cell[0]][cell[1]] = 1;
  });

  redraw = true;
  draw();
  loop();

  // FUNCTIONS

  function loop() {
    if (redraw && Date.now() - last_start > 1000/speed) draw();
    window.requestAnimationFrame(loop);
  }

  function draw() {
    // console.log('drawing');

    var start = Date.now();
    last_start = start;

    generation++;

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';

    ctx.save();
    ctx.scale(zoom, zoom);

    var living = [];
    var left;
    var right;
    var above;
    var below;

    // draw if alive and add to the living array
    for (var x=0; x<width; x++) {
      for (var y=0; y<height; y++) {
        if (cells[x][y]) {
          ctx.fillRect(x, y, 1, 1); // draw it
          cells[x][y] = 9; // max score is 8 so we use this for maximum awesome to allow keeping living living on score = 2 (9 + 2 = 11)
          living.push([x, y]);
          bg_ctx.fillRect(x, y, 1, 1); // visited
        }
      }
    }

    // give points from the living
    var x;
    var y;
    for (var i=0; i<living.length; i++) {

      x = living[i][0];
      y = living[i][1];

      // look at our 8 neighbouring cells (wrapping around the canvas)
      left = (x ? x - 1 : width - 1);
      right = (x < width - 1 ? x + 1 : 0);
      above = (y ? y - 1 : height - 1);
      below = (y < height - 1 ? y + 1 : 0);

      cells[left][above]++;
      cells[x][above]++;
      cells[right][above]++;
      cells[left][y]++;
      cells[right][y]++;
      cells[left][below]++;
      cells[x][below]++;
      cells[right][below]++;
    }

    // turn score into life or death
    for (var x=0; x<width; x++) {
      for (var y=0; y<height; y++) {
        if (cells[x][y] === 3) cells[x][y] = 1; // score of 3 rises from the dead (or keeps living living)
        else if (cells[x][y] === 11 || cells[x][y] === 12) cells[x][y] = 1; // score of 2 keeps the living living (but doesn't raise the dead). 11 because living is given 9, plus 2 = 11
        else cells[x][y] = 0; // all others are dead
      }
    }

    ctx.restore();


    var end = Date.now();

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 150, 70);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText(width + ' x ' + height + ' ~ Generation: ' + generation, 10, 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Speed: ' + Math.round(speed) + 'fps', 10, 45);

    ctx.textAlign = 'right';
    ctx.font = '10px sans-serif';
    ctx.fillText(Math.round(1000 / (end - start)) + 'fps', canvas.width - 5, canvas.height - 5);
    ctx.restore();

    // redraw = false;
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
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    width = Math.ceil(canvas.width/zoom);
    height = Math.ceil(canvas.height/zoom);
    redraw = before;
  }

  window.pause = pause;
  window.unpause = unpause;
  window.cells = cells;

})();