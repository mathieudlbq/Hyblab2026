const initContentSlide = async function (index) {

}    

const createEmptyContent = async function(){
    let response = await fetch('data/contaminationMiniere.json');
    const data = await response.json();
    const nVolet = data.nVolet;
    let nBullet = 0;
    let nSlide=0;

    const endSlide = document.querySelector("#last-slide");
    
    const sliderWrapper = document.querySelector(".swiper-wrapper");

    let slide;
    for (let i = 0; i < nVolet; i++) {
        nBullet = data.volet[i].nBullet;
        for(let j=0; j < nBullet; j++){
            nSlide++
            slide = document.createElement("section");
            slide.classList.add("swiper-slide")
            slide.id = "content-slide"

            // Ajout du contenu

            let bulletContent = data.volet[i].bullet[j]
            let titleSlide = false;
            

            let titleBar = document.createElement("div")
            titleBar.classList.add("title-bar")

            let titleVolet = document.createElement("h2")
            titleVolet.innerHTML = data.volet[i].titreVolet

            let progressBadge = document.createElement("span")
            progressBadge.classList.add("progress-badge")
            progressBadge.id = "badge"
            progressBadge.innerHTML = (2+nSlide)+"/";
            
            titleBar.appendChild(titleVolet)
            titleBar.appendChild(progressBadge)

            slide.appendChild(titleBar)

            instaBox = document.createElement("section")
            instaBox.id = "instagram-content"
            for(let k=0; k<bulletContent.length; k++){
                if(bulletContent[k].type == "title"){
                    let title = document.createElement("h1");
                    title.innerHTML = "<span id='titleHighlight'>"+bulletContent[k].content+"</span>"
                    title.id = "instagram-header"
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
                    img.classList.add("illustration")
                    img.src = bulletContent[k].content
                    instaBox.appendChild(img)
                }
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
            button.innerHTML = '<img src="img/fleche_rouge.png">'
            handle_bar.appendChild(button)

            handle_bar.appendChild(document.createElement('br'))
            
            const textHandle = document.createElement("p")
            textHandle.id= "handle-bar-text"
            textHandle.innerHTML = "ENVIE DE CREUSER ?"
            handle_bar.appendChild(textHandle)

            const content = document.createElement("div")
            content.classList.add("content")
            bottom_sheet.appendChild(content)
            content.id = "extended-content"
            content.className="content"

            const extendTitle = document.createElement("p")
            extendTitle.id = "extended-content-title"
            extendTitle.innerHTML = "EN PROFONDEUR"
            content.appendChild(extendTitle)

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

            const degrade = document.createElement('img')
            degrade.id = "degrade-extended"
            degrade.src = "img/degrade_noir.png"

            content.appendChild(degrade)

            const linkEnquete = document.createElement("a")
            linkEnquete.id = "link-enquete"
            linkEnquete.href = data.volet[i].lienVolet
            linkEnquete.innerHTML = "CREUSE ENCORE PLUS LOIN?"

            content.appendChild(linkEnquete);

            slide.appendChild(bottom_sheet)



    }
    let progressBadgeList = document.querySelectorAll(".progress-badge")
    for(let i=0; i<progressBadgeList.length; i++){
        
        badge = progressBadgeList[i]
        badge.innerHTML = badge.innerHTML + String(nSlide+3)
    }
}