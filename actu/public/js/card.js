const affiches = document.querySelector(".affiches");
let film_cards=[];
let i =0;
loadFilm().then((filmsNodes) => {
  filmsNodes.forEach((card) => {
    i+=1;
    if(i>=6) return;
    film_cards.push(card);
    affiches.appendChild(card);

    const front = card.querySelector(".affiche_front");
  const back = card.querySelector(".affiche_back");
  const tl = gsap.timeline({ paused: true })
    .to(front, { duration: 1, rotationY: 180 })
    .to(back, { duration: 1, rotationY: 0 }, 0)

  card.addEventListener("click", function () {
    if (card == film_cards[get_current_index()]){

      if (tl.progress() === 0) {
        tl.play();
      } else {
        tl.reverse();
      }
    }

  });
  });
});

document.getElementById("btnExport").addEventListener("click", () => {
  const element = document.getElementById("affiches");

  html2canvas(element).then(canvas => {
    // Convertit le canvas en image
    const imgData = canvas.toDataURL("image/png");

    // Crée un lien pour télécharger
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "capture.png";
    link.click();
  });
});
