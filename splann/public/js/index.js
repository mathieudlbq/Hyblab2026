"use strict";

(async () => {
  // 1. On crée le contenu (slides bleues)
  await createEmptyContent();

  // 2. On initialise Swiper
  const swiper = new Swiper("#mySwiper", {
    direction: "horizontal",
    mousewheel: true,
    speed: 600,
  });

  // 3. LA TRICHE : On définit manuellement le nombre de slides par volet
  // Intro (Titre + Chapeau) = 2
  // Enquête (Contenu généré) = 7 (C'est le nombre de bullets dans ton JSON)
  // Fin (Plus d'enquêtes + Crédits) = 2
  const structureManuelle = [
    { name: "Intro", slides: 2 }, 
    { name: "Enquête", slides: 7 }, 
    { name: "Fin", slides: 2 }
  ];

  // 4. La fonction qui dessine la barre (Adaptée de ton test2_segmentation)
  function dessinerLaBarre() {
    const navContainer = document.getElementById('navBar');
    if (!navContainer) return;

    navContainer.innerHTML = ''; // On vide
    let indexActuel = swiper.activeIndex;
    let cumul = 0;

    structureManuelle.forEach(volet => {
      const voletDiv = document.createElement('div');
      voletDiv.className = 'volet';
      
      const debut = cumul;
      const fin = cumul + volet.slides - 1;

      // État : Déjà passé
      if (indexActuel > fin) {
        voletDiv.classList.add('parcouru');
      } 
      // État : On est dedans
      else if (indexActuel >= debut && indexActuel <= fin) {
        voletDiv.classList.add('active');
        for (let i = 0; i < volet.slides; i++) {
          const dot = document.createElement('div');
          dot.className = 'inner-dot';
          // On allume le point si on l'a passé
          if (debut + i <= indexActuel) dot.classList.add('active');
          // Le dernier point est un triangle
          if (i === volet.slides - 1) dot.classList.add('is-last');
          voletDiv.appendChild(dot);
        }
      }

      // Si on clique sur l'ovale, on va au début du volet
      voletDiv.onclick = () => swiper.slideTo(debut);
      navContainer.appendChild(voletDiv);
      cumul += volet.slides;
    });
  }

  // 5. On lie la barre au mouvement du slider
  swiper.on("slideChange", function () {
    dessinerLaBarre(); // On redessine à chaque mouvement

    // Garde tes anciennes fonctions d'animation
    let nbSlide = swiper.slides.length;
    let index = swiper.activeIndex;
    if (index == 0) initSlide1();
    else if (index == nbSlide - 1) initSlide3();
  });

  // 6. Lancement initial
  dessinerLaBarre();
  addExtend(swiper);

  // Gestion du Loader (Anime.js)
  setTimeout(() => { 
    anime({
      targets: '#loader',
      opacity: '0',
      'z-index' : -1,
      easing: 'easeOutQuad',
    });
    initSlide1();
  }, 1000);
})();