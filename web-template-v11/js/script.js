// Fonction pour vérifier si un élément est visible dans le viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // L'élément est visible s'il est dans les 75% de la hauteur de l'écran
    return (
        rect.top < windowHeight * 0.75 &&
        rect.bottom > 0
    );
}

// Fonction pour révéler les images
function revealImages() {
    const images = document.querySelectorAll('.image-wrapper');
    
    images.forEach((img) => {
        if (isInViewport(img)) {
            img.classList.add('reveal');
        }
    });
}

// Écouter l'événement de scroll avec un petit délai pour optimiser
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(revealImages);
});

// Révéler les images au chargement de la page
window.addEventListener('load', function() {
    revealImages();
});

// Révéler les images au redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    revealImages();
});

// Exécuter immédiatement au cas où le DOM est déjà chargé
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(revealImages, 100);
} else {
    document.addEventListener('DOMContentLoaded', revealImages);
}