import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCityByCoordinates } from '../../../utils/coordinate';
import { findNearestArticles, getLastArticleDistance } from '../../../utils/dist';
import CityModal from '../components/CityModal';
import './Home.css';
import RoutePoinillee from './../assets/home_illustrations/Pointillés + Bonhomme.svg';
import TraitJaune from './../assets/home_illustrations/Trait Jaune.svg';
import Pin2Shadow from './../assets/home_illustrations/Pin 2_shadow.svg';
import Pin2 from './../assets/home_illustrations/Pin 1.svg';
import Local2Shadow from './../assets/home_illustrations/Local 2_shadow.svg';
import Local2 from './../assets/home_illustrations/Local 1-2.svg';
import Article2Shadow from './../assets/home_illustrations/Article 2_shadow.svg';
import Article1 from './../assets/home_illustrations/Article 1.svg';

const N_ARTICLES = 10;

// ─── Composant icône avec bascule shadow / no-shadow au clic ────────────────
//
//  imgShadow : chemin vers la version avec ombre (état normal / "soulevé")
//  imgFlat   : chemin vers la version sans ombre (état pressé / "enfoncé")
//  active    : booléen – true quand le bouton est pressé
//
const SwitchIcon = ({ imgShadow, imgFlat, active, size = 70 }) => (
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

  // ── Modale CityModal ──
  const [cityError, setCityError] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8080/vivant/api/articles')
      .then(r => r.json())
      .then((data) => {setArticles(data)})
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
      navigate('/test', { state: { hasCity: false } });
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
          navigate('/test', {
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
          navigate('/test', { state: { hasCity: false, articles } });
        }
      },
      () => {
        setIsLoadingLocation(false);
        navigate('/test', { state: { hasCity: false, articles } });
      }
    );
  };

  const handleLastArticle = () => {
    if (!articles || articles.length === 0) {
      navigate('/test', { state: { hasCity: false, articles } });
      return;
    }

    let lat = null;
    let long = null;
    const firstArticle = articles[0];

    // Récupérer les coordonnées du tout premier article (le plus récent)
    if (firstArticle._latlngmarker) {
      try {
        const marker = JSON.parse(firstArticle._latlngmarker);
        if (marker.latitude && marker.longitude) {
          lat = parseFloat(marker.latitude);
          long = parseFloat(marker.longitude);
        }
      } catch (e) {
        console.error('Erreur parsing latlngmarker pour le dernier article');
      }
    }

    if (lat !== null && long !== null) {
      const centre = { latitude: lat, longitude: long };
      const nearestArticles = findNearestArticles(articles, centre, N_ARTICLES);
      const lastDist = getLastArticleDistance(nearestArticles, centre);

      navigate('/test', {
        state: {
          hasCity: true,
          lat: lat,
          long: long,
          name: 'Dernier article',
          articles: nearestArticles,
          lastArticleDist: lastDist,
        },
      });
    } else {
      // Fallback si le dernier article n'a pas de coordonnées
      navigate('/test', { state: { hasCity: false, articles } });
    }
  };

  const handleCitySubmit = ({ name, lat, lng }) => {
    setCityError('');
    setIsModalLoading(true);
    try {
      const centre = { latitude: lat, longitude: lng };
      const nearest = findNearestArticles(articles, centre, N_ARTICLES);
      const lastDist = getLastArticleDistance(nearest, centre);

      setIsModalLoading(false);
      modalRef.current?.close();

      navigate('/test', {
        state: {
          hasCity: true,
          lat: lat,
          long: lng,
          name: name,
          articles: (nearest && nearest.length > 0) ? nearest : articles,
          lastArticleDist: (nearest && nearest.length > 0) ? lastDist : null,
        },
      });
    } catch (err) {
      console.error('Erreur de calcul :', err);
      setCityError('Erreur de calcul.');
      setIsModalLoading(false);
    }
  };

  return (
    <>
    <div className={`home-page transition-all duration-300`}>

      {/* ── Titre ── */}
      <div className="text-center text-xl">
        <h1>
          Comment voulez-vous<br />
          démarrer votre{" "}
          <span className="relative inline-block">
            exploration
            <img
              src={TraitJaune}
              alt=""
              className="absolute left-0 top-[-7px] w-full"
            />
          </span>{" "}
          ?
        </h1>
      </div>

      {/* ── Colonne de boutons ── */}
      <div
        className="home-buttons-col"
        style={{ position: 'relative', width: '100%' }}
      >

        {/* ── Route pointillée en arrière-plan ── */}
        {/* <img
          src={RoutePoinillee}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-82px',
            left: '54%',
            transform: 'translateX(-53%) scaleY(1.3) scaleX(1.6)', // 30% plus haut
            transformOrigin: 'center center',
            width: '100%',
            height: 'max(100%, 80vh)',
            objectFit: 'fill',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        /> */}

        {/* ── Bouton 1 : Près de chez vous ── */}
        <button
          className="home-btn"
          onClick={() => handlePress('geo', handleGeolocation)}
          disabled={isLoadingLocation}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {isLoadingLocation ? (
            <span className="loading loading-spinner loading-lg" style={{ width: 35, height: 35 }} />
          ) : (
            <SwitchIcon
              imgShadow={Pin2Shadow}
              imgFlat={Pin2}
              active={activeBtn === 'geo'}
            />
          )}
          <span className="text-sm">Près de chez vous</span>
        </button>

        {/* ── Bouton 2 : Par une ville ── */}
        <button
          className="home-btn"
          onClick={() =>
            handlePress('ville', () => modalRef.current?.showModal())
          }
          style={{ position: 'relative', zIndex: 1 }}
        >
          <SwitchIcon
            imgShadow={Local2Shadow}
            imgFlat={Local2}
            active={activeBtn === 'ville'}
          />
          <span className="text-sm">Par une ville de notre région</span>
        </button>

        {/* ── Bouton 3 : Dernier article ── */}
        <button
          className="home-btn"
          onClick={() => handlePress('article', handleLastArticle)}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <SwitchIcon
            imgShadow={Article2Shadow}
            imgFlat={Article1}
            active={activeBtn === 'article'}
          />
          <span className="text-sm">
            Depuis la localisation de<br />notre dernier article
          </span>
        </button>

      </div>
    </div>
    
    <CityModal
      isOpen={false} // Laissé contrôlé via modalRef depuis Home
      cityError={cityError}
      isLoading={isModalLoading}
      nArticles={N_ARTICLES}
      onSubmit={handleCitySubmit}
      onSkip={() => {
        modalRef.current?.close();
        navigate('/test', { state: { hasCity: false, articles } });
      }}
      modalRef={modalRef}
    />
    </>
  );
};

export default Home;