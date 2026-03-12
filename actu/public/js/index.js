"use strict"




const affiches = document.querySelector(".affiches");

const film_cards = [];
// generate affiche

const nb_card = 12;

[...Array(nb_card).keys()].forEach(() => {
  console.log("ici")
  const section = document.createElement("section");
  section.classList.add("film")

  const front_div = document.createElement("div")
  front_div.classList.add("affiche_front")

  const affiche = document.createElement("img")
  affiche.setAttribute("src", "./img/background.svg")

  front_div.appendChild(affiche)

  const back_div = document.createElement("div")
  back_div.classList.add("affiche_back")

  const film_title = document.createElement("h2")
  film_title.innerText = "Nom Film"
  const film_text = document.createElement("p")
  film_text.innerText = "Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre provisoire pour calibrer une mise en page, le texte définitif venant remplacer le faux-texte dès"

  back_div.appendChild(film_title)
  back_div.appendChild(film_text)

  section.appendChild(front_div)
  section.appendChild(back_div)

  film_cards.push(section)

  affiches.appendChild(section)
})


//anmation card
film_cards.forEach((card) => {
  const front = card.querySelector(".affiche_front");
  const back = card.querySelector(".affiche_back");
  const tl = gsap.timeline({ paused: true })
    .to(front, { duration: 1, rotationY: 180 })
    .to(back, { duration: 1, rotationY: 0 }, 0)

  card.addEventListener("click", function () {
    if (tl.progress() === 0) {
      tl.play();
    } else {
      tl.reverse();
    }
  });

})

film_cards.sort(() => Math.random() - 0.5)

const rect_poss =  Array(nb_card)

film_cards.forEach((elem, index) => {
  rect_poss[index] = elem.getBoundingClientRect();
})


setTimeout(function () {

  

  film_cards.forEach((elem, index) => {

    const angle = ((2 * Math.PI) / film_cards.length) * index
    const distance = 150

    elem.setAttribute("id",index)

    console.log(angle * 360 / (Math.PI*2))
    console.log(Math.sin(angle)*distance +(window.innerHeight/2))

    const rect = rect_poss[index]

    gsap.set(affiches, {
      margin: 0,
    })

    console.log(rect)
    gsap.set(elem, {
      position: "absolute",
      x: rect.left,
      y: rect.top,
      top: 0,
      left: 0
    });

    // gsap.set(elem,{
    //   duration :1,
    //   y : 0,
    //   z : 0, 
    //   x : 0,
    //   xPercent:-50,
    //   yPercent:-50,
    // })

    gsap.timeline()
    .to(elem,{
      delay : Math.random(),
      duration : 2,
      y : rect.top - 50
    }
    )
    .to(elem,{
      duration :1,
      y : Math.sin(angle)*distance +(window.innerHeight/2),// + window.innerHeight/2,
      z : Math.cos(angle)*distance,
      x : (window.innerWidth / 2),
      scale : (Math.cos(angle)*distance+distance) * 0.8 / (distance*2) + 0.2, 
      xPercent:-50,
      yPercent:-50,
    })
  })


}, 2000);