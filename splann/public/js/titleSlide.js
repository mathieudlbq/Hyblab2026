"use strict";

// async init function (because of the awaits on fetches)
const initSlide1 = async function(){
  
  // Get some data
  let response = await fetch('data/contaminationMiniere.json');
  const data2 = await response.json();

  // Update the DOM

  // Insert title
  const title = document.querySelector('.titre');
  title.innerHTML = data2.titreEnquete;

  const titleBarContent = document.querySelector('.title-bar-content')
  titleBarContent.innerHTML = data2.titreEnquete;

  // Insert chapeau
  const chapeau = document.querySelector('.chapeau')
  chapeau.innerHTML = data2.chapeauEnquete;

  // Insert img
  const imgPrincipale = document.querySelector('.imgPrincipale')
  imgPrincipale.src = data2.imgPath

  // Insert dessin
  const dessinPrincipale = document.querySelector('.illustration')
  dessinPrincipale.src = data2.dessinPath

};