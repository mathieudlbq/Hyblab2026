fetch('data/movies.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('shelf');
    container.innerHTML = '';

    const likedItems = data.filter(item => item.liked === true);

    const rows = [];
    for (let i = 0; i < likedItems.length; i += 3) {
      rows.push(likedItems.slice(i, i + 3));
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
          <img class="item-image" src="${item.image}" alt="${item.title}">
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
        <div class="peg left"></div>
        <div class="peg right"></div>
      `;

      displayRow.appendChild(itemsGrid);
      displayRow.appendChild(baseBoard);
      container.appendChild(displayRow);
    });
  })
  .catch(error => console.error('failed to load movies.json:', error));