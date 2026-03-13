fetch('data/movies.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('podium-container');
    
    const topThree = data.filter(item => item.rank === 1 || item.rank === 2 || item.rank === 3);

    let stepsHtmlString = '';
    topThree.forEach(item => {
      stepsHtmlString += `
        <div class="step step-${item.rank}">
          <img src="${item.image}" alt="${item.title}" class="step-img img-${item.rank}">
          <span class="step-rank">${item.rank}</span>
        </div>
      `;
    });

    const fullPodiumHtml = `
      <div class="podiumBack">
        <div class="topPodium"></div>
        <div class="bottomPodium">
          <svg class="podium-svg" xmlns="http://www.w3.org/2000/svg" width="261" height="88" viewBox="0 0 261 88" fill="none">
            <g filter="url(#filter0_di_3_369)">
              <path d="M4.5 69.4395C4.5 74.9623 8.97715 79.4395 14.5 79.4395H246.5C252.023 79.4395 256.5 74.9623 256.5 69.4395V48.1229C256.5 42.625 252.062 38.1582 246.564 38.1231L187.619 37.7469C182.121 37.7118 177.683 33.2449 177.683 27.747C177.683 21.9881 177.683 16.2585 177.683 10.5C177.683 4.95361 173.169 0.466671 167.623 0.500113L101.43 0.899232C95.9898 0.932033 91.5918 5.30784 91.6308 10.7477C91.6368 11.5944 91.6434 12.4415 91.6495 13.2882C91.6885 18.7346 87.2808 23.1139 81.8343 23.1228C59.4151 23.1594 36.8761 23.0134 14.4563 23.0492C8.95048 23.058 4.5 27.5289 4.5 33.0347V69.4395Z" fill="#D7000B" fill-opacity="0.8" shape-rendering="crispEdges"/>
              <path d="M4.5 69.4395C4.5 74.9623 8.97715 79.4395 14.5 79.4395H246.5C252.023 79.4395 256.5 74.9623 256.5 69.4395V48.1229C256.5 42.625 252.062 38.1582 246.564 38.1231L187.619 37.7469C182.121 37.7118 177.683 33.2449 177.683 27.747C177.683 21.9881 177.683 16.2585 177.683 10.5C177.683 4.95361 173.169 0.466671 167.623 0.500113L101.43 0.899232C95.9898 0.932033 91.5918 5.30784 91.6308 10.7477C91.6368 11.5944 91.6434 12.4415 91.6495 13.2882C91.6885 18.7346 87.2808 23.1139 81.8343 23.1228C59.4151 23.1594 36.8761 23.0134 14.4563 23.0492C8.95048 23.058 4.5 27.5289 4.5 33.0347V69.4395Z" stroke="#D7000B" stroke-linecap="round" stroke-linejoin="bevel" shape-rendering="crispEdges"/>
            </g>
            <defs>
              <filter id="filter0_di_3_369" x="0" y="0" width="261" height="87.9395" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3_369"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3_369" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3_369"/>
              </filter>
            </defs>
          </svg>
          <div class="podium-steps">
            ${stepsHtmlString}
          </div>
        </div>
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

    buildBackSide(data);
    initFlip();
  })
  .catch(error => console.error('failed to read json', error));

function scoreToStars(score, max = 4) {
  const filled = Math.round((score / 100) * max);
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="star${i < filled ? '' : ' empty'}">&#9733;</span>`;
  }
  return html;
}

function buildBackSide(data) {
  const heroImg = document.getElementById('back-hero-img');
  const backList = document.getElementById('back-list');

  const sorted = [...data].sort((a, b) => a.critic_rank - b.critic_rank);

  const top = sorted[0];
  heroImg.src = top.image;
  heroImg.alt = top.title;

  sorted.forEach((movie, i) => {
    const item = document.createElement('div');
    item.className = 'back-item';
    item.style.animationDelay = `${i * 55}ms`;
    item.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}" class="back-item-img">
      <div class="back-item-content">
        <span class="back-item-title">${movie.title}</span>
        <span class="back-item-critic">${movie.director || ''}</span>
        <div class="back-item-stars">${scoreToStars(movie.critic_score)}</div>
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
      e.target.closest('.toggle-btn')
    ) return;

    card.classList.toggle('is-flipped');
  });
}