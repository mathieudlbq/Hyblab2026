import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { findNearestArticles, getLastArticleDistance } from '../../../utils/dist';
import CityModal from '../components/CityModal';

const N_ARTICLES = 20;

export const Carte = () => {
  const location = useLocation();
  const initialState = location.state || {};

  // ── État local (mis à jour après saisie de ville) ──
  const [lat, setLat]                     = useState(initialState.lat ?? null);
  const [long, setLong]                   = useState(initialState.long ?? null);
  const [cityName, setCityName]           = useState(initialState.name ?? '');
  const [hasCity, setHasCity]             = useState(initialState.hasCity ?? false);
  const [articles, setArticles]           = useState(initialState.articles ?? []);
  const [lastArticleDist, setLastArticleDist] = useState(initialState.lastArticleDist ?? null);

  // ── État de la modale ──
  const [cityError, setCityError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef(null);

  // Ouvrir la modale si pas encore de ville
  useEffect(() => {
    if (!hasCity) {
      modalRef.current?.showModal();
    }
  }, []); // une seule fois au montage

  // ── Validation de la ville : reçoit { name, lat, lng } depuis CityModal ──
  const handleCitySubmit = ({ name, lat, lng }) => {
    setCityError('');
    setIsLoading(true);

    try {
      const centre = { latitude: lat, longitude: lng };
      const allArticles = articles.length > 0 ? articles : (initialState.articles ?? []);

      // N articles les plus proches + distance au dernier
      const nearest  = findNearestArticles(allArticles, centre, N_ARTICLES);
      const lastDist = getLastArticleDistance(nearest, centre);

      setLat(lat);
      setLong(lng);
      setCityName(name);
      setHasCity(true);
      setArticles(nearest);
      setLastArticleDist(lastDist);
      setIsLoading(false);

      modalRef.current?.close();
    } catch (err) {
      console.error('Erreur calcul distance :', err);
      setCityError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Contenu principal (flouté si modale ouverte) ── */}
      <div className={`p-8 transition-all duration-300 ${!hasCity ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <h1 className="text-3xl font-bold mb-6 text-primary">
          {hasCity ? `Articles proches de ${cityName}` : 'Carte'}
        </h1>

        {/* Infos ville + distance */}
        {hasCity && (
          <div className="flex flex-col gap-2 mb-6">
            <div className="alert alert-success">
              <p>
                📍 Localisation de départ : <strong>{cityName}</strong>
                &nbsp;(Lat: {lat?.toFixed(4)}, Lng: {long?.toFixed(4)})
              </p>
            </div>

            {lastArticleDist && (
              <div className="alert alert-info">
                <p>
                  📏 Distance jusqu'au {articles.length}e article le plus proche :&nbsp;
                  <strong>{lastArticleDist.distance} km</strong>
                  {lastArticleDist.article?.Title && (
                    <span className="opacity-70"> — {lastArticleDist.article.Title}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Liste des articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div key={article.ID} className="card bg-base-100 shadow-xl">
              {article['Image Featured'] && (
                <figure>
                  <img
                    src={article['Image Featured']}
                    alt={article['Image Alt Text'] || article.Title}
                    className="w-full h-48 object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title text-base">{article.Title}</h2>
                <p className="text-sm opacity-60">{article.Date}</p>
                {article._distanceFromCentre != null && (
                  <p className="text-sm font-medium text-primary">
                    📍 {article._distanceFromCentre} km
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Zone carte */}
        <div className="w-full h-96 bg-base-200 mt-8 rounded-xl flex items-center justify-center border-2 border-primary/20">
          <p className="text-xl text-neutral">Emplacement de la carte (Leaflet, Mapbox, etc.)</p>
        </div>
      </div>

      {/* ── Modale saisie de ville (composant externe) ── */}
      <CityModal
        isOpen={!hasCity}
        cityError={cityError}
        isLoading={isLoading}
        nArticles={N_ARTICLES}
        onSubmit={handleCitySubmit}
        onSkip={() => {
          setHasCity(true);
          modalRef.current?.close();
        }}
        modalRef={modalRef}
      />
    </>
  );
};