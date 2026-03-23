
async function AjoutFilmAimePage() {
  
  const container = document.getElementById('shelf');
  container.innerHTML = '';

  const likedItems =  await loadFilmsAime();



  const filmsParMois = {};

  likedItems.forEach(film => {
    const date = new Date(film.date_sortie);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!filmsParMois[key]) {
      filmsParMois[key] = [];
    }

    filmsParMois[key].push(film);
  });
  Object.entries(filmsParMois).forEach(([key, films]) => {

    const [year, month] = key.split("-");

    const titre = document.createElement("h2");
    titre.textContent = new Date(year, month).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    });
    titre.textContent = titre.textContent[0].toUpperCase() + titre.textContent.slice(1);

    container.appendChild(titre);

    const rows = [];
    for (let i = 0; i < films.length; i += 3) {
      rows.push(films.slice(i, i + 3));
    }

    rows.forEach(rowItems => {
      const displayRow = document.createElement('div');
      displayRow.className = 'display-row';

      const itemsGrid = document.createElement('div');
      itemsGrid.className = 'items-grid';

      rowItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';

        itemCard.innerHTML = `
          <img class="item-image" src="${item?.affiche || "./img/affiche-cine.png"}" alt="${item?.nom}">
        `;

        itemsGrid.appendChild(itemCard);
      });

      const emptyCount = 3 - rowItems.length;
      for (let i = 0; i < emptyCount; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'item-card';
        itemsGrid.appendChild(emptyDiv);
      }

      const baseBoard = document.createElement('div');
      baseBoard.className = 'base-board';
      baseBoard.innerHTML = `
        <img class="peg left" src="img/favoris/point.svg">
        <img class="peg right" src="img/favoris/point.svg">
      `;

      displayRow.appendChild(itemsGrid);
      displayRow.appendChild(baseBoard);
      container.appendChild(displayRow);
    });

  });
}

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => {
    window.location.href = 'podium.html';
  });
  AjoutFilmAimePage();

});


 