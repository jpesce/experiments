let video;

// Fixed params on setup
let urlSearchParams = new URLSearchParams(window.location.search)
let RENDER_AS_SVG = urlSearchParams.has("SVG")
let OPTIONS_INDEX = 0;
const OPTIONS = [
  {
    gridSize: 20,
    invert: true,
  },
  {
    gridSize: 20,
    invert: false,
  }
]
let CURRENT_OPTIONS = OPTIONS[OPTIONS_INDEX]
const ELEMENT_ID = "canvas"

function mouseClicked() {
  OPTIONS_INDEX = (OPTIONS_INDEX + 1) % 2
  CURRENT_OPTIONS = OPTIONS[OPTIONS_INDEX]
}

let monospacedFont;
let aspectRatio = 1.777777;
async function preload() {
  monospacedFont = await loadFont('BigBlueTermPlusNerdFontMono-Regular.ttf');
  aspectRatio = await getAspectRatio();
}

const calculateCanvasSize = () => {
  const element_width = document.getElementById(ELEMENT_ID).offsetWidth;
  const element_height = document.getElementById(ELEMENT_ID).offsetHeight;

  let canvas_width = element_width;
  let canvas_height = element_height;

  return { canvas_width, canvas_height }
}

async function resetCanvas() {
  const { canvas_width, canvas_height } = calculateCanvasSize();

  resizeCanvas(canvas_width, canvas_height);
  frameCount = 0;
  redraw();

  video.remove();
  video = createCapture(VIDEO);
  video.size(canvas.height * aspectRatio, canvas.height);
  video.hide();
}

async function setup() {
  pixelDensity(1);
  const { canvas_width, canvas_height } = calculateCanvasSize()

  canvas = (RENDER_AS_SVG) ?
    createCanvas(canvas_width, canvas_height, SVG) :
    createCanvas(canvas_width, canvas_height)
  canvas.parent(ELEMENT_ID)

  video = createCapture(VIDEO);
  video.size(canvas.height * aspectRatio, canvas.height);
  video.hide();

  textFont(monospacedFont);
}

async function draw() {
  if(!video) return;

  if(!CURRENT_OPTIONS.invert) background(255);
  if(CURRENT_OPTIONS.invert) background(0);

  const gridSize = CURRENT_OPTIONS.gridSize;
  video.loadPixels();
  for(let y=0; y < canvas.height; y+=gridSize) {
    for(let x=0; x < canvas.width; x+=gridSize) {
      let index = (y * video.width + x) * 4;
      let red = video.pixels[index];

      //drawCircle(gridSize, red, x, y);
      //drawSquare(gridSize, red, x, y);
      drawText(gridSize, red, x, y);
      //drawLine(gridSize, red, x, y);
    }
  }
}

function drawLine(gridSize, brightness, x, y) {
  let weightQuantity = 10;
  let anglesQuantity = 1 - 1; // Reduces or increases the number of possible angles up to 90

  let weight, angle;
  if(!CURRENT_OPTIONS.invert) {
    weight = Math.round(map(255-brightness, 0, 255, 1, weightQuantity))*(gridSize/2/weightQuantity);
    angle = Math.round(map(255-brightness, 0, 255, 0, anglesQuantity))*(90/anglesQuantity);
    fill(0);
  }

  if(CURRENT_OPTIONS.invert) {
    weight = Math.round(map(brightness, 0, 255, 1, weightQuantity))*(gridSize/2/weightQuantity);
    angle = Math.round(map(brightness, 0, 255, 0, anglesQuantity))*(90/anglesQuantity);
    fill(255);
  }

  noStroke();

  x+=gridSize/2;
  y+=gridSize/2;

  translate(x, y);
  angleMode(DEGREES);
  rotate(angle);
  rectMode(CENTER)
  rect(0, 0, weight, gridSize);
  rotate(-angle);
  translate(-x, -y);
}

function drawCircle(gridSize, brightness, x, y) {
  let diameter = map(255-brightness, 0, 255, 2, gridSize);
  fill(0);
  noStroke();
  ellipseMode(CORNER);
  circle(x,y, diameter);
}

function drawSquare(gridSize, brightness, x, y) {
  const treshold_factor = 1.5 // between 0 and 1 -> brighten / above 1 -> darken
  const treshold = (255/2)*treshold_factor;
  const blackOrWhite = brightness > treshold ? 255 : 0;
  noStroke();
  colorMode(HSB, 255);
  fill(0,0,blackOrWhite);
  rect(x, y, gridSize, gridSize);
}

function drawText(gridSize, brightness, x, y) {
  // const characterMap = [ "░", "▒", "▓", "▉" ];
  const characterMap = [ "", "░", "▒", "▓" ];

  let index;
  if(!CURRENT_OPTIONS.invert) {
    index = Math.round(map(255-brightness, 0, 255, 0, characterMap.length-1));
    fill(0);
  }

  if(CURRENT_OPTIONS.invert) {
    index = Math.round(map(brightness, 0, 255, 0, characterMap.length-1));
    fill(255);
  }

  textSize(gridSize);
  textAlign(CENTER, CENTER);
  text(characterMap[index], x+(gridSize/2), y+(gridSize/2));
}

windowResized = () => {
  // On mobile, window is resized constantly because the browser hides and shows
  // UX elements when user scrolls. So only readapt canvas to window
  // size on desktop.
  if(!isOnMobile()) resetCanvas()
  resetCanvas()
}

async function getAspectRatio() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true });
  return stream.getVideoTracks()[0].getSettings().aspectRatio;
}

let isOnMobile = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
