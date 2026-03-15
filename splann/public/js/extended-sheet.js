"use strict";

// async init function (because of the awaits on fetches)
const addExtend = async function(swiper){
  const sheets = document.querySelectorAll('.bottom-sheet');
  const handlebars = document.querySelectorAll('.handle-bar');
  const pagination = document.querySelector('.nav-bar-hierarchical');


  for(let i=0;i<sheets.length;i++){
    let sheet=sheets[i]
    let handlebar = handlebars[i]
    if (sheet.dataset.initialized) return;
      sheet.dataset.initialized = true; 
    let isOpen=false;

    
    //pour le téléphone portable
    sheet.addEventListener('scroll', () => {swiper.allowTouchMove = false;});
    sheet.addEventListener('scroll', () => {swiper.allowTouchMove = true;});
    //pour le pc
    sheet.addEventListener('mouseenter', () => {console.log("entrée");swiper.allowTouchMove = false;swiper.params.simulateTouch = true;swiper.mousewheel.disable();console.log(swiper.allowTouchMove)});
    sheet.addEventListener('mouseleave', () => {console.log("sortie");swiper.allowTouchMove = true;swiper.params.simulateTouch = true;swiper.mousewheel.enable();console.log(swiper.allowTouchMove)});
    handlebar.addEventListener('click', () => {
      isOpen=!isOpen;
      sheet.classList.toggle('open',isOpen);
      pagination.classList.toggle('hidden',isOpen);
    });
    swiper.on('slideChange', function () {
      isOpen=false;
      sheet.classList.remove('open');
      pagination.classList.remove('hidden');
    });}
};

//création des slides (createemptycontent) dans initContentSlide.js->remplissage JSON -> ajouter les events listeners pour que ça bouge (code ici)