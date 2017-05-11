(function() {
  'use strict';

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  window.redraw = false;

  window.addEventListener('resize', function() {resizeCanvas()});

  document.body.appendChild(canvas);
  resizeCanvas();

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';


  // x, y, alive, x, y, alive, ...
  var cells = [];


  for (var y=0; y<canvas.height; y++) {
    for (var x=0; x<canvas.width; x++) {
      //cells.push(0);
      cells.push([x, y, 0]);
    }
  }

  var starting_cells = [
    [0, 5],
    [50, 50],
  ];

  starting_cells.forEach(function(cell) {
    cells[cell[0] + (cell[1]-1) * canvas.width] = 1;
  });

  draw();

  // FUNCTIONS

  function draw() {
    if (redraw) {
      console.log('drawing');

      var start = Date.now();

      // blank the canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';

      /*
      var i=0;
      for (var y=0; y<canvas.height; y++) {
        for (var x=0; x<canvas.width; x++) {
          if (cells[i]) {
            ctx.fillRect(x, y, 1, 1);
            cells[i] = 0;
            cells[i-1] = 1;
          }
          i++;
        }
      }
      */

      cells.forEach(function(cell) {
        if (cell[2]) ctx.fillRect(cell[0], cell[1], 1, 1);
        cell[0]++;
        cell[1]++;
        if (cell[0] > canvas.width) cell[0] = 0;
        if (cell[1] > canvas.height) cell[1] = 0;
      });

      /*
      cells.forEach(function(cell) {
        ctx.fillRect(cell[0], cell[1], 1, 1);
        cell[0]++;
        cell[1]++;
        if (cell[0] > canvas.width) cell[0] = 0;
        if (cell[1] > canvas.height) cell[1] = 0;
      });
      */

      var end = Date.now();
      ctx.fillText(end - start + 'ms', 10, canvas.height - 20);
    }
    window.requestAnimationFrame(draw);
  }

  function pause() {
    redraw = false;
  }

  function unpause() {
    redraw = true;
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw = true;
  }

  window.pause = pause;
  window.unpause = unpause;
  window.cells = cells;

})();