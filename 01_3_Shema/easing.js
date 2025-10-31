// easing.js
// Fournit une API simple pour animer un tableau d'objets ayant des cibles
// Chaque objet attendu peut contenir : x,y,rotation et leurs cibles tx,ty,trot, et ease
// Expose : startEasing(shapes) -> démarre une animation et retourne l'identifiant (pour cancel)
//         stopEasing(id) -> annule une animation par id

(function (global) {
  const running = new Map();

  function normalizeAngleDiff(a) {
    // utilise PI et TWO_PI de p5 si présents, sinon fallback
    const PI = global.PI || Math.PI;
    const TWO_PI = global.TWO_PI || Math.PI * 2;
    a = (a + PI) % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a - PI;
  }

  function startEasing(shapes) {
    if (!Array.isArray(shapes) || shapes.length === 0) return null;

    // cancel any existing animation on this shapes array
    const existing = running.get(shapes);
    if (existing) {
      cancelAnimationFrame(existing.raf);
      running.delete(shapes);
    }

    let rafId = null;

    function animate() {
      let allArrived = true;

      for (let s of shapes) {
        const e = s.ease || 0.12;

        // position easing
        const dx = (s.tx || s.x) - s.x;
        const dy = (s.ty || s.y) - s.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0.25) {
          s.x += dx * e;
          s.y += dy * e;
          allArrived = false;
        } else {
          s.x = s.tx !== undefined ? s.tx : s.x;
          s.y = s.ty !== undefined ? s.ty : s.y;
        }

        // rotation easing (shortest path)
        const aDiff = normalizeAngleDiff((s.trot || s.rotation) - (s.rotation || 0));
        if (Math.abs(aDiff) > 0.01) {
          s.rotation = (s.rotation || 0) + aDiff * e;
          allArrived = false;
        } else if (s.trot !== undefined) {
          s.rotation = s.trot;
        }
      }

      if (!allArrived) {
        rafId = requestAnimationFrame(animate);
        running.set(shapes, { raf: rafId });
      } else {
        running.delete(shapes);
      }
    }

    rafId = requestAnimationFrame(animate);
    running.set(shapes, { raf: rafId });
    return rafId;
  }

  function stopEasing(shapes) {
    const item = running.get(shapes);
    if (item) {
      cancelAnimationFrame(item.raf);
      running.delete(shapes);
      return true;
    }
    return false;
  }

  // export
  global.__easing = global.__easing || {};
  global.__easing.startEasing = startEasing;
  global.__easing.stopEasing = stopEasing;
})(typeof window !== 'undefined' ? window : this);
