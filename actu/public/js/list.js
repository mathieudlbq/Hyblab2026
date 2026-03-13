const MovieList = (() => {
  let allMovies = [];
  let isExpanded = false;

  async function loadMovies(jsonPath = 'data/movies.json') {
    try {
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error('Failed to load movies.json');
      allMovies = await res.json();
      render();
    } catch (e) {
      console.error(e);
      const list = document.querySelector('.list');
      if (list) list.innerHTML = '<div class="list-loading">Failed to load movies.json</div>';
    }
  }

  function createItem(movie, index, isNew = false) {
    const div = document.createElement('div');
    div.className = 'list-item' + (isNew ? ' fade-in' : '');
    div.style.animationDelay = isNew ? `${index * 60}ms` : '0ms';
    div.style.flexShrink = '0';
    div.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}" class="item-img">
    <div class="item-content">
      
      <div class="item-top">
        <div class="item-info">
          <span class="item-title">${movie.title}</span>
          <span class="item-director">${movie.director}</span>
        </div>
        <span class="item-rank">${movie.rank}</span>
      </div>
      
      <div class="item-bottom">
        <div class="progress-wrapper">
          <div class="thumb-icon" style="left: calc(${movie.score}% - 8px);">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
              <g filter="url(#filter0_d_7_332)">
                <path d="M7.26017 1.03573C7.09722 1.08422 6.95296 1.20673 6.86747 1.36498C6.80069 1.48749 6.79535 1.52322 6.77664 2.01836C6.75527 2.562 6.73123 2.71259 6.60567 3.02907C6.4908 3.32004 6.3786 3.48849 5.74547 4.29501C5.09898 5.12196 4.95205 5.35932 4.82383 5.783C4.76238 5.98718 4.76238 5.98718 4.75437 8.0673C4.74903 9.59103 4.75437 10.1857 4.77574 10.2878C4.87993 10.7447 5.24591 11.102 5.8176 11.296C6.27174 11.4491 6.18626 11.444 8.43561 11.4542C9.91825 11.4619 10.5567 11.4568 10.6876 11.4338C11.1017 11.3674 11.4917 11.0867 11.6761 10.7217C11.7642 10.5456 11.8096 10.3542 12.205 8.46291C12.5229 6.94429 12.6378 6.34706 12.6351 6.21434C12.6351 5.88764 12.5122 5.59158 12.2718 5.34401C12.0955 5.16279 11.8844 5.03773 11.6467 4.97648C11.4837 4.93309 11.3528 4.92798 10.1533 4.92798H8.83632V3.53443C8.83632 2.0005 8.83365 1.97498 8.67069 1.67891C8.56918 1.4977 8.28066 1.23226 8.08565 1.14038C7.92803 1.06891 7.62349 0.997447 7.47389 0.999999C7.42313 0.999999 7.32696 1.01787 7.26017 1.03573Z" fill="#FF0000"/>
                <path d="M2.85223 5.59402C2.52631 5.64507 2.19773 5.9003 2.07217 6.19636L2.01073 6.3444L2.00271 8.44749C1.9947 10.7369 1.9947 10.7216 2.14697 10.9692C2.35801 11.3137 2.79346 11.5102 3.1915 11.4388C3.54146 11.3775 3.80593 11.1861 3.95553 10.8798L4.04102 10.7088V8.51385V6.31887L3.96889 6.17084C3.75785 5.74206 3.32774 5.52001 2.85223 5.59402Z" fill="#FF0000"/>
              </g>
              <defs>
                <filter id="filter0_d_7_332" x="0" y="0" width="18.6353" height="18.4575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dx="2" dy="3"/>
                  <feGaussianBlur stdDeviation="2"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7_332"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7_332" result="shape"/>
                </filter>
              </defs>
            </svg>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${movie.score}%;"></div>
          </div>
        </div>
        <span class="item-percent">${movie.score}%</span>
      </div>

    </div>
    `;
    return div;
  }

  function render(animate = false) {
    const list = document.querySelector('.list');
    if (!list) return;

    const likedMovies = allMovies.filter(m => m.liked);
    const moviesToShow = isExpanded ? allMovies : likedMovies;

    const existingIds = new Set(
      [...list.querySelectorAll('.list-item')].map(el => el.dataset.id)
    );

    list.innerHTML = '';

    moviesToShow.forEach((movie, i) => {
      const isNew = animate && !existingIds.has(String(movie.id));
      const item = createItem(movie, i, isNew);
      item.dataset.id = movie.id;
      list.appendChild(item);
    });
  }

  function toggle() {
    isExpanded = !isExpanded;

    const btn = document.querySelector('.toggle-btn');
    if (btn) btn.classList.toggle('expanded', isExpanded);

    render(true);
  }

  function initToggleButton() {
    const list = document.querySelector('.list');
    if (!list) return;

    list.style.maxHeight = '350px';
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" fill="none">
            <g filter="url(#filter0_dd_3_411)">
              <path d="M5 5.23633L10.5 1.23633L16 5.23633" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/>
            </g>
            <defs>
              <filter id="filter0_dd_3_411" x="0" y="0" width="24" height="14.2363" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="3" dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3_411"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="effect1_dropShadow_3_411" result="effect2_dropShadow_3_411"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_3_411" result="shape"/>
              </filter>
            </defs>
          </svg>
        </div>
        <div class="arrow-down">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" fill="none">
            <g filter="url(#filter0_dd_3_412)">
              <path d="M5 1L10.5 5L16 1" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/>
            </g>
            <defs>
              <filter id="filter0_dd_3_412" x="0" y="0" width="24" height="14.2363" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="3" dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3_412"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="effect1_dropShadow_3_412" result="effect2_dropShadow_3_412"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_3_412" result="shape"/>
              </filter>
            </defs>
          </svg>
        </div>
      </div>

    `;
    btn.addEventListener('click', toggle);
    wrapper.appendChild(btn);
  }

  function init(jsonPath) {
    initToggleButton();
    loadMovies(jsonPath);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  MovieList.init('data/movies.json');
});