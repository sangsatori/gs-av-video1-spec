const config = {
  box: {
    size: {
      x: 3,
      y: 9
    }
  },
  palettes: [
    [
     "#000000", // black
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
     "#AA5500", // brown
     "#FFFF55", // yellow
     "#AAAAAA", // light gray
     "#FFFFFF" // white (high intensity)
   ]
  ]
};

let video, palette, snapshot, distances;
let lastFrame = [];

function setup() {
  createCanvas(640, 640);
  background(25);

  noStroke();
  pixelDensity(1);

  video = createCapture();
  video.hide();
  video.volume(0); // mute camera audio

  // turn hex values into p5.color objects
  palette = config.palettes[0].map(hex => {
    const c = color(hex);
    return [red(c), green(c), blue(c)];
  });
}

function draw() {
  // mirror the image
  push();
  translate(video.width, 0);
  scale(-1.0, 1.0);

  // process pixel values
  video.loadPixels();
  const binningArea = config.box.size.x * config.box.size.y;

  // draw from average colours
  binArea(video, config.box.size).forEach((area, i) => {
    snapshot = JSON.stringify(area);
    if (lastFrame[i] !== snapshot) {
      fill(...toPalette(area.r, area.g, area.b));
      rect(area.x, area.y, config.box.size.x, config.box.size.y);
      lastFrame[i] = snapshot;
    } // skip box if matching
  });

  pop();
}


/* Utilities */
// hoisting floats definitions to top

// change the bit depth; assumes 8-bit input value
const toBitDepth = (bits, value) => {
  const depth = pow(2, bits);
  const step = pow(2, 8) / depth;
  return floor(value * 7 / 255) * step;
};

// calculate euclidean distance for 2 RGB colors
const rgbDistance = (x, y) => {
  return (
    Math.pow((y[0] - x[0]), 2) +
    Math.pow((y[1] - x[1]), 2) +
    Math.pow((y[2] - x[2]), 2)
  );
};

// reduce 24-bit RGB to 8-bit RGB
const from24to8bit = (r, g, b) => [
  toBitDepth(3, r),
  toBitDepth(3, g),
  toBitDepth(3, b)
];

// find the closest palette color
const toPalette = (r, g, b) => {
  let result, index;
  distances = palette
  .map(c => abs(
    rgbDistance(c, [r, g, b])
  ));
  index = distances.indexOf(Math.min(...distances));
  if (index !== -1) {
    result = palette[index];
  } else {
    result = [0, 0, 0];
  }
  return result;
};

// perform average binning on a graphics object
const binArea = (gfx, size) => {
  const areaSize = size.x * size.y;

  var results = [];
  var index, total, coords;

  // traverse graphics
  for (var x = 0; x < gfx.width; x += size.x) {
    for (var y = 0; y < gfx.height; y += size.y) {
      total = { r: 0, g: 0, b: 0 };
      for (var binX = x; binX < x + size.x; binX++) {
        for (var binY = y; binY < y + size.y; binY++) {
          index = (binX + binY * gfx.width) * 4;
          total.r += gfx.pixels[index + 0];
          total.g += gfx.pixels[index + 1];
          total.b += gfx.pixels[index + 2];
        }
      }
      results.push({
        r: floor(total.r / areaSize),
        g: floor(total.g / areaSize),
        b: floor(total.b / areaSize),
        x, y
      });
    }
  }
  return results;
};
