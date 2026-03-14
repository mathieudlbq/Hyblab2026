"use strict"

window.scrollTo(0, 0);


const affiches = document.querySelector(".affiches");

const zone_pour = document.querySelector(".zone_pour");
const zone_contre = document.querySelector(".zone_contre");

const film_cards = [];
// generate affiche

let nb_card = 0;
let nb_tours = Math.round(Math.random() * 30 + 10);
const distance = 200;




function degtoscale(angle) {
  const scalemax = 3;
  const scalemin = 0.3;

  return ((Math.cos(angle) * distance + distance) * (scalemax - scalemin) / (distance * 2) + scalemin)
}





loadFilm().then((filmsNodes) => {
  filmsNodes.forEach((card) => {
    film_cards.push(card);
    affiches.appendChild(card);

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
  });
}).finally(()=> {
  nb_card = film_cards.length;

  const rect_poss = Array(nb_card);
  let timelinesRestantes = 0;
  film_cards.forEach((elem, index) => {
    rect_poss[index] = elem.getBoundingClientRect();
  });
  setTimeout(function () {

    window.scrollTo(0, 0);

    film_cards.forEach((elem, index) => {


      const angle = ((2 * Math.PI) / film_cards.length) * index



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

      timelinesRestantes += 1
      const t1 = gsap.timeline({ ease: Linear })
        .eventCallback("onComplete", () => {
          timelinesRestantes--; // une timeline est finie
          if (timelinesRestantes === 0) {
            // Toutes les timelines sont terminées
            observer(); // votre fonction
          }
        });


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
          scale: degtoscale(angle),
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
            scale: degtoscale(angle),
            xPercent: -50,
            yPercent: -50,
          })
        })




      if ((index + nb_tours) % film_cards.length == 0) {
        t1.to(elem, {
          duration: 1,
          x: window.innerWidth / 2 - 100,
        }, "+=0")
          .to(zone_contre, {
            duration: 1,
            "--transparance_contre": "100%"
          }, "<")
          .to(elem, {
            duration: 1,
            x: window.innerWidth / 2,
          }, "+=0")
          .to(zone_contre, {
            duration: 1,
            "--transparance_contre": "70%"
          }, "<")

          .to(elem, {
            duration: 1,
            x: window.innerWidth / 2 + 100,
          }, "+=0")
          .to(zone_pour, {
            duration: 1,
            "--transparance_pour": "0%"
          }, "<")
          .to(elem, {
            duration: 1,
            x: window.innerWidth / 2,
          }, "+=0")
          .to(zone_pour, {
            duration: 1,
            "--transparance_pour": "30%"
          }, "<")
      }


    })

  }, 2000);
  // film_cards[(film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length]?.setAttribute("style", "border:3px solid red;")


});






//anmation card










///////////////////////









//






function observer() {
  gsap.registerPlugin(Observer);

  let decalageY = 0
  Observer.create({
    target: window,
    type: "touch",
    debounce: true,

    onChangeY(self) {

      decalageY += self.deltaY / 400;

      if (Math.abs(decalageX) < 70) {
        film_cards.forEach((elem, index) => {
          const angle = (((2 * Math.PI) / film_cards.length) * ((index + nb_tours) % film_cards.length)) + decalageY
          gsap.set(elem, {
            y: Math.sin(angle) * distance + (window.innerHeight / 2),
            z: Math.cos(angle) * distance,
            scale: degtoscale(angle),

          });
        })
      }

    },

    onRelease() {

      const curent_index = (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length

      const ang = (((2 * Math.PI) / film_cards.length) * ((curent_index + nb_tours) % film_cards.length)) + decalageY
      const degangle = Math.round(ang * 180 / Math.PI)


      const censibiliter = 10


      if (degangle > censibiliter) {
        nb_tours += 1 //Math.round(degangle / (censibiliter * 2))
      }
      else if (degangle < -censibiliter) {
        nb_tours -= 1 //Math.round(-degangle / (censibiliter * 2))
      }

      decalageY = 0;

      film_cards.forEach((elem, index) => {
        const angle = (((2 * Math.PI) / film_cards.length) * ((index + nb_tours) % film_cards.length))

        gsap.to(elem, {
          duration: 0.2,
          y: Math.sin(angle) * distance + (window.innerHeight / 2),
          z: Math.cos(angle) * distance,
          scale: degtoscale(angle),
        });
      })
    }


  });

  let decalageX = 0;

  let curentX_film_index = null

  Observer.create({
    target: window,
    type: "pointer,touch",
    dragMinimum: 5,

    onChangeX(self) {
      decalageX += self.deltaX

      if (curentX_film_index == null) {
        curentX_film_index = (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length
      }

      gsap.set(film_cards[curentX_film_index], {
        x: decalageX + window.innerWidth / 2,
      })
      gsap.set(zone_pour, {
        "--transparance_pour": `${((-30) * (decalageX / (window.innerWidth / 2)) + 30)}%`
      })
      gsap.set(zone_contre, {
        "--transparance_contre": `${((100 - 70) * (decalageX / (-window.innerWidth / 2)) + 70)}%`
      })
    },

    onRelease() {
      const curent_elem = film_cards[curentX_film_index]

      if (decalageX > 100) {
        decalageX = window.innerWidth / 2 + 300;
        film_cards.pop(curentX_film_index);
        console.log("DROIT")
        updateroue()
      }
      else if (decalageX < -100) {
        decalageX = -window.innerWidth / 2 - 300;
        console.log("GAUCHE")
        film_cards.pop(curentX_film_index);
        updateroue()
      } else {
        decalageX = 0;
      }

      gsap.timeline().to(curent_elem, {
        duration: 0.2,
        x: decalageX + window.innerWidth / 2,
        onComplete() {
          decalageX = 0;
        }
      })
      .to(zone_pour, {
        duration: 0.2,
        "--transparance_pour": `${((-30) * (decalageX / (window.innerWidth / 2)) + 30)}%`
      }, "<")
      .to(zone_contre, {
        duration: 0.2,
        "--transparance_contre": `${((100 - 70) * (decalageX / (-window.innerWidth / 2)) + 70)}%`
      }, "<")
      
      curentX_film_index = null
    }
  })
}



function updateroue() {
  console.log(film_cards.length)
  film_cards.forEach((elem, index) => {
    const angle = (((2 * Math.PI) / film_cards.length) * ((index + nb_tours) % film_cards.length))

    gsap.to(elem, {
      duration: 0.2,
      y: Math.sin(angle) * distance + (window.innerHeight / 2),
      z: Math.cos(angle) * distance,
      scale: degtoscale(angle),
    });
  })
}