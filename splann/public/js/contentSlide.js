const initContentSlide = async function (index) {

}    

const createEmptyContent = async function(){
    let response = await fetch('data/contaminationMiniere.json');
    const data = await response.json();
    const nVolet = data.nVolet;
    let nBullet = 0;

    const endSlide = document.querySelector("#credit-slide");
    const sliderWrapper = document.querySelector(".swiper-wrapper");

    let slide;
    for (let i = 0; i < nVolet; i++) {
        nBullet = data.volet[i].nBullet;
        for(let j=0; j < nBullet; j++){
            slide = document.createElement("section");
            slide.classList.add("swiper-slide")
            slide.id = "content-slide"

            // Ajout du contenu

            let bulletContent = data.volet[i].bullet[j]
            let titleSlide = false;
            
            console.log(i)
            console.log(bulletContent)

            instaBox = document.createElement("section")
            instaBox.id = "instagram-box"
            for(let k=0; k<bulletContent.length; k++){
                if(bulletContent[k].type == "title"){
                    let title = document.createElement("h3");
                    title.innerHTML = bulletContent[k].content
                    instaBox.appendChild(title)
                    titleSlide = true;
                }
                else if(bulletContent[k].type == "paragraph"){
                    let paragraph = document.createElement("p");
                    paragraph.innerHTML = bulletContent[k].content
                    instaBox.appendChild(paragraph)
                }
                else if(bulletContent[k].type == "img"){
                    let img = document.createElement("img");
                    img.src = bulletContent[k].content
                    instaBox.appendChild(img)
                }
            }

            if(!titleSlide){
                let voletTitle = document.createElement("h2");
                voletTitle.innerHTML = data.volet[i].titreVolet
                slide.appendChild(voletTitle)
            }

            slide.appendChild(instaBox)
            
            sliderWrapper.insertBefore(slide, endSlide);
            }
            const bottom_sheet = document.createElement("div")
            bottom_sheet.classList.add("bottom-sheet")

            const handle_bar = document.createElement("div")
            handle_bar.classList.add("handle-bar")
            bottom_sheet.appendChild(handle_bar)

            const button = document.createElement("button")
            button.classList.add("toggle-btn")
            button.textContent = "▲"
            handle_bar.appendChild(button)

            const content = document.createElement("div")
            content.classList.add("content")
            bottom_sheet.appendChild(content)
            content.id = "extended-content"
            content.className="content"
            console.log(data.volet[i].extendedContent)//a mettre dans le sheet

            
            // à décaler dans un fichier à part
            //pour le téléphone portable
            /*const sheet = bottom_sheet;
            if (sheet.dataset.initialized) return;
                sheet.dataset.initialized = true; 
            const handlebar = handle_bar;
            const pagination = document.querySelector('.swiper-pagination');
            let isOpen=false;

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
            });*/
            
            //fin du décalage ds un fichier à part



            for(let j = 0; j < data.volet[i].extendedContent.length; j++){
                extendedElmt = data.volet[i].extendedContent[j]

                if (extendedElmt.type == "text"){
                    let paragraph = document.createElement("p");
                    paragraph.innerHTML = extendedElmt.content
                    content.appendChild(paragraph)
                }
                else if(extendedElmt.type == "img"){
                    let img = document.createElement("img");
                    img.src = extendedElmt.content
                    content.appendChild(img)
                }
            }

            slide.appendChild(bottom_sheet)



    }

}