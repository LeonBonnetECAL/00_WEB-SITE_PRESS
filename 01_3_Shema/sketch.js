let shapes = [];
const DENSITY = 800; // nombre de formes par canevas (ajuster selon performance)

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(255);
  generateShapes();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
  generateShapes();
}

function generateShapes() {
  shapes = [];
  for (let i = 0; i < DENSITY; i++) {
    const type = random() < 0.5 ? "circle" : "square";
    const size = random(6, 120) * (random() < 0.2 ? 2 : 1); // Tailles Forme diversifiées
    const x = random(-size * 0.5, width + size * 0.5);
    const y = random(-size * 0.5, height + size * 0.5);
    const rotation = random(TWO_PI);
    shapes.push({ type, x, y, size, rotation });
  }
  // trier pour varier empilement (plus grandes à l'arrière)
  shapes.sort((a, b) => b.size - a.size);
}

function mouveShapes() {
  const cx = mouseX,
    cy = mouseY;
  if (!shapes || shapes.length === 0) return;

  if (window.__mouveEasingAnim) {
    cancelAnimationFrame(window.__mouveEasingAnim);
    window.__mouveEasingAnim = null;
  }

  const maxR = min(width, height) * 0.15;
  let angle = random(TWO_PI);
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    const t = i / (shapes.length - 1 || 1);
    const r = lerp(s.size * 0.2, maxR, t);
    angle += random(0.1, 0.6);
    s.tx = cx + cos(angle) * r + random(-s.size * 0.3, s.size * 0.3);
    s.ty = cy + sin(angle) * r + random(-s.size * 0.3, s.size * 0.3);
    s.trot = random(TWO_PI);
    s.ease = random(0.06, 0.15);
  }

  const wrapDiff = (a) => {
    a = (a + PI) % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a - PI;
  };

  function animate() {
    let allArrived = true;
    for (let s of shapes) {
      const e = s.ease || 0.12;
      const dx = s.tx - s.x,
        dy = s.ty - s.y;
      if (dx * dx + dy * dy > 0.25) {
        s.x += dx * e;
        s.y += dy * e;
        allArrived = false;
      } else {
        s.x = s.tx;
        s.y = s.ty;
      }
      const aDiff = wrapDiff(s.trot - s.rotation);
      if (abs(aDiff) > 0.01) {
        s.rotation += aDiff * e;
        allArrived = false;
      } else {
        s.rotation = s.trot;
      }
    }

    if (!allArrived) window.__mouveEasingAnim = requestAnimationFrame(animate);
    else window.__mouveEasingAnim = null;
  }

  animate();
}

function draw() {
  background(255);
  fill(0);
  for (let s of shapes) {
    push();
    translate(s.x, s.y);
    rotate(s.rotation);
    fill(0, s.alpha);
    if (s.type === "circle") {
      ellipse(0, 0, s.size, s.size);
    } else {
      // dessiner un carré centré
      rectMode(CENTER);
      rect(0, 0, s.size, s.size);
    }
    pop();
  }
}

function mousePressed() {
  mouveShapes();
  pop();
}

function keyPressed() {
  // déclenche generateShapes quand la barre d'espace est pressée
  if (key === " " || keyCode === 32) {
    generateShapes();
    return false; // empêche le défilement de la page
  }
}

// override DENSITY si paramètre présent
const urlDensity = typeof window !== "undefined" ? getDensityFromURL() : null;
if (urlDensity) {
  // remplace la constante en réassignant la variable via fenêtre p5
  // (si vous voulez changer la constante au runtime, modifiez la variable ci-dessus)
}
