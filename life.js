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

  var cells = [
    [0, 5],
    [50, 50],
  ];

  draw();

  // FUNCTIONS

  function draw() {
    if (redraw) {
      console.log('drawing');

      // blank the canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';

      
      

      cells.forEach(function(cell) {
        ctx.fillRect(cell[0], cell[1], 1, 1);
        cell[0]++;
        cell[1]++;
        if (cell[0] > canvas.width) cell[0] = 0;
        if (cell[1] > canvas.height) cell[1] = 0;
      });

      // redraw = false;
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

})();