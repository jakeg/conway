(function() {
  'use strict';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var starting_cells = [];
  var redraw = false;

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 32) redraw = !redraw;
  });
  canvas.addEventListener('click', function(e) {
    cells[e.offsetX][e.offsetY] = !cells[e.offsetX][e.offsetY];
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

    var born = [];

    for (var x=0; x<canvas.width; x++) {
      for (var y=0; y<canvas.height; y++) {
        if (cells[x][y]) {
          ctx.fillRect(x, y, 1, 1);
          cells[x][y] = false; // kill this one
          born.push([x, y]);
        }
      }
    }

    for (var i=0; i<born.length; i++) {
      born[i][0]++;
      born[i][1]++;
      if (born[i][0] > canvas.width - 1) born[i][0] = 0;
      if (born[i][1] > canvas.height - 1) born[i][1] = 0;
      cells[born[i][0]][born[i][1]] = true;
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