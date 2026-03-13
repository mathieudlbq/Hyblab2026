const API = "http://localhost:8080/actu/api"

async function init(){
    const liste = document.querySelector("#listFilm");

    await fetch(API + "/create-user", {
        method: "GET",
        credentials: "include"
    });

    const filmsResponse = await fetch(API + "/getAffiches", {
        method: "GET",
        credentials: "include"
    });

    const films = await filmsResponse.json();

    console.log(films);

    liste.innerHTML = films.map(f => `<li class="film-item">
    <img src="${f.affiche}" alt="${f.title}">
    <div class="film-info">
      <h3>${f.title}</h3>
      <span>${f.date}</span>
    </div>
  </li>`).join('');
}

init();