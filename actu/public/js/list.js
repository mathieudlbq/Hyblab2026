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
            <img src="img/podium/thumb.svg" alt="Thumb Icon" class="thumb-img">
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${movie.score}%;">

            </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="31" height="19" viewBox="0 0 31 19" fill="none">
            <g filter="url(#filter0_dd_105_576)">
              <path d="M19.6147 7.69433C20.183 8.10769 20.9795 7.98227 21.393 7.41405C21.8063 6.84568 21.6809 6.04922 21.1127 5.63573L13.3637 -1.00136e-05L5.61466 5.63573C5.04644 6.04922 4.92103 6.84568 5.33439 7.41405C5.74788 7.98227 6.54434 8.10769 7.11271 7.69433L13.3637 3.14843L19.6147 7.69433Z" fill="#E5231A"/>
            </g>
            <defs>
              <filter id="filter0_dd_105_576" x="-8.86917e-05" y="0" width="30.5457" height="18.1197" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="3.81818" dy="5.09091"/>
                <feGaussianBlur stdDeviation="2.54545"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_105_576"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="5.09091"/>
                <feGaussianBlur stdDeviation="2.54545"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="effect1_dropShadow_105_576" result="effect2_dropShadow_105_576"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_105_576" result="shape"/>
              </filter>
            </defs>
          </svg>
        </div>
        <div class="arrow-down">
          <svg xmlns="http://www.w3.org/2000/svg" width="31" height="19" viewBox="0 0 31 19" fill="none">
            <g filter="url(#filter0_dd_105_575)">
              <path d="M19.6147 0.24357C20.183 -0.16979 20.9795 -0.0443755 21.393 0.523844C21.8063 1.09221 21.6809 1.88867 21.1127 2.30216L13.3637 7.93791L5.61466 2.30216C5.04644 1.88867 4.92103 1.09221 5.33439 0.523844C5.74788 -0.0443756 6.54434 -0.16979 7.11271 0.24357L13.3637 4.78947L19.6147 0.24357Z" fill="#E5231A"/>
            </g>
            <defs>
              <filter id="filter0_dd_105_575" x="-8.86917e-05" y="0" width="30.5457" height="18.1197" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="3.81818" dy="5.09091"/>
                <feGaussianBlur stdDeviation="2.54545"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_105_575"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="5.09091"/>
                <feGaussianBlur stdDeviation="2.54545"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="effect1_dropShadow_105_575" result="effect2_dropShadow_105_575"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_105_575" result="shape"/>
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