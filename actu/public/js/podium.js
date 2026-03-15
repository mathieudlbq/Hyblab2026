document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('goto-favoris-btn');
  backBtn.addEventListener('click', () => {
    window.location.href = 'favoris.html';
  });
});

async function loadpodium(){
  const {userLikes,classement} = await loadClassement();
  // const classement = await classementResponse.json();
  const podium = classement.slice(0,3);
  const container = document.querySelector('#podium-container');
  console.log(classement);
  console.log(podium);
  let stepsHtmlString = podium.map(item => `
      <div class="step step-${item?.classement}">
        <img src="${item?.affiche||"img/affiche-cine.png"}" alt="${item?.nom}" class="step-img img-${item?.classement}">
        <span class="step-rank">${item?.classement}</span>
      </div>
    `).join("");

  const fullPodiumHtml = `
      <img class="podium-svg" src="img/podium/podium.svg">
      <div class="podium-steps">
        ${stepsHtmlString}
      </div>

    `;

  container.innerHTML = fullPodiumHtml;

  gsap.from(".step", {
    y: 150,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)"
  });

  

  buildBackSide();
  initFlip();
}

loadpodium();


function scoreToStars(score, max = 4) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="star${i < score ? '' : ' empty'}">&#9733;</span>`;
  }
  return html;
}

async function buildBackSide() {
  //chargement du classement des critiques 
  const classementCritiqueResponse = await fetch(API + "/film-week", {
      method: "GET",
      credentials: "include"
  });
  let classementCritique = await classementCritiqueResponse.json();

  //trier par étoile décroissan
  classementCritique.sort((a,b)=> b.nb_etoile - a.nb_etoile); 

  const heroImg = document.getElementById('back-hero-img');
  const backList = document.getElementById('back-list');
  backList.innerHTML = '';

  const top = classementCritique[0];
  heroImg.src = top?.affiche||"img/affiche-cine.png";
  heroImg.alt = top.nom;

  classementCritique.forEach((movie, i) => {
    const nb_etoile = movie.nb_etoile || 0;
    const item = document.createElement('div');
    item.className = 'back-item';
    item.style.animationDelay = `${i * 55}ms`;
    item.innerHTML = `
      <img src="${movie?.affiche||"img/affiche-cine.png"}" alt="${movie?.nom}" class="back-item-img">
      <div class="back-item-content">
        <span class="back-item-title">${movie?.nom}</span>
        <span class="back-item-critic">${movie?.realisateur || ''}</span>
        <div class="back-item-stars">${scoreToStars(nb_etoile)}</div>
      </div>
      
    `;
    backList.appendChild(item);
  });
}

function initFlip() {
  const card = document.getElementById('flip-card');
  if (!card) return;

  card.addEventListener('click', (e) => {
    if (
      e.target.closest('.step-img') ||
      e.target.closest('.toggle-btn') ||
      e.target.closest('.list')
    ) return;

    card.classList.toggle('is-flipped');
  });
}