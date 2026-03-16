function averageColor(img) {

  const colorThief = new ColorThief();
  const color = colorThief.getColor(img);

  return {r: color[0], g:color[1], b : color[2]};
  
}

function getBrightness({r, g, b}) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function createFrontCard(titre, affiche, genre, realisateur){

  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = affiche;

  const front = document.createElement("div");
  front.classList.add("affiche_front");
  
  let color = "#FFF"
  let color_text = "#000"
  front.style.backgroundColor = color;

  const img = document.createElement("img");
  img.src = affiche;

  const info = document.createElement("div");

  const title = document.createElement("h3");
  title.innerText = titre;
  title.style.color = color_text

  const genre_span = document.createElement("span");
  genre_span.innerText = genre;
  genre_span.style.color = color_text


  const real_span = document.createElement("span");
  real_span.innerText = realisateur;
  real_span.style.color = color_text


  image.onload = () => {
    const rgbcolor = averageColor(image);
    const brightness = getBrightness(rgbcolor)
    color = `rgb(${rgbcolor.r}, ${rgbcolor.g}, ${rgbcolor.b})`

    color_text = (brightness > 155) ? "black" : "white"
    front.style.backgroundColor = color;
    title.style.color = color_text
    genre_span.style.color = color_text
    real_span.style.color = color_text
  };


  info.appendChild(title);
  // info.appendChild(genre_span);
  info.appendChild(real_span);

  front.appendChild(img);
  front.appendChild(info);
  

  return front;
}


function createBackCard(titre, affiche, critique,nb_etoile,lien_bande_annonce, lien_article){

  const back = document.createElement("div");
  back.classList.add("affiche_back");

  const img = document.createElement("img");
  img.src = affiche;//"img/exemple/affiche_cine.png";

  const info = document.createElement("div");

  const title = document.createElement("h3");
  title.innerText = titre;

  const desc = document.createElement("p");
  desc.innerText = critique;

  const stars = document.createElement("div");

  for(let i = 0; i < nb_etoile; i++){
    const star = document.createElement("img");
    star.src = "img/exemple/etoile.png";
    stars.appendChild(star);
  }
  for(let i = 0; i < 4-nb_etoile; i++){
    const starGrey = document.createElement("img");
    starGrey.src = "img/exemple/etoile_gris.png";
    stars.appendChild(starGrey);
  }

  

  info.appendChild(title);
  info.appendChild(desc);
  info.appendChild(stars);

  const buttons = document.createElement("div");

  if (lien_bande_annonce){
    const link_play = document.createElement("a")
    link_play.href = lien_bande_annonce
    const play = document.createElement("img");
    play.src = "img/exemple/playbutton.png";
    link_play.append(play)
    buttons.appendChild(link_play);  
  }
  

  if (lien_article){
    const link_review = document.createElement("a")
    link_review.href = lien_article
    const review = document.createElement("img");
    review.src = "img/exemple/reviewbutton.png";
    link_review.append(review)
    buttons.appendChild(link_review);
  }
  

  back.appendChild(img);
  back.appendChild(info);
  back.appendChild(buttons);

  return back;
}

function createCard(titre,affiche, genre, realisateur, critique,nb_etoile,lien_bande_annonce,lien_article){

  const section = document.createElement("section");
  section.classList.add("film");
  section.setAttribute("data-film-name",titre);
  section.setAttribute("data-film-real",realisateur);


  const init_scale = 0.3
  const init_width = 335*init_scale
  const init_height = 613*init_scale
  const init_style = 
    `transform: scale(${init_scale});
    width: ${init_width}px;
    height:  ${init_height}px;`

    
  section.setAttribute("style",init_style)

  const front = createFrontCard(titre,affiche==null?"img/affiche-cine.png":affiche, genre==null?"Film":genre, realisateur);
  const back = createBackCard(titre, affiche==null?"img/affiche-cine.png":affiche, critique,nb_etoile,lien_bande_annonce, lien_article);

  section.appendChild(front);
  section.appendChild(back);

  return section;

  
}
