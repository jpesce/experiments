// Fixed params on setup
let urlSearchParams = new URLSearchParams(window.location.search)
let RENDER_AS_SVG=urlSearchParams.has("SVG")

const ELEMENT_ID = "canvas"

// Tweakable parameters
let PARAMS = {
  "COLUMNS": 12,
  "ROWS": 17,
  "CIRCLE_SIZE": 1,
  "BORDER": 15,

  "BLANK_CELL_PROBABILITY": 0,
  "SHIFT_HORIZONTALLY_PROBABILITY": 0.5,
  "SHIFT_VERTICALLY_PROBABILITY": 0.5,
  "COLOR_INVERTION_PROBABILITY": 0.5,

  "FG": "#020202",
  "BG": "#f1eee3",

  "LOOP": false
}

// Global helper
let CELL_SIDE
const calculateCanvasSize = () => {
  const element_width = document.getElementById(ELEMENT_ID).offsetWidth;
  const element_height = document.getElementById(ELEMENT_ID).offsetHeight;

  // Width as base
  let canvas_width = element_width
  let canvas_height = ((element_width - 2*PARAMS.BORDER) / PARAMS.COLUMNS * PARAMS.ROWS) + 2*PARAMS.BORDER

  // Height as base
  if(canvas_height > element_height) {
    canvas_height = element_height;
    canvas_width = ((element_height - 2*PARAMS.BORDER) / PARAMS.ROWS*PARAMS.COLUMNS) + 2 * PARAMS.BORDER
  }

  return { canvas_width, canvas_height }
}

const resetCanvas = () => {
  const { canvas_width, canvas_height } = calculateCanvasSize()
  resizeCanvas(canvas_width, canvas_height)
  frameCount=0
  redraw()
}

setup = () => {
  const { canvas_width, canvas_height } = calculateCanvasSize()
  // Fixed width and height
  //const canvas_width=2160
  //const canvas_height=2160

  const canvas = (RENDER_AS_SVG) ?
    createCanvas(canvas_width, canvas_height, SVG) :
    createCanvas(canvas_width, canvas_height)
  canvas.parent(ELEMENT_ID)

  frameRate(30)
}

draw = () => {
  // Change every second
  if((frameCount%30)!==1) return
  clear();

  if(PARAMS.LOOP) loop()
  else noLoop()

  // Auxiliary variables
  CELL_SIDE = (width-2*PARAMS.BORDER)/PARAMS.COLUMNS

  background(PARAMS.BG)

  // Canvas without the border
  const cellsCanvas = RENDER_AS_SVG ?
    createGraphics(width - 2*PARAMS.BORDER, height - 2*PARAMS.BORDER, SVG) :
    createGraphics(width - 2*PARAMS.BORDER, height - 2*PARAMS.BORDER);

  for(let stepX = 0; stepX < PARAMS.COLUMNS; stepX++) {
    for(let stepY = 0; stepY < PARAMS.ROWS; stepY++) {
      let positionX = stepX * CELL_SIDE
      let positionY = stepY * CELL_SIDE

      drawCell(cellsCanvas, positionX, positionY)
    }
  }
  image(cellsCanvas, PARAMS.BORDER, PARAMS.BORDER)
  cellsCanvas.remove() // Collect our garbage
}

//windowResized = () => resetCanvas()

const drawCell = (outerCanvas, leftCorner, topCorner) => {
  // Invert colors
  const shouldInvert = (Math.random() <= PARAMS.COLOR_INVERTION_PROBABILITY) ? true : false

  const cellBG = shouldInvert ? PARAMS.FG : PARAMS.BG
  const cellFG = shouldInvert ? PARAMS.BG : PARAMS.FG

  // Draw canvas
  const canvas = RENDER_AS_SVG ?
    createGraphics(CELL_SIDE, CELL_SIDE, SVG) :
    createGraphics(CELL_SIDE, CELL_SIDE)
  canvas.background(cellBG)
  canvas.fill(cellFG)
  canvas.noStroke()

  // Blank
  const shouldBeBlank = (Math.random() <= PARAMS.BLANK_CELL_PROBABILITY) ? true : false
  if(shouldBeBlank) {
    outerCanvas.image(canvas, leftCorner, topCorner)
    canvas.remove() // Collect our garbage
    return
  }

  // Shift circles
  const horizontalOffset = getRandomOffset(PARAMS.SHIFT_HORIZONTALLY_PROBABILITY)
  const verticalOffset = getRandomOffset(PARAMS.SHIFT_VERTICALLY_PROBABILITY)

  // Create a 2 by 2 matrix of circles and shift it
  const circleSize = PARAMS.CIRCLE_SIZE * CELL_SIDE
  for(let stepX = 0; stepX < 2; stepX++) {
    for(let stepY = 0; stepY < 2; stepY++) {
      let positionX  = -CELL_SIDE/2
      positionX += stepX * CELL_SIDE
      positionX += horizontalOffset * CELL_SIDE

      let positionY  = -CELL_SIDE/2
      positionY += stepY * CELL_SIDE
      positionY += verticalOffset * CELL_SIDE

      canvas.circle(positionX, positionY, circleSize)
    }
  }

  outerCanvas.image(canvas, leftCorner, topCorner)
  canvas.remove() // Collect our garbage
}

const getRandomOffset = (probability) => {
  const shouldShift = (Math.random() <= probability) ? true : false

  let offset = 0
  if(shouldShift) {
    offset = 1.5 // Start showing half a circle = |(

    // 0 = |(
    // 1 = )(
    // 2 = )|
    offset -= Math.floor((Math.random() * 3)); // Shift by 0, 1 or 2
  }
  return offset;
}
