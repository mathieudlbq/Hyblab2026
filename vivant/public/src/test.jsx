import { motion, useSpring, useMotionValue, useScroll, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useLocation } from 'react-router-dom';
import { findNearestArticles } from '../../utils/dist';
import ArticlePreview from './components/ArticlePreview';

// Imports des SVGs pour extraction de données (raw) et pour affichage (URL)
import path1Raw from './assets/paths/1.svg?raw';
import path2Raw from './assets/paths/2.svg?raw';
import path3Raw from './assets/paths/3.svg?raw';
import path1Url from './assets/paths/1.svg';
import path2Url from './assets/paths/2.svg';
import path3Url from './assets/paths/3.svg';
import path1PointsRaw from './assets/paths/pathPoints/1.svg?raw'
import path1Points from './assets/paths/pathPoints/1.svg'
import path2PointsRaw from './assets/paths/pathPoints/2.svg?raw'
import path2Points from './assets/paths/pathPoints/2.svg'
import path3PointsRaw from './assets/paths/pathPoints/3.svg?raw'
import path3Points from './assets/paths/pathPoints/3.svg'

import up_straight from './assets/mr_patate/up_straight.svg';
import up_left from     './assets/mr_patate/up_left.svg';
import up_right from    './assets/mr_patate/up_right.svg';
import down_straight from './assets/mr_patate/down_straight.svg';
import down_left from   './assets/mr_patate/down_left.svg';
import down_right from  './assets/mr_patate/down_right.svg';
import right from       './assets/mr_patate/right.svg';
import left from        './assets/mr_patate/left.svg';

const treeFiles = import.meta.glob('./assets/elements/tree/*.svg', { eager: true, import: 'default' });
const milestoneFiles = import.meta.glob('./assets/elements/milestone/*.svg', { eager: true, import: 'default' });
const signFiles = import.meta.glob('./assets/elements/sign/*.svg', { eager: true, import: 'default' });

const elements = {
  tree: { svg : Object.values(treeFiles), style : 'xl:scale-[95%] scale-[60%] origin-bottom'},
  milestone:  { svg : Object.values(milestoneFiles), style : 'xl:scale-[60%]'},
  sign: { svg : Object.values(signFiles)}
};

const ESPACEMENT = 0.20; 
const OFFSET_DEPART = 0.20; // Décale le premier article pour ne pas qu'il soit au tout début
export const NB_ARTICLES = 10;
const NB_PATH = Math.ceil(OFFSET_DEPART + (NB_ARTICLES * ESPACEMENT));
console.log("nombre de chemin pour " + NB_ARTICLES + " articles : " + NB_PATH);
const dicoPaths = {
  path1: { raw: path1Raw, svg: path1Url, points: path1Points, pointsRaw: path1PointsRaw },
  path2: { raw: path2Raw, svg: path2Url, points: path2Points, pointsRaw: path2PointsRaw },
  path3: { raw: path3Raw, svg: path3Url, points: path3Points, pointsRaw: path3PointsRaw }
};

const posCyclist = {
  up_straight,
  up_left,
  up_right,
  down_straight,
  down_left,
  down_right,
  right,
  left,
};

const pathOptions = Object.values(dicoPaths);
const pathList = Array.from({ length: NB_PATH }, () => 
  pathOptions[Math.floor(Math.random() * pathOptions.length)]
);


console.log(pathList)

const CategoryList = {
   "Entrepreneuriat":"#DED491",
    "Collectifs": "#DE391C",
    "Service publique": "#BA0650",
    "Initiative personnelle/quotidienne": "#FFCBC1"
  };
 
const InfinitePath = () => {
  const location = useLocation();
  const initialState = location.state || {};

  // ── État provenant du Router ──
  const [lat, setLat] = useState(initialState.lat ?? null);
  const [long, setLong] = useState(initialState.long ?? null);
  const [allArticles, setAllArticles] = useState(initialState.allArticles ?? []);
  const cityName = initialState.name || "Point de départ";

  // ── Filtre Catégories (Mobile) ──
  const availableCategories = [
    "Initiative personnelle/quotidienne",
    "Entrepreneuriat",
    "Collectifs",
    "Service publique"
  ];
  
  const [selectedCats, setSelectedCats] = useState(availableCategories);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleCategory = (cat) => {
    setSelectedCats(prev => {
      if (prev.includes(cat)) {
        // Bloque la désélection s'il ne reste qu'une seule catégorie
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== cat);
      }
      return [...prev, cat];
    });
  };

  // --- CONFIG DES ARTICLES ---
  const mapObjectsConfig = useMemo(() => {
    // 1. On filtre la base de données brute selon la catégorie sélectionnée
    const filteredAll = allArticles.filter(a => selectedCats.includes(a.categorie_tag));

    // 2. On récupère les 10 plus proches si on a une position, sinon les 10 premiers
    let closestArticles = [];
    if (lat !== null && long !== null) {
      closestArticles = findNearestArticles(filteredAll, { latitude: lat, longitude: long }, NB_ARTICLES);
    } else {
      closestArticles = filteredAll.slice(0, NB_ARTICLES);
    }

    const signLength = elements.sign.svg.length

    return closestArticles.map((article, index) => {
      const globalPos = OFFSET_DEPART + (index * ESPACEMENT);
      const pathIndex = Math.floor(globalPos) % pathList.length;
      const progress = globalPos % 1;
      return { 
        id: article.ID, 
        pathIndex, 
        progress, 
        globalPos,
        articleData: {
          nom: article.Title,
          text: `${article.Date}${article._distanceFromCentre != null ? ` - 📍 à ${article._distanceFromCentre} km` : ""}`,
          image: article['Image Featured'],
          categories: article.Catégories,
          fullArticle: article,
          category_color: CategoryList[article.categorie_tag]
        },
        svg: elements.sign.svg[Math.floor(Math.random() * signLength)],
      };
    });
  }, [allArticles, selectedCats, lat, long]);

  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathRefs = useRef([]);
  const [pathsData, setPathsData] = useState([]);
  const [pathsPointsData, setPathsPointsData] = useState([]);
  
  const [cyclistX, setCyclistX] = useState("50%");
  const pathY = useMotionValue("calc(85vh - 100%)");
 
  const latestProgress = useRef(0);
  const isMovingUpRef = useRef(true);
  const currentSvgPos = useRef(posCyclist.up_right);
  const [cyclistSvgPos, setCyclistSvgPos] = useState(posCyclist.up_right);
 
  const [articlePositions, setArticlePositions] = useState({});
  const SignDecalage = 12;

  // --- NOUVEAUX STATES POUR L'ARTICLE ACTIF (MOBILE) ---
  const [activeArticleId, setActiveArticleId] = useState(null);
  const activeArticleIdRef = useRef(null); 
  
  // --- INDICATION DE SCROLL ---
  const [showScrollHint, setShowScrollHint] = useState(true);
 
  const SPEED_DESKTOP = 5000;
  const SPEED_MOBILE  = 2500;
 
  const dynamicHeight = useMemo(() => {
    const speed = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
    const multiplier = Math.max(1, pathList.length / 2);
    return `${multiplier * speed}vh`;
  }, [isMobile]);
 
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
 
    const parser = new DOMParser();
    const extractedPaths = pathList.map(pathObj => {
      const doc = parser.parseFromString(pathObj.raw, "image/svg+xml");
      const path = doc.getElementById("cyclist-path");
      const svgTag = doc.querySelector("svg");
      const viewBox = svgTag?.getAttribute("viewBox")?.split(" ") || [0, 0, 767.25, 7337.6];
      return {
        d: path?.getAttribute("d"),
        width:  parseFloat(viewBox[2]),
        height: parseFloat(viewBox[3])
      };
    });

    const milestoneLength = elements.milestone.svg.length
    const treeLength = elements.tree.svg.length

    const extractedPoints = pathList.map(pathObj => {
      const doc = parser.parseFromString(pathObj.pointsRaw, "image/svg+xml");
      const trees = Array.from(doc.getElementsByClassName("cls-1"))
      const milestones = Array.from(doc.getElementsByClassName("cls-3"))
      const svgTag = doc.querySelector("svg");
      const viewBox = svgTag?.getAttribute("viewBox")?.split(" ") || [0, 0, 767.25, 7337.6];

      return [
        ...milestones.map(mile => ({
          x: parseFloat(mile.getAttribute("cx")),
          y: parseFloat(mile.getAttribute("cy")),
          width: parseFloat(viewBox[2]),
          height: parseFloat(viewBox[3]),
          svg: elements.milestone.svg[Math.floor(Math.random() * milestoneLength)],
          svgStyle: elements.milestone.style
        })),
        ...trees.map(tree => ({
          x: parseFloat(tree.getAttribute("cx")),
          y: parseFloat(tree.getAttribute("cy")),
          width: parseFloat(viewBox[2]),
          height: parseFloat(viewBox[3]),
          svg: elements.tree.svg[Math.floor(Math.random() * treeLength)],
          svgStyle: elements.tree.style
        }))
      ];
    });
    console.log(extractedPoints)
    setPathsData(extractedPaths)
    setPathsPointsData(extractedPoints)
 
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
 
  useEffect(() => {
    if (pathsData.length === 0) return;
    const timer = setTimeout(() => {
      const positions = {};
      mapObjectsConfig.forEach(obj => {
        const pathEl = pathRefs.current[obj.pathIndex];
        const data   = pathsData[obj.pathIndex];
        if (!pathEl || !data) return;
 
        const length = pathEl.getTotalLength();
        const pStart = pathEl.getPointAtLength(0);
        const pEnd   = pathEl.getPointAtLength(length);
        const isBottomToTop = pStart.y > pEnd.y;
        const t = isBottomToTop ? obj.progress : 1 - obj.progress;
        const point = pathEl.getPointAtLength(t * length);
 
        positions[obj.id] = {
          xPercent: (point.x / data.width)  * 100,
          yPercent: (point.y / data.height) * 100,
        };
      });

      // ── Positionnement de la ville de départ (au tout début du premier chemin) ──
      const data0 = pathsData[0];
      const pathEl0 = pathRefs.current[0];
      if (data0 && pathEl0) {
        const length = pathEl0.getTotalLength();
        const pStart = pathEl0.getPointAtLength(0);
        const pEnd   = pathEl0.getPointAtLength(length);
        const isBottomToTop = pStart.y > pEnd.y;
        
        // On récupère un point très proche du début (t = 0.005 pour éviter les bords tranchés)
        const t = isBottomToTop ? 0.005 : 0.995;
        const point = pathEl0.getPointAtLength(t * length);

        positions['start_city'] = {
          xPercent: (point.x / data0.width)  * 100,
          yPercent: (point.y / data0.height) * 100,
        };
      }

      setArticlePositions(positions);
    }, 150);
    return () => clearTimeout(timer);
  }, [pathsData, mapObjectsConfig]);
 
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 50,
    mass: 1,
    restDelta: 0.000001,
    restSpeed: 0.000001
  });
 
  const activeProgress = isMobile ? scrollYProgress : smoothProgress;
 
  useEffect(() => {
    const unsubscribe = activeProgress.on("change", (latest) => {
      if (pathsData.length === 0) return;

      const N = pathList.length;
      const globalPos = latest * N;
      const maxIndex = Math.max(0, N - 1);
      const index = Math.min(Math.floor(globalPos), maxIndex);
      const localProgress = globalPos - index;
 
      const pathEl = pathRefs.current[index];
      const data   = pathsData[index];
      if (!pathEl || !data) return;
 
      const length = pathEl.getTotalLength();
      const pStart = pathEl.getPointAtLength(0);
      const pEnd   = pathEl.getPointAtLength(length);
      const isDrawnBottomToTop = pStart.y > pEnd.y;
      const t = isDrawnBottomToTop ? localProgress : 1 - localProgress;
      const point = pathEl.getPointAtLength(t * length);
 
      setCyclistX(`${(point.x / data.width) * 100}%`);

      if (latest > 0.005) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }

      // --- NOUVEAU : DÉTECTION DE PROXIMITÉ ---
      const ZONE_DETECTION = 0.03; // Zone de sensibilité autour de l'article (tu peux ajuster)
      let foundId = null;
      
      for (let obj of mapObjectsConfig) {
        if (Math.abs(obj.globalPos - globalPos) <= ZONE_DETECTION) {
          foundId = obj.id;
          break; // On a trouvé un article proche, on s'arrête
        }
      }

      // Si l'article actif change, on déclenche une mise à jour React
      if (foundId !== activeArticleIdRef.current) {
        activeArticleIdRef.current = foundId;
        setActiveArticleId(foundId);
      }
      // ----------------------------------------
 
      const diffScroll = latest - latestProgress.current;
      if (diffScroll > 0.000001)       isMovingUpRef.current = true;
      else if (diffScroll < -0.000001) isMovingUpRef.current = false;
      const isMovingUp = isMovingUpRef.current;
      latestProgress.current = latest;
 
      const lp1 = Math.max(localProgress - 0.002, 0);
      const lp2 = Math.min(localProgress + 0.002, 1);
      const t1  = isDrawnBottomToTop ? lp1 : 1 - lp1;
      const t2  = isDrawnBottomToTop ? lp2 : 1 - lp2;
      const pt1 = pathEl.getPointAtLength(t1 * length);
      const pt2 = pathEl.getPointAtLength(t2 * length);
      const dx   = pt2.x - pt1.x;
      const dy   = pt2.y - pt1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const directionX = dist > 0 ? dx / dist : 0;
      const absDirX    = Math.abs(directionX);
      const SEUIL_STRAIGHT = 0.25;
      const SEUIL_DIAG     = 0.85;
 
      let newImage;
      if (absDirX < SEUIL_STRAIGHT) {
        newImage = isMovingUp ? posCyclist.up_straight : posCyclist.down_straight;
      } else if (directionX > 0) {
        newImage = isMovingUp
          ? (absDirX < SEUIL_DIAG ? posCyclist.up_right : posCyclist.right)
          : (absDirX < SEUIL_DIAG ? posCyclist.down_left : posCyclist.left);
      } else {
        newImage = isMovingUp
          ? (absDirX < SEUIL_DIAG ? posCyclist.up_left : posCyclist.left)
          : (absDirX < SEUIL_DIAG ? posCyclist.down_right : posCyclist.right);
      }
      if (newImage !== currentSvgPos.current) {
        currentSvgPos.current = newImage;
        setCyclistSvgPos(newImage);
      }
 
      const percentY = ((N - 1 - index) + (point.y / data.height)) / N * 100;
      pathY.set(`calc(85vh - ${percentY}%)`);
    });
 
    return () => unsubscribe();
  }, [activeProgress, pathsData, mapObjectsConfig]);
 
  return (
    <>
    {/* ── Flottant Filtres (Mobile) ── */}
    <div className="md:hidden fixed top-[88px] left-6 z-[900]">
      <button 
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto border border-gray-100 transition-transform active:scale-95"
      >
        {/* Trois petits points alignés */}
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
      </button>

      {isFilterOpen && (
        <div className="absolute top-14 left-0 bg-[#f7f7f7] rounded-[24px] p-5 shadow-2xl flex flex-col gap-4 w-64 pointer-events-auto origin-top-left border border-gray-100">
          {availableCategories.map(cat => {
            const isChecked = selectedCats.includes(cat);
            return (
              <label key={cat} className="flex items-center gap-4 cursor-pointer" onClick={(e) => {
                e.preventDefault();
                toggleCategory(cat);
              }}>
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${isChecked ? 'bg-[#F6E91E]' : 'bg-white'}`}
                >
                  {isChecked && (
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[15px] font-medium text-black leading-tight select-none">
                  {cat.replace('publique', 'public')} {/* Correction sémantique légère à l'affichage si besoin */}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>

    <div 
        ref={containerRef} 
      className={`relative transition-all duration-700 no-scrollbar`} 
        style={{ height: dynamicHeight }}
      >
      <div className="sticky top-0 mask-y-from-75% mask-y-to-90% h-screen overflow-hidden flex justify-center [perspective:1200px]" >
          <div
            className="xl:w-[50vw] relative w-[100vw] flex-none"
          style={{ transform: "rotateX(50deg)", transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="flex flex-col-reverse w-full will-change-transform"
              style={{ y: pathY, transformStyle: "preserve-3d"}}
            >
              {pathList.map((pathObj, i) => (
              <div
                key={i}
                className="relative w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={pathObj.svg}
                  className="w-full h-full object-cover -mt-1"
                  alt={`Path ${i}`}
                />

                {/* ── Marqueur de la ville de départ ── */}
                {/* ── Marqueur de la ville de départ ── */}
                  {i === 0 && articlePositions['start_city'] && (
                    <div
                      className="absolute z-10 flex flex-col items-center pointer-events-none"
                      style={{
                        left: `${articlePositions['start_city'].xPercent}%`,
                        top: `${articlePositions['start_city'].yPercent}%`,
                      // On pousse vers le bas (50%) pour que ça apparaisse en-dessous du bout du chemin
                      transform: "translate(-50%, 50%) rotateX(-50deg) translateZ(10px)",
                      transformOrigin: "top center",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    <div className="text-sm text-bold whitespace-nowrap flex items-center align-center justify-center gap-2 drop-shadow-lg mt-5" style={{position : "relative", left:"-6vw"}}>
                      <svg className="w-6 h-6 text-[#FF3B83]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                        {cityName}
                      </div>
                    </div>
                  )}

                  {pathsPointsData[i] && pathsPointsData[i].map((c, index) => {
                    const xPercent = (c.x / c.width) * 100;
                    const yPercent = (c.y / c.height) * 100;
                    return (  
                      <div
                      key={`${c.type}.-${i}-${index}`}
                        className="absolute z-20 pointer-events-none flex justify-center"
                        style={{
                        left: `${xPercent}%`,
                        top: `${yPercent}%`,
                          transform: "translate(-50%, -100%) rotateX(-50deg) translateZ(10px)",
                        transformOrigin: "bottom center",
                        transformStyle: "preserve-3d"
                        }}
                      >
                      <img 
                        src={c.svg} 
                        alt="element" 
                        className={`${c.svgStyle} w-auto object-contain drop-shadow-md`}
                      />
                      </div>
                    );
                  })}

                {mapObjectsConfig
                  .filter(obj => obj.pathIndex === i)
                  .map(obj => {
                    const pos = articlePositions[obj.id];
                    if (!pos) return null;
                    const isOnRightSide = pos.xPercent > 50;
    
                    const safeLeft = Math.max(10, Math.min(90, pos.xPercent + (isOnRightSide ? SignDecalage : -SignDecalage)));
                    
                    return (
                      <div
                        key={obj.id}
                        className={`absolute z-40 cursor-pointer flex flex-col items-center`}
                        style={{
                          left:            `${safeLeft}%`,
                          top:             `${pos.yPercent}%`,
                          transform:       "translate(-50%, -100%) rotateX(-50deg) translateZ(20px)",
                          transformStyle:  "preserve-3d",
                          transformOrigin: "center bottom",
                          willChange:      "transform",
                        }}
                      > 
                        

                        <AnimatePresence mode="wait">
                          {activeArticleId === obj.id ? (
                            <motion.div
                              key={`article-${obj.id}`}
                              initial={{ opacity: 0, scale: 0.8, x: isMobile && `calc(${50 - safeLeft}vw)`, y: isMobile && "-10vh"}}
                              animate={{ opacity: 1,  scale: 1, x: isMobile && `calc(${50 - safeLeft}vw)`, y: isMobile && "-10vh"}}
                              exit={{ opacity: 0, scale: 0.8, x: isMobile && `calc(${50 - safeLeft}vw)`,  y: isMobile && "-10vh"}}
                              transition={{ duration: 0.5, ease: "out" }}
                            >
                              <ArticlePreview articleData={obj.articleData} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`dot-${obj.id}`}
                              initial={{ opacity: 0, scale: 1, x: isMobile ? `calc(${50 - safeLeft}vw)` : 0, y: isMobile ? "-15vh" : -50 }}
                              animate={{ opacity: 1, scale: 0.25, y: 20, x: 0 }}
                              exit={{ opacity: 0, scale: 1, x: isMobile ? `calc(${50 - safeLeft}vw)` : 0, y: isMobile ? "-15vh" : -50}}
                              className="xl:w-16 xl:h-16 w-10 h-10 rounded-full"
                              style={{ backgroundColor: obj.articleData.category_color }}
                              transition={{ duration: 0.5 }}
                            />
                          )}
                        </AnimatePresence>
                        <img 
                          src={obj.svg} 
                          alt="element" 
                          className="xl:h-[8vh] xl:w-[8vw] h-[7vh] w-[7vw] object-contain drop-shadow-md" 
                        />
                      </div>
                    );
                  })}
                  {pathsData[i] && (
                  <svg
                    viewBox={`0 0 ${pathsData[i].width} ${pathsData[i].height}`}
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full z-10"
                  >
                    <path
                      ref={el => (pathRefs.current[i] = el)}
                      d={pathsData[i].d}
                      fill="none"
                      style={{ opacity: 0 }}
                    />
                    </svg>
                  )}
                  
                </div>
              ))}
            </motion.div>
 
          {/* VÉLO */}
            <motion.div
              className="absolute xl:bottom-[10vh] bottom-[12vh] z-50 xl:w-35 xl:h-35 w-20 h-20 pointer-events-none"
            style={{
              left:            cyclistX,
              transform:       "translateX(-50%) rotateX(-50deg)",
              transformOrigin: "bottom center"
            }}
            >
            <img
              src={cyclistSvgPos}
              className="w-full h-full object-contain relative z-10"
              alt="vélo"
            />
          </motion.div>
        </div>
      </div>
    </div>

    <AnimatePresence>
  {showScrollHint && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="absolute z-[900] flex flex-col items-center gap-3 pointer-events-none"
      style={{
        left: "20px",
        bottom: "14vh"
      }}
    >
      <span className="text-sm font-semibold bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm border border-gray-100">
        Scrollez vers le haut
      </span>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg border border-secondary"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
};
 
export default InfinitePath;