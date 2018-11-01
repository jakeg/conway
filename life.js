(() => {
  'use strict'

  let canvas = document.createElement('canvas')
  let bg = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  let bgCtx = bg.getContext('2d')
  let startingCells = []
  let redraw = false
  let lastStart = 0
  let speed = 15 // speed/1000 is the max frames per second we try to draw. so speed = 10 gives 100fps max
  let zoom = 4
  let generation = 0
  let width
  let height

  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) redraw = !redraw // space bar to pause
    if (e.keyCode === 187) speed = Math.min(100, speed + 1)
    if (e.keyCode === 189) speed = Math.max(1, speed - 1)
  })
  canvas.addEventListener('click', (e) => {
    // toggle the cell we've clicked
    let x = Math.floor(e.offsetX / zoom)
    let y = Math.floor(e.offsetY / zoom)
    cells[x][y] = !cells[x][y]
    ctx.fillStyle = cells[x][y] ? 'white' : 'black'
    if (!redraw) {
      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.fillRect(x, y, 1, 1)
      ctx.restore()
    }
  })

  document.body.appendChild(bg)
  document.body.appendChild(canvas)
  resizeCanvas()

  // we use our background canvas to show visited trails (so we don't have to redraw every pixel on every draw)
  bgCtx.fillStyle = 'black'
  bgCtx.fillRect(0, 0, canvas.width, canvas.height)
  bgCtx.fillStyle = 'rgba(0, 100, 0, 0.01)'
  bgCtx.scale(zoom, zoom)

  // make our cells such that cells[x][y] = 0 if dead
  const cells = []
  for (let x = 0; x < width; x++) {
    cells.push([])
  }
  for (let y = 0; y < height; y++) {
    cells.forEach((cell) => {
      cell.push(0)
    })
  }

  // seed with several random clumps of cells
  let clumping = 5 // % of the screen the clump fills
  let clumpings = 20
  for (let i = 0; i < clumpings; i++) {
    let m = Math.floor(Math.random() * (100 - clumping))
    let n = Math.floor(Math.random() * (100 - clumping))
    for (let x = Math.floor(width * m / 100); x < Math.floor(width * (m + clumping) / 100); x++) {
      for (let y = Math.floor(height * n / 100); y < Math.floor(height * (n + clumping) / 100); y++) {
        if (Math.floor(Math.random() * 3) + 1 === 1) startingCells.push([x, y])
      }
    }
  }

  startingCells.forEach((cell) => {
    cells[cell[0]][cell[1]] = 1
  })

  redraw = true
  draw()
  loop()

  // FUNCTIONS

  function loop () {
    if (redraw && Date.now() - lastStart > 1000 / speed) draw()
    window.requestAnimationFrame(loop)
  }

  function draw () {
    // console.log('drawing');

    let start = Date.now()
    lastStart = start

    generation++

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'white'

    ctx.save()
    ctx.scale(zoom, zoom)

    let living = []
    let left
    let right
    let above
    let below

    // draw if alive and add to the living array
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (cells[x][y]) {
          ctx.fillRect(x, y, 1, 1) // draw it
          cells[x][y] = 9 // max score is 8 so we use this for maximum awesome to allow keeping living living on score = 2 (9 + 2 = 11)
          living.push([x, y])
          bgCtx.fillRect(x, y, 1, 1) // visited
        }
      }
    }

    // give points from the living
    for (let i = 0; i < living.length; i++) {
      let x = living[i][0]
      let y = living[i][1]

      // look at our 8 neighbouring cells (wrapping around the canvas)
      left = (x ? x - 1 : width - 1)
      right = (x < width - 1 ? x + 1 : 0)
      above = (y ? y - 1 : height - 1)
      below = (y < height - 1 ? y + 1 : 0)

      cells[left][above]++
      cells[x][above]++
      cells[right][above]++
      cells[left][y]++
      cells[right][y]++
      cells[left][below]++
      cells[x][below]++
      cells[right][below]++
    }

    // turn score into life or death
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (cells[x][y] === 3) cells[x][y] = 1 // score of 3 rises from the dead (or keeps living living)
        else if (cells[x][y] === 11 || cells[x][y] === 12) cells[x][y] = 1 // score of 2 keeps the living living (but doesn't raise the dead). 11 because living is given 9, plus 2 = 11
        else cells[x][y] = 0 // all others are dead
      }
    }

    ctx.restore()

    let end = Date.now()

    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(5, 5, 150, 70)
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.fillText(`${width} x ${height} ~ Generation: ${generation}`, 10, 20)
    ctx.font = '20px sans-serif'
    ctx.fillText(`Speed: ${Math.round(speed)}fps`, 10, 45)

    ctx.textAlign = 'right'
    ctx.font = '10px sans-serif'
    ctx.fillText(`${Math.round(1000 / (end - start))}fps`, canvas.width - 5, canvas.height - 5)
    ctx.restore()

    // redraw = false;
  }

  function resizeCanvas () {
    let before = redraw
    redraw = false
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    bg.width = window.innerWidth
    bg.height = window.innerHeight
    width = Math.ceil(canvas.width / zoom)
    height = Math.ceil(canvas.height / zoom)
    redraw = before
  }
})()
