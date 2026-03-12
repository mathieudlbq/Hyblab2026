"use strict"

window.scrollTo(0, 0);


const affiches = document.querySelector(".affiches");

const zone_pour = document.querySelector(".zoon_pour");
const zone_contre = document.querySelector(".zoon_contre");

const film_cards = [];
// generate affiche

const nb_card = 13;
let  nb_tours = Math.round(Math.random() * 30 + 10);
const distance = 1300



  ;[...Array(nb_card).keys()].forEach((index) => {
    const section = document.createElement("section");
    section.classList.add("film")
    section.setAttribute("id", index)


    const front_div = document.createElement("div")
    front_div.classList.add("affiche_front")

    const affiche = document.createElement("img")
    affiche.setAttribute("src", "./img/background.svg")
    const text = document.createElement("h2")
    text.innerText = index.toString()

    front_div.appendChild(affiche)
    front_div.appendChild(text)

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


console.log("---------------")
console.log(film_cards)
film_cards.sort(() => Math.random() - 0.5)
console.log(film_cards)
console.log("---------------")

const rect_poss = Array(nb_card)

film_cards.forEach((elem, index) => {
  rect_poss[index] = elem.getBoundingClientRect();
})


setTimeout(function () {

  window.scrollTo(0, 0);

  film_cards.forEach((elem, index) => {


    const angle = ((2 * Math.PI) / film_cards.length) * index


    // console.log(angle * 360 / (Math.PI*2))
    // console.log(Math.sin(angle)*distance +(window.innerHeight/2))

    const rect = rect_poss[index]

    gsap.set(affiches, {
      margin: 0,
    })

    gsap.set(elem, {
      position: "absolute",
      x: rect.left,
      y: rect.top,
      top: 0,
      left: 0
    });


    const t1 = gsap.timeline({ ease: Linear })

    master.add(t1, 0)

    t1.to(elem, {
      delay: Math.random(),
      duration: 2,
      y: rect.top - 50
    })
      .to(elem, {
        duration: 1,
        y: Math.sin(angle) * distance + (window.innerHeight / 2),
        z: Math.cos(angle) * distance,
        x: (window.innerWidth / 2),
        scale: ((Math.cos(angle) * distance + distance) * 0.8 / (distance * 2) + 0.2) * 2.5,
        xPercent: -50,
        yPercent: -50,
      }, 3)

      ;[...Array(nb_tours).keys()].forEach(decalage => {
        decalage = decalage + 1;
        const angle = ((2 * Math.PI) / film_cards.length) * ((index + decalage) % film_cards.length)

        t1.to(elem, {
          duration: 0.5 * (decalage / nb_tours) / 2,
          y: Math.sin(angle) * distance + (window.innerHeight / 2),// + window.innerHeight/2,
          z: Math.cos(angle) * distance,
          x: (window.innerWidth / 2),
          scale: ((Math.cos(angle) * distance + distance) * 0.8 / (distance * 2) + 0.2) * 2.5,
          xPercent: -50,
          yPercent: -50,
        })
      })




    if ((index + nb_tours) % film_cards.length == 0) {
      t1.to(elem, {
        duration: 1,
        x: window.innerWidth / 2 - 100,
        rotateZ: "-10deg",
      }, "+=0")
        .to(zone_contre, {
          duration: 1,
          "--transparance_contre": "100%"
        }, "<")
        .to(elem, {
          duration: 1,
          x: window.innerWidth / 2,
          rotateZ: "0deg"
        }, "+=0")
        .to(zone_contre, {
          duration: 1,
          "--transparance_contre": "70%"
        }, "<")

        .to(elem, {
          duration: 1,
          x: window.innerWidth / 2 + 100,
          rotateZ: "10deg"
        }, "+=0")
        .to(zone_pour, {
          duration: 1,
          "--transparance_pour": "0%"
        }, "<")
        .to(elem, {
          duration: 1,
          x: window.innerWidth / 2,
          rotateZ: "0deg"
        }, "+=0")
        .to(zone_pour, {
          duration: 1,
          "--transparance_pour": "30%"
        }, "<")
    }
  })

}, 2000);



///////////////////////

// const img = document.getElementById("img");
// const card = document.getElementById("card");

// img.onload = () => {
//   const colorThief = new ColorThief();
//   const color = colorThief.getColor(img);

//   card.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
// };



const master = gsap.timeline({
  onComplete: () => {

    console.log("Tout est fini");
  }
});



//

gsap.registerPlugin(Observer);

let decalageY = 0.0
Observer.create({
  target: window,
  type: "touch",
  debounce: true,

  onChangeY(self) {

    decalageY += self.deltaY / 200;

    film_cards.forEach((elem, index) => {
      const angle = (((2 * Math.PI) / film_cards.length) * ((index + nb_tours) % film_cards.length)) + decalageY
      gsap.set(elem, {
        y: Math.sin(angle) * distance + (window.innerHeight / 2),
        z: Math.cos(angle) * distance,
        scale: ((Math.cos(angle) * distance + distance) * 0.8 / (distance * 2) + 0.2) * 2.5,

      });
    })
  },

  onRelease() {

    const curent_index = (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length

    const ang =(((2 * Math.PI) / film_cards.length) * ((curent_index + nb_tours) % film_cards.length)) + decalageY
    const degangle = Math.round(ang*180 / Math.PI)
    
    
    const censibiliter = 10

    console.log("degangle : ", degangle)
    console.log("25%",degangle / (censibiliter*2))

    if (degangle > censibiliter) {
      nb_tours += Math.round(degangle / (censibiliter*2))
      console.log("ooooooooooooooo")
    }
    else if (degangle < -censibiliter) {
      nb_tours -= Math.round(-degangle / (censibiliter*2))
      console.log("iiiiiiiiiiiiiii")
    }
    console.log(nb_tours)

    decalageY = 0;

    film_cards.forEach((elem, index) => {
      const angle = (((2 * Math.PI) / film_cards.length) * ((index + nb_tours) % film_cards.length))

      gsap.to(elem, {
        duration : 0.2,
        y: Math.sin(angle) * distance + (window.innerHeight / 2),
        z: Math.cos(angle) * distance,
        scale: ((Math.cos(angle) * distance + distance) * 0.8 / (distance * 2) + 0.2) * 2.5,
      });
    
    })
  }


});


gsap.registerPlugin(Observer)

let decalageX = 0;

Observer.create({
  target: window,
  type: "pointer,touch",
  dragMinimum: 5,

  onChangeX(self) {
    decalageX += self.deltaX
    const curent_elem = (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length
    gsap.set(film_cards[curent_elem], {
      x: decalageX + window.innerWidth / 2,
      rotate: (decalageX) * 0.1
    })
  },

  onRelease() {
    if (decalageX > 250) {
      console.log("DROIT")
    }
    else if (decalageX < -250) {
      console.log("GAUCHE")
    }
    else {
      decalageX = 0;
      const curent_index = (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length

      gsap.to(film_cards[curent_index], {
        x: decalageX + window.innerWidth / 2,
        rotate: 0
      })
    }
  }
})

console.log("nb_tours = ", nb_tours)
console.log("correcte = ", (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length)
console.log(film_cards)

film_cards[(film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length].setAttribute("style", "border:3px solid red;")