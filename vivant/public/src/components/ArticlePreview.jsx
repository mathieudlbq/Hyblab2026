import React from 'react';

const ArticlePreview = ({ articleData }) => {
  // Extraction de la meta description, ou contenu par défaut.
  const metadesc = articleData.fullArticle?._yoast_wpseo_metadesc || "";

  return (
    <div className="bg-[#f2f2f2] rounded-[36px] p-5 w-80 text-left text-black shadow-xl flex flex-col group pointer-events-auto">
      {/* Contenu textuel */}
      <div className="mb-4">
        <h3 className="font-extrabold text-[19px] leading-snug mb-2">
          {articleData.nom}
        </h3>
        {metadesc && (
          <p className="text-[15px] italic font-medium leading-snug text-gray-800 line-clamp-4">
            {metadesc}
          </p>
        )}
      </div>

      {/* Image de couverture */}
      {articleData.image && (
        <div className="w-full h-36 rounded-[28px] overflow-hidden mb-4 shadow-sm">
          <img 
            src={articleData.image} 
            alt={articleData.nom} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      {/* Boutons en bas */}
      <div className="flex items-center gap-2 mt-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.open(articleData.fullArticle.Permalink, '_blank');
          }}
          className="flex-1 bg-[#FF3B83] hover:bg-[#E02967] text-white py-[14px] px-4 rounded-full font-bold text-[15px] transition-colors shadow-sm text-center tracking-normal"
        >
          Lire la suite de l'article
        </button>
        <button 
          className="w-[52px] h-[52px] bg-[#F6E91E] flex items-center justify-center rounded-full hover:bg-[#E5D813] transition-colors shrink-0 shadow-sm"
          title="Aller sur la carte"
          onClick={(e) => {
            e.stopPropagation();
            // Ajouter d'autres comportements ici si nécessaire.
          }}
        >
          <svg className="w-7 h-7 text-black drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArticlePreview;
