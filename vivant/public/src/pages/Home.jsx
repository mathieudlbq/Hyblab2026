import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCityByCoordinates } from '../../../utils/coordinate';
import { findNearestArticles, getLastArticleDistance } from '../../../utils/dist';
import './Home.css';

const N_ARTICLES = 10;

// ─── Composant icône avec bascule shadow / no-shadow au clic ────────────────
//
//  imgShadow : chemin vers la version avec ombre (état normal / "soulevé")
//  imgFlat   : chemin vers la version sans ombre (état pressé / "enfoncé")
//  active    : booléen – true quand le bouton est pressé
//
const SwitchIcon = ({ imgShadow, imgFlat, active, size = 100 }) => (
  <div className="switch-icon" style={{ width: size, height: size }}>
    {/* Version avec ombre – visible au repos */}
    <img
      src={imgShadow}
      alt=""
      width={size}
      height={size}
      className="switch-icon__img switch-icon__img--shadow"
      style={{ opacity: active ? 0 : 1 }}
    />
    {/* Version sans ombre – visible au clic */}
    <img
      src={imgFlat}
      alt=""
      width={size}
      height={size}
      className="switch-icon__img switch-icon__img--flat"
      style={{ opacity: active ? 1 : 0 }}
    />
  </div>
);

// ─── Page Home ───────────────────────────────────────────────────────────────

const Home = () => {
  const navigate = useNavigate();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [articles, setArticles] = useState([]);
  const [activeBtn, setActiveBtn] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/vivant/api/articles')
      .then(r => r.json())
      .then(data => setArticles(data))
      .catch(err => console.error('Error fetching articles:', err));
  }, []);

  // Feedback visuel 600 ms puis déclenchement de l'action
  const handlePress = (btnId, action) => {
    setActiveBtn(btnId);
    setTimeout(() => {
      setActiveBtn(null);
      action();
    }, 600);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      navigate('/carte', { state: { hasCity: false } });
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const cityName = await getCityByCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          const centre = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const nearestArticles = findNearestArticles(articles, centre, N_ARTICLES);
          const lastDist = getLastArticleDistance(nearestArticles, centre);
          setIsLoadingLocation(false);
          navigate('/carte', {
            state: {
              hasCity: true,
              lat: position.coords.latitude,
              long: position.coords.longitude,
              name: cityName || 'Votre position',
              articles: nearestArticles,
              lastArticleDist: lastDist,
            },
          });
        } catch {
          setIsLoadingLocation(false);
          navigate('/carte', { state: { hasCity: false, articles } });
        }
      },
      () => {
        setIsLoadingLocation(false);
        navigate('/carte', { state: { hasCity: false, articles } });
      }
    );
  };

  return (
    <div className="home-page">

      {/* ── Titre ── */}
    <div className="text-center mb-10 text-xl">
      <h1 className="text-center">
        Comment voulez-vous<br />
        démarrer votre{' '}
        <span
          className="inline-block bg-[url('/assets/home_illustrations/Trait Jaune.svg')] 
                    bg-no-repeat bg-bottom pb-2"
        >
          exploration
        </span>{' '}
        ?
      </h1>
    </div>

      {/* ── Colonne de boutons ── */}
      <div className="home-buttons-col">

        {/* ── Bouton 1 : Près de chez vous ── */}
        <button
          className="home-btn"
          onClick={() => handlePress('geo', handleGeolocation)}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <span className="loading loading-spinner" style={{ width: 100, height: 100 }} />
          ) : (
            <SwitchIcon
              imgShadow="/assets/home_illustrations/Pin 2_shadow.svg"
              imgFlat="/assets/home_illustrations/Pin 2_shadow.svg"
              active={activeBtn === 'geo'}
            />
          )}
          <span className="home-btn__label">Près de chez vous</span>
        </button>

        {/* ── Bouton 2 : Par une ville ── */}
        <button
          className="home-btn"
          onClick={() =>
            handlePress('ville', () =>
              navigate('/carte', { state: { hasCity: false, articles } })
            )
          }
        >
          <SwitchIcon
            imgShadow="/assets/home_illustrations/Local 2_shadow.svg"
            imgFlat="/assets/home_illustrations/Local 2_shadow.svg"
            active={activeBtn === 'ville'}
          />
          <span className="home-btn__label">Par une ville de notre région</span>
        </button>

        {/* ── Bouton 3 : Dernier article ── */}
        <button
          className="home-btn"
          onClick={() =>
            handlePress('article', () =>
              navigate('/carte', { state: { hasCity: false, articles } })
            )
          }
        >
          <SwitchIcon
            imgShadow="/assets/home_illustrations/Article 2_shadow.svg"
            imgFlat="/assets/home_illustrations/Article 1.svg"
            active={activeBtn === 'article'}
          />
          <span className="home-btn__label">
            Depuis la localisation de<br />notre dernier article
          </span>
        </button>

      </div>
    </div>
  );
};

export default Home;
