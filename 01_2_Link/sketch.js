const maxNum = 100;
const baseBtn = document.getElementById("Boutton");

// Fonction utilitaire pour placer un élément à une position aléatoire
function moveRandom(el) {
  const x = Math.random() * (window.innerWidth - el.offsetWidth);
  const y = Math.random() * (window.innerHeight - el.offsetHeight);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

// Fonction pour ajouter le comportement de fuite + duplication
function addHoverBehavior(btn) {
  btn.addEventListener("mouseenter", () => {
    moveRandom(btn);

    const currentCount = document.querySelectorAll('[id^="Boutton"]').length;
    if (currentCount < maxNum) {
      const clone = btn.cloneNode(true);
      clone.id = "Boutton";
      moveRandom(clone);
      addHoverBehavior(clone); // applique le même comportement au clone
      document.body.appendChild(clone);

      console.log(currentCount + 1);
    } else {
      console.log("Limite de copies atteinte:", maxNum);
    }
  });
}

// Active le comportement sur le bouton de base
baseBtn.style.position = "absolute";
addHoverBehavior(baseBtn);
