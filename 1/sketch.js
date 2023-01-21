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

windowResized = () => {
  // On mobile window is resized constantly because the browser hides and shows
  // UX elements according to user scroll. So only only readapt canvas to window
  // size on desktop.
  if(!isOnMobile()) resetCanvas()
}

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

let isOnMobile = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
