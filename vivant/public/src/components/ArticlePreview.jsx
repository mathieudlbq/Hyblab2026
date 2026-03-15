import React from 'react';

const ArticlePreview = ({ articleData }) => {
  // Extraction de la meta description, ou contenu par défaut.
  const metadesc = articleData.fullArticle?._yoast_wpseo_metadesc || "";

  return (
    <div className="bg-white/80 border-5 rounded-[20px] xl:p-4 p-2 xl:w-[22.5vw] w-[70vw] s:h-40 text-left shadow-xl flex flex-col gap-2"
      style={{borderColor : articleData.category_color}}
    >
      {/* Contenu textuel */}
      <div>
        <h3 className="font-extrabold xl:text-sm text-[1.5vh] leading-snug mb-2">
          {articleData.nom}
        </h3>
        {metadesc && (
          <p className="xl:text-sm text-[1.25vh] italic font-medium leading-snug line-clamp-4">
            {metadesc}
          </p>
        )}
      </div>

      {/* Image de couverture */}
      {articleData.image && (
        <div className="w-full xl:h-36 h-[15vh] rounded-[20px] overflow-hidden shadow-sm">
          <img 
            src={articleData.image} 
            alt={articleData.nom} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      {/* Boutons en bas */}
      <div className="flex items-center gap-4.5">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.open(articleData.fullArticle.Permalink, '_blank');
          }}
          className="flex-1 text-white xl:rounded-[18px] rounded-[8px] xl:p-2 p-1 font-bold xl:text-base text-[1.25vh] cursor-pointer shadow-sm text-center"
          style={{backgroundColor : articleData.category_color}}
        >
          Lire la suite de l'article
        </button>
        <button 
          className="xl:w-auto xl:h-auto xl:p-2 p-1 rounded-full bg-[#F6E91E] flex items-center justify-center hover:bg-[#E5D813] cursor-pointer shrink-0 shadow-sm"
          title="Aller sur la carte"
          onClick={(e) => {
            e.stopPropagation();
            // Ajouter d'autres comportements ici si nécessaire.
          }}
        >
          <svg className="xl:w-7 xl:h-7 w-[4vw] h-[4vw] text-black drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArticlePreview;
