"use strict";

// Create Empty Slide - wrap in IIFE
(async () => {
  await createEmptyContent();

  // Init of the (touch friendly) Swiper slider
  const swiper = new Swiper("#mySwiper", {
    direction: "vertical",
    mousewheel: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  swiper.on("slideChange", function () {
    let nbSlide = swiper.slides.length;
    let index = swiper.activeIndex;
    if (index == 0){
      initSlide1();
    }
    else if (index == 1){
      console.log("")
    }
    else if (index == nbSlide-1){
      initSlide3();
    }
    else{
      initContentSlide(index)
    }
  });

  // Wait for the content to preload and display 1st slide
  // Here we simulate a loading time of one second
  setTimeout(() => { 
    // fade out the loader "slide"
    // and send it to the back (z-index = -1)
    anime({
      delay: 1000,
      targets: '#loader',
      opacity: '0',
      'z-index' : -1,
      easing: 'easeOutQuad',
    });
    // Init title slide
    initSlide1();
  }, 1000);
})();
