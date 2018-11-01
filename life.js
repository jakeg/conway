(() => {
  const canvas = document.createElement('canvas')
  const bg = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const bgCtx = bg.getContext('2d')
  const startingCells = []
  let redraw = false
  let lastStart = 0
  let speed = 15 // speed/1000 is the max frames per second we try to draw. so speed = 10 gives 100fps max
  const maxSpeed = 100
  const speedMultiplier = 1.2
  const zoom = 4
  let generation = 0
  let width
  let height
  const cells = []

  init()

  function init () {
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 32) redraw = !redraw // space bar to pause
      if (e.keyCode === 187) speed = Math.min(maxSpeed, Math.ceil(speed * speedMultiplier))
      if (e.keyCode === 189) speed = Math.max(1, Math.floor(speed / speedMultiplier))
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
    width = Math.ceil(canvas.width / zoom)
    height = Math.ceil(canvas.height / zoom)

    // make our cells such that cells[x][y] = 0 if dead
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
    drawLoop()
  }

  function drawLoop () {
    if (redraw && Date.now() - lastStart > 1000 / speed) draw()
    window.requestAnimationFrame(drawLoop)
  }

  function draw () {
    let start = Date.now()
    lastStart = start
    generation++
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
    ctx.fillRect(5, 5, 190, 70)
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.fillText(`${width} x ${height} ~ Generation: ${generation}`, 10, 20)
    ctx.fillText('+ and - to change speed; space to pause', 10, 32)
    ctx.font = '20px sans-serif'
    ctx.fillText(`Speed: ${Math.round(speed)} gen/s`, 10, 55)

    ctx.textAlign = 'right'
    ctx.font = '10px sans-serif'
    ctx.fillText(`${Math.round(1000 / (end - start))}fps`, canvas.width - 5, canvas.height - 5)
    ctx.restore()
  }

  function drawBackground () {
    // we use our background canvas to show visited trails (so we don't have to redraw every pixel on every draw)
    bgCtx.fillStyle = 'black'
    bgCtx.fillRect(0, 0, canvas.width, canvas.height)
    bgCtx.fillStyle = 'rgba(0, 100, 0, 0.01)'
    bgCtx.scale(zoom, zoom)
  }

  function resizeCanvas () {
    let before = redraw
    redraw = false
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    bg.width = document.body.clientWidth
    bg.height = document.body.clientHeight
    redraw = before
    drawBackground()
  }
})()
