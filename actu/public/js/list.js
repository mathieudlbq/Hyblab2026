
const MovieList = (() => {
  let isExpanded = false;

  function createItem(affiche, titre, realisateur, rank, like_pourcentage, index, critique, nb_etoile, lien_bande_annonce, lien_article) {


    if (affiche == null) {
      affiche = "img/affiche-cine.png"
    }

    const div = document.createElement('div');
    div.className = 'list-item ';
    div.style.animationDelay = `${index * 60}ms`;
    div.style.flexShrink = '0';
    div.innerHTML = `
    <img src="${affiche}" alt="${titre}" class="item-img">
    <div class="item-content">
      
      <div class="item-top">
        <div class="item-info">
          <span class="item-title">${titre}</span>
          <span class="item-director">${realisateur}</span>
        </div>
        <span class="item-rank">${rank}</span>
      </div>
      
      <div class="item-bottom">
        <div class="progress-wrapper">
          <div class="thumb-icon" style="left: calc(${like_pourcentage}% - 8px);">
            <img src="img/podium/thumb.svg" alt="Thumb Icon" class="thumb-img">
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${like_pourcentage}%;">

            </div>
          </div>
        </div>
        <span class="item-percent">${like_pourcentage}%</span>
      </div>

    </div>
    `;

    div.addEventListener("click", () => {
      card_apparition(affiche, titre, realisateur, critique, nb_etoile, lien_bande_annonce, lien_article)
    })
    return div;
  }

  //création de la liste liké
  async function render(like_only) {

    const list = document.querySelector('.list');
    if (!list) return;

    const { filmLiked, classement } = await loadClassement();

    //récupération des films liké par l'utilisateur
    let likedMovies = null
    if (like_only) {
      likedMovies = filmLiked;
    } else {
      likedMovies = classement;
    }

    list.innerHTML = '';
    // Vérifier si la liste est vide et afficher le message d'erreur
    if (likedMovies.length === 0) {
      list.innerHTML = '<p class="empty-msg">Quel dommage, il n\'y a pas de films que vous aimez cette semaine !</p>';
      return;
    }

    let i = likedMovies.length;

    likedMovies.forEach(element => {
      const ratio_like = (element.nb_likes / (element.nb_likes + element.nb_dislikes)) * 100 || 0
      const item = createItem(
        element?.affiche,
        element?.nom,
        element?.realisateur,
        element?.classement,
        ratio_like,
        i,
        element.critique,
        element.nb_etoile,
        element.bande_annonce,
        "#");
      item.dataset.id = element.id;
      list.appendChild(item);
    });
  }

  function toggle() {
    console.log("ici")
    isExpanded = !isExpanded;

    const btn = document.querySelector('.toggle-btn');
    if (btn) btn.classList.toggle('expanded', isExpanded);

    render(!isExpanded);
  }

  function initToggleButton() {
    const list = document.querySelector('.list');
    if (!list) return;

    list.style.maxHeight = '750px';
    list.style.overflowY = 'auto';
    list.style.boxSizing = 'border-box';

    if (list.parentElement.classList.contains('list-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'list-wrapper';
    list.parentNode.insertBefore(wrapper, list);
    wrapper.appendChild(list);

    const btn = document.createElement('button');
    btn.className = 'toggle-btn';
    btn.setAttribute('aria-label', 'Toggle all movies');
    btn.innerHTML = `
      <div class="arrow">
        <div class="arrow-up">
            <img src="img/arrow.svg" alt="arrow">
        </div>
        <div class="arrow-down">
            <img src="img/arrow.svg" alt="arrow">
        </div>
      </div>
    `;
    btn.addEventListener('click', toggle);
    wrapper.appendChild(btn);
  }

  function init(jsonPath) {
    initToggleButton();
    // loadClassement();
    render(like_only = true);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  MovieList.init('data/movies.json');
});


function card_apparition(affiche, titre, realisateur, critique, nb_etoile, lien_bande_annonce, lien_article) {

  const carte = createCard(titre, affiche, "  ", realisateur, critique, nb_etoile, lien_bande_annonce, lien_article)
  document.querySelector("body").appendChild(carte)
  gsap.set(carte, {
    position: "absolute",
    top: "50%",
    left: "50%",
    xPercent: -50,
    yPercent: -50,
    scale: 1,
    clearProps: "height,width"
  })

  const front = carte.querySelector(".affiche_front");
  const back = carte.querySelector(".affiche_back");
  const tl = gsap.timeline({ paused: true })
    .to(front, { duration: 1, rotationY: 180 })
    .to(back, { duration: 1, rotationY: 0 }, 0)

  carte.addEventListener("click", function () {
    if (tl.progress() === 0) {
      tl.play();
    } else {
      tl.reverse();
    }
  })

  gsap.from(carte, {
    duration: 0.5,
    yPercent: 100,
    y: window.innerHeight / 2,
    onComplete: () => {
      clickOutside = (e) => {
        if (!carte.contains(e.target)) {
          gsap.to(carte,{
            duration: 0.5,
            yPercent: 100,
            y: window.innerHeight / 2,
            onComplete: () => carte.remove()
          })
          
          document.removeEventListener("click", clickOutside);
        }
      }

      document.addEventListener("click", clickOutside);
    }
  })
}