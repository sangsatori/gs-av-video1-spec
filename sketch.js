let config;
let video, palette, snapshot, distances;
let lastFrame = []; // memoize-like store

function setup() {
  // moved to setup to ensure functions are accessible
  config = {
    box: {
      size: {
        x: 4,
        y: 12
      }
    },
    colorProcessingModes: {
      "8bit": from24to8bit,
      "4bit": toPalette,
      "none": (r, g, b) => [r, g, b] // no transform
    },
    binningModes: {
      "average": binArea,
      "none": firstPixelArea,
    },
    activeBinning: "average",
    activePalette: "clrs",
    activeProcessingMode: "4bit",
    palettes: {
      // the palette provided
      "default": [
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
      ],
      // brighter shades from http://clrs.cc/
      "clrs": [
        "#001F3F", // navy
        "#0074D9", // blue
        "#7FDBFF", // aqua
        "#39CCCC", // teal
        "#3D9970", // olive
        "#2ECC40", // green
        "#01FF70", // lime
        "#FFDC00", // yellow
        "#FF851B", // orange
        "#FF4136", // red
        "#F012BE", // fuchsia
        "#B10DC9", // purple
        "#85144B", // maroon
        "#FFFFFF", // white
        "#DDDDDD", // silver
        "#AAAAAA", // gray
        "#111111" // black
      ]
    }
  };

  createCanvas(640, 640); // assuming camera resolution
  noStroke();
  pixelDensity(1);

  video = createCapture(VIDEO); // don't capture audio
  video.hide();
  video.volume(0); // mute camera audio

  // turn hex values into p5.color objects
  palette = config.palettes[config.activePalette].map(hex => {
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
  const binFn = config.binningModes[config.activeBinning];
  const processFn = config.colorProcessingModes[config.activeProcessingMode];
  // draw from average colours
  binFn(video, config.box.size).forEach((area, i) => {
    snapshot = JSON.stringify(area);
    if (lastFrame[i] !== snapshot) {
      fill(...processFn(area.r, area.g, area.b));
      rect(area.x, area.y, config.box.size.x, config.box.size.y);
      lastFrame[i] = snapshot;
    } // don't redraw if matching
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

const firstPixelArea = (gfx, size) => {
  const areaSize = size.x * size.y;

  var results = [];
  var index;

  for (var x = 0; x < gfx.width; x += size.x) {
    for (var y = 0; y < gfx.height; y += size.y) {
      index = (x + y * gfx.width) * 4;
      result.push({
        r: gfx.pixels[index + 0],
        g: gfx.pixels[index + 1],
        b: gfx.pixels[index + 2]
      });
    }
  }
  return results;
}
