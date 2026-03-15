"use strict"



gsap.ticker.fps(30);


const affiches = document.querySelector(".affiches");

const zone_pour = document.querySelector(".zone_pour");
const zone_contre = document.querySelector(".zone_contre");

const icon_interesse = document.querySelector(".icon_interesse");
const icon_pasinteresse = document.querySelector(".icon_pasinteresse");

const film_cards = [];
// generate affiche

let nb_card = 0;
let nb_tours = Math.round(Math.random() * 30 + 10);
const distance = 100;

let total = 0


function get_current_index() {
  return (film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length
}



function degtoscale(angle) {
  const scalemax = 3;
  const scalemin = 0.3;

  return ((Math.cos(angle) * distance + distance) * (scalemax - scalemin) / (distance * 2) + scalemin)
}





loadFilm().then((filmsNodes) => {

  if (filmsNodes.length == 0) {
    window.location.href = "podium.html"
  }

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
    })

  });

}).finally(() => {

  window.scrollTo(0, 0);


  const rect_poss = Array(nb_card)
  film_cards.forEach((elem, index) => {
    rect_poss[index] = elem.getBoundingClientRect();
  })

  //début annimation
  const tl = gsap.timeline({
    ease: "linear",
    onComplete: observer
  })

  tl.from(".text_intro h2", {
    duration: 1.2,
    y: 80,
    opacity: 0,
    ease: "power4.out"
  })

    .from(".text_intro p", {
      duration: 1,
      y: 40,
      opacity: 0,
      ease: "power3.out"
    }, "-=0.6")

    .from(".logos img", {
      duration: 0.8,
      scale: 0,
      opacity: 0,
      stagger: 0.2,
      ease: "back.out(1.7)"
    }, "-=0.4")

    .to(".text_intro", {
      duration: 1,
      x: `-=${window.innerWidth}`,
      rotateY: "-=700deg",
      rotateZ: "-=30deg",
      rotateX: "-=30deg",
    }, "+=2")
    .from(".affiches", {
      filter: "blur(4px)",
    })

  total = film_cards.length
  const getAngle = (i) => ((2 * Math.PI) / total) * i

  gsap.set(affiches, {
    margin: 0
  })

  gsap.set(film_cards, {
    position: "absolute",
    top: 0,
    left: 0,
    x: (i) => rect_poss[i].left,
    y: (i) => rect_poss[i].top,
    clearProps: "height,width"

  })



  tl.to(film_cards, {
    delay: () => Math.random(),
    duration: 2,
    y: (i) => rect_poss[i].top - 50,
    rotate: (i) => Math.random() * 20 - 10
  })

  // placement dans le cercle
  tl.to(film_cards, {
    delay: (i) => ((total + (i - (total / 2))) % total) * 0.2,
    duration: 0.2,
    x: window.innerWidth / 2,
    y: (i) => Math.sin(getAngle(i)) * distance + window.innerHeight / 2,
    z: (i) => Math.cos(getAngle(i)) * distance,
    rotate: 0,
    xPercent: -50,
    yPercent: -50,
    scale: 1,
    transformOrigin: "center center",
    onComplete: () => {
      gsap.set(film_cards, { clearProps: "scale" });
    }
  })
  for (let tour = 1; tour <= nb_tours; tour++) {

    const dur = 0.5 * (tour / nb_tours) / 2
    const cur_elem = film_cards[(film_cards.length + (-tour) % film_cards.length) % film_cards.length]

    tl.to(film_cards, {
      duration: dur,
      xPercent: -50,
      yPercent: -50,

      y: (i) => {
        const actual_index = (i + tour) % total
        const angle = getAngle(actual_index)
        return Math.sin(angle) * distance + window.innerHeight / 2
      },

      z: (i) => {
        const actual_index = (i + tour) % total
        const angle = getAngle(actual_index)
        return Math.cos(angle) * distance
      },
      x: window.innerWidth / 2,
    }).to("body", {
      duration: dur,
      backgroundColor: () => cur_elem.querySelector(".affiche_front").style.backgroundColor
    },"<")
  }


  const current_elem = film_cards[get_current_index()]




  tl.to(current_elem.querySelector(".affiche_front"), {
    duration: 1,
    rotationY: 180
  })
    .to(current_elem.querySelector(".affiche_back"), {
      duration: 1, rotationY: 0
    },
      "<")
    .to(current_elem.querySelector(".affiche_front"), {
      duration: 1,
      rotationY: 0
    })
    .to(current_elem.querySelector(".affiche_back"), {
      duration: 1,
      rotationY: 180
    },
      "<")

    .to(current_elem, {
      duration: 1,
      x: `-=${100}`, // aller à gauche
      rotate: -3,
      repeat: 1,      // revient automatiquement au centre
      yoyo: true,
      ease: "power1.inOut"
    })
    .to(zone_contre, {
      duration: 1,
      "--transparance_contre": "100%",
      repeat: 1,
      yoyo: true,
      ease: "power1.inOut"
    }, "<")
    .to(icon_pasinteresse, {
      duration: 1,
      x: "+=120",
      rotate: 450,
      repeat: 1,
      yoyo: true,
      ease: "power1.inOut"
    }, "<")


    .to(current_elem, {
      duration: 1,
      x: `+=100`, // aller à droite
      rotate: 3,
      repeat: 1,
      yoyo: true,
      ease: "power1.inOut"
    })
    .to(zone_pour, {
      duration: 1,
      "--transparance_pour": "0%",
      repeat: 1,
      yoyo: true,
      ease: "power1.inOut"
    }, "<")
    .to(icon_interesse, {
      duration: 1,
      x: "-=120",
      rotate: -450,
      repeat: 1,
      yoyo: true,
      ease: "power1.inOut"

    }, "<");

})


function observer() {
  gsap.registerPlugin(Observer);

  let decalageY = 0
  Observer.create({
    target: window,
    type: "touch",
    debounce: true,

    onChangeY(self) {

      if (Math.abs(decalageX) < 70) {

        decalageY += self.deltaY / 400;

        const getAngle = (i) => (((2 * Math.PI) / film_cards.length) * ((i + nb_tours) % film_cards.length)) + decalageY
        const current_index = get_current_index()
        gsap.set(film_cards[current_index], {

          y: () => {
            const angle = getAngle(current_index)
            return Math.sin(angle) * distance + window.innerHeight / 2
          },


        })

      }

    },

    onRelease() {

      const curent_index = get_current_index()

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

      if (Math.abs(decalageX) <= 100) {

        updateroue()

        // const getAngle = (i) => (((2 * Math.PI) / film_cards.length) * ((i + nb_tours) % film_cards.length))
        // gsap.to(film_cards, {
        //   duration: 0.2,
        //   y: (i) => {
        //     const angle = getAngle(i)
        //     return Math.sin(angle) * distance + window.innerHeight / 2
        //   },

        //   z: (i) => {
        //     const angle = getAngle(i)
        //     return Math.cos(angle) * distance
        //   },

        // })
      }
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
        curentX_film_index = get_current_index()//(film_cards.length + (-nb_tours) % film_cards.length) % film_cards.length
      }

      const curent_elem = film_cards[curentX_film_index]

      gsap.set(curent_elem, {
        x: decalageX + window.innerWidth / 2,
        rotate: 3 * (decalageX / (window.innerWidth / 2))
      })
      gsap.set(zone_pour, {
        "--transparance_pour": `${((-50) * (decalageX / (window.innerWidth / 2)) + 50)}%`
      })
      gsap.set(zone_contre, {
        "--transparance_contre": `${((100 - 50) * (decalageX / (-window.innerWidth / 2)) + 50)}%`
      })
      gsap.set(icon_pasinteresse, {
        x: `${((20 + 100) * (decalageX / (-window.innerWidth / 2))) - 100}`,
        rotate: 450 * (decalageX / (-window.innerWidth / 2)),
      })
      gsap.set(icon_interesse, {
        x: `${((-20 - 100) * (decalageX / (window.innerWidth / 2))) + 100}`,
        rotate: -450 * (decalageX / (window.innerWidth / 2)),
      })
    },

    async onRelease() {
      const curent_elem = film_cards[curentX_film_index]

      if (decalageX > 100) {
        decalageX = window.innerWidth / 2 + 200;
        console.log("DROIT");
        await fetch(API + "/film-like", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nom_film: film_cards[curentX_film_index].dataset.filmName || "",
            real_film: film_cards[curentX_film_index].dataset.filmReal || ""
          })
        });

        film_cards.splice(curentX_film_index, 1);


        const compteur = create_view_compter(film_cards.length,total);
        const green = getComputedStyle(document.documentElement).getPropertyValue("--green")
          
        gsap.timeline({ease: "power4.out"}).set(compteur,{
          color : green,
        }).from(compteur,{
          duration : 1,
          x : decalageX,
          rotate: 100,
        }).to(compteur,{
          duration:0.2,
          opacity:0,
          onComplete: ()=>compteur.remove()
        })


        updateroue();
      }
      else if (decalageX < -100) {
        decalageX = -window.innerWidth / 2 - 200;
        console.log("GAUCHE");
        await fetch(API + "/film-unlike", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nom_film: film_cards[curentX_film_index].dataset.filmName || "",
            real_film: film_cards[curentX_film_index].dataset.filmReal || ""
          })
        });

        film_cards.splice(curentX_film_index, 1);

        const compteur = create_view_compter(film_cards.length,total)
        const red = getComputedStyle(document.documentElement).getPropertyValue("--red")
        gsap.timeline({ease: "power4.out"}).set(compteur,{
          color : red,
        }).from(compteur,{
          duration : 1,
          x : decalageX,
          rotate: 100,
        }).to(compteur,{
          duration:0.2,
          opacity:0,
          onComplete: ()=>compteur.remove()
        })

        updateroue();
      } else {
        decalageX = 0;
      }

      gsap.timeline().to(curent_elem, {
        duration: 0.2,
        x: decalageX + window.innerWidth / 2,
        rotate: 3 * (decalageX / window.innerWidth / 2),
        onComplete() {
          decalageX = 0;
        }
      })
        .to(zone_pour, {
          duration: 0.2,
          "--transparance_pour": `${50}%`
        }, "<")
        .to(zone_contre, {
          duration: 0.2,
          "--transparance_contre": `${50}%`
        }, "<")
        .to(icon_interesse, {
          duration: 0.2,
          x: 100,
          rotate: 0,
        }, "<")
        .to(icon_pasinteresse, {
          duration: 0.2,
          x: -100,
          rotate: 0,
        }, "<")

      curentX_film_index = null
    }
  })
}


function updateroue() {
  if (film_cards.length === 0) {
    const text = text_fin()
    gsap.from(text,{
      duration: 5,
      opacity : 0,
      y : "-=200",
      onComplete: () => window.location.href = "podium.html"
    })

    
    return;
  }

  const angles = film_cards.map((_, i) =>
    ((2 * Math.PI) / film_cards.length) * ((i + nb_tours) % film_cards.length)
  );

  const curent_elem = film_cards[get_current_index()]
  console.log(curent_elem.querySelector(".affiche_front").style.backgroundColor)
  gsap.timeline().to(film_cards, {
    duration: 0.2,
    y: (i) => Math.sin(angles[i]) * distance + window.innerHeight / 2,
    z: (i) => Math.cos(angles[i]) * distance
  })
    .to("body", {
      duration: 0.2,
      backgroundColor: curent_elem.querySelector(".affiche_front").style.backgroundColor
    }, "<")
    ;
}


setTimeout(() => {
  window.scrollTo(0, 0);
}, 500)


function create_view_compter(cpt,total){
  const compteur = document.createElement("span")
  compteur.innerText = `${cpt}/${total}`
  compteur.classList.add("compteur")

  document.querySelector("body").appendChild(compteur);
  return compteur
}

function text_fin(){
  const text_fin = document.createElement("h1")
  text_fin.innerText = "Il n'y a plus de film.\nRevenez la semaine prochaine pour découvrir de nouveaux films"
  text_fin.classList.add("text_fin")

  document.querySelector("body").appendChild(text_fin);
  return text_fin
}

