/*
  Raster over random background image

  Behavior:
  - Load a random image (picsum) sized to the canvas backing size.
  - Start with a raster of 1 cell (very coarse).
  - On each click anywhere on the canvas, increase the number of cells by 1
    (thus increasing perceived quality) until maxCells is reached.
  - Only JS modified (index.html already contains a <canvas id="raster">).
*/

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("raster");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const dpr = () => window.devicePixelRatio || 1;

  // resize backing store to match viewport * DPR
  function resizeCanvas() {
    const r = dpr();
    canvas.width = Math.floor(window.innerWidth * r);
    canvas.height = Math.floor(window.innerHeight * r);
    // ensure CSS fills viewport (index.html sets inline style)
  }

  // helper to build a picsum url with a seed sized to requested pixels
  function randomImageUrl(w = 800, h = 600) {
    const seed = Date.now() + Math.floor(Math.random() * 10000);
    return `https://picsum.photos/seed/${seed}/${w}/${h}`;
  }

  // Draw full image (cover mode)
  function drawImageCover(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    let sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;
    const arImg = img.width / img.height;
    const arCan = cw / ch;
    if (arImg > arCan) {
      const newW = img.height * arCan;
      sx = Math.floor((img.width - newW) / 2);
      sw = Math.floor(newW);
    } else {
      const newH = img.width / arCan;
      sy = Math.floor((img.height - newH) / 2);
      sh = Math.floor(newH);
    }
    try {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    } catch (e) {
      // ignore draw errors
    }
  }

  // draw raster tiles sampling the image
  function drawRasterFromImage(img, cells) {
    // first draw full image as base
    drawImageCover(img);

    const cw = canvas.width;
    const ch = canvas.height;
    const cellW = cw / cells;
    const cellH = ch / cells;

    // compute source crop base (cover) used to map coords
    const arImg = img.width / img.height;
    const arCan = cw / ch;
    let sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;
    if (arImg > arCan) {
      const newW = Math.floor(img.height * arCan);
      sx = Math.floor((img.width - newW) / 2);
      sw = newW;
    } else {
      const newH = Math.floor(img.width / arCan);
      sy = Math.floor((img.height - newH) / 2);
      sh = newH;
    }

    // draw tiles: sample a small rect from image and draw stretched into tile
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const dx = Math.floor(x * cellW);
        const dy = Math.floor(y * cellH);
        const dw = Math.ceil(cellW + 0.5);
        const dh = Math.ceil(cellH + 0.5);

        const ux = x / cells;
        const uy = y / cells;

        const ssx = Math.floor(sx + ux * sw);
        const ssy = Math.floor(sy + uy * sh);
        const ssw = Math.max(1, Math.round(sw / cells));
        const ssh = Math.max(1, Math.round(sh / cells));

        try {
          ctx.drawImage(img, ssx, ssy, ssw, ssh, dx, dy, dw, dh);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  // state
  let currentCells = 1; // start with 1 separation
  const MAX_CELLS = 200; // safety cap to avoid huge loops
  let imgLoaded = null;

  async function loadAndShowRandom() {
    resizeCanvas();
    const url = randomImageUrl(
      Math.floor(canvas.width),
      Math.floor(canvas.height)
    );
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgLoaded = img;
      // show full image first (no raster)
      drawImageCover(imgLoaded);
      // draw initial raster (1 cell) on top
      drawRasterFromImage(imgLoaded, currentCells);
    };
    img.onerror = () => {
      console.error("Image load failed", url);
    };
    img.src = url;
  }

  // increase quality on click
  canvas.addEventListener("click", () => {
    if (!imgLoaded) return;
    // increase cells by 1 until limit
    currentCells = Math.min(MAX_CELLS, currentCells + 1);
    drawRasterFromImage(imgLoaded, currentCells);
    // optional: when reach high quality, redraw full image
    if (currentCells >= MAX_CELLS) drawImageCover(imgLoaded);
  });

  // initial load
  loadAndShowRandom();

  // on resize reload a properly sized image and reset raster to 1
  let resizeTimeout = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      currentCells = 1;
      loadAndShowRandom();
    }, 200);
  });
});
