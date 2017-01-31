let video, palette;
let box = {
  size: {
    x: 3,
    y: 9
  }
};


function setup() {
  createCanvas(640, 640);
  background(25);

  noStroke();

  pixelDensity(1);

  video = createCapture();
  video.hide();
  video.volume(0); // mute camera audio

  palette = colors.map(hex => color(hex));
}

function draw() {
  video.loadPixels();
  let total = box.size.x * box.size.y;

  // mirror the image
  push();
  translate(video.width, 0);
  scale(-1.0, 1.0);

  // room for a nice abstraction here
  for (let x = 0; x < video.width; x += box.size.x) {
    for (let y = 0; y < video.height; y += box.size.y) {

      let c = {
        r: 0,
        g: 0,
        b: 0
      };

      for (let i = 0; i < box.size.x; i++) {
        for (let j = 0; j < box.size.y; j++) {
          let index = ((x + i) + (y + j) * video.width) * 4;
          c.r += video.pixels[index + 0];
          c.g += video.pixels[index + 1];
          c.b += video.pixels[index + 2];
        }
      }

      fill(...to8Bit(
        (c.r / total),
        (c.g / total),
        (c.b / total)
      ));
      rect(x, y, box.size.x, box.size.y);
    }
  }
  pop();
}

const toBitDepth = (bits, value) => {
  const depth = pow(2, bits);
  const step = pow(2, 8) / depth;
  return Math.floor(value * 7 / 255) * step;
};

const to8Bit = (r, g, b) => [
  toBitDepth(3, r),
  toBitDepth(3, g),
  toBitDepth(3, b)
];

var colors = [
 "#000000", //black
 "#555555", // gray
 "#0000AA", // blue
 "#5555FF", // light blue
 "#00AA00", // green
 "#55FF55", // light green
 "#00AAAA", // cyan
 "#55FFFF", // light cyan
 "#AA0000", // red
 "#FF5555", // light red
 "#AA00AA", // magenta
 "#FF55FF", // light magenta
 "#AA5500", // brown // #AA5500
 "#FFFF55", // yellow
 "#AAAAAA", // light gray
 "#FFFFFF" // white (high intensity)
];

// const to4bit()
