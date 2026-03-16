import { motion, useSpring, useMotionValue, useScroll, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { Link, useLocation } from 'react-router-dom';
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
import up_left from './assets/mr_patate/up_left.svg';
import up_right from './assets/mr_patate/up_right.svg';
import down_straight from './assets/mr_patate/down_straight.svg';
import down_left from './assets/mr_patate/down_left.svg';
import down_right from './assets/mr_patate/down_right.svg';
import right from './assets/mr_patate/right.svg';
import left from './assets/mr_patate/left.svg';
import dormir from './assets/mr_patate/dormir.svg';

const treeFiles = import.meta.glob('./assets/elements/tree/*.svg', { eager: true, import: 'default' });
const milestoneFiles = import.meta.glob('./assets/elements/milestone/*.svg', { eager: true, import: 'default' });
const signFiles = import.meta.glob('./assets/elements/sign/*.svg', { eager: true, import: 'default' });

const ESPACEMENT = 0.20;
const OFFSET_DEPART = 0.15; // Décale le premier article pour ne pas qu'il soit au tout début
export const NB_ARTICLES = 10;

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

const elements = {
  tree: { svg: Object.values(treeFiles), style: 'xl:scale-[95%] scale-[60%] origin-bottom' },
  milestone: { svg: Object.values(milestoneFiles), style: 'xl:h-[9vh] h-[5vh] origin-bottom' },
  sign: {
    svg: Object.values(signFiles), dotPos: [
      { x: 91, y: 15 }, //sign1
      { x: 91, y: 15 }, //sign2
      { x: 73, y: 20 }, //sign3
      { x: 83, y: 17 }, //sign4
      { x: 88, y: 38 }, //sign5
    ]
  }
};

const pathOptions = Object.values(dicoPaths);

const CategoryList = {
  "Entrepreneuriat": "#DED491",
  "Collectifs": "#DE391C",
  "Service publique": "#BA0650",
  "Initiative personnelle/quotidienne": "#FFCBC1"
};

const PathComponent = () => {
  const location = useLocation();
  const initialState = location.state || {};

  const nbArticles = initialState.nbArticles ?? NB_ARTICLES;

  const currentPathList = useMemo(() => {
    const calculatedNbPath = Math.ceil(OFFSET_DEPART + (nbArticles * ESPACEMENT));
    return Array.from({ length: calculatedNbPath }, () =>
      pathOptions[Math.floor(Math.random() * pathOptions.length)]
    );
  }, [nbArticles]);

  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const SPEED_DESKTOP = Math.max(2000, 5000 - (nbArticles - 10) * 150);
  const SPEED_MOBILE = Math.max(2000, 4000 - (nbArticles - 10) * 150);

  const dynamicHeight = useMemo(() => {
    const speed = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
    const multiplier = Math.max(1, currentPathList.length / 2);
    return `${multiplier * speed}vh`;
  }, [isMobile, SPEED_DESKTOP, SPEED_MOBILE, currentPathList.length]);





  // ── État provenant du Router ──
  const [lat, setLat] = useState(initialState.lat ?? null);
  const [long, setLong] = useState(initialState.long ?? null);
  const [allArticles, setAllArticles] = useState(initialState.allArticles ?? []);
  const cityName = initialState.name || "Point de départ";

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
      closestArticles = findNearestArticles(filteredAll, { latitude: lat, longitude: long }, nbArticles);
    } else {
      closestArticles = filteredAll.slice(0, nbArticles);
    }

    const signLength = elements.sign.svg.length

    return closestArticles.map((article, index) => {
      const globalPos = OFFSET_DEPART + (index * ESPACEMENT);
      const pathIndex = Math.floor(globalPos) % currentPathList.length;
      const progress = globalPos % 1;
      const signIdx = Math.floor(Math.random() * signLength)
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
        svg: elements.sign.svg[signIdx],
        dotPos: elements.sign.dotPos[signIdx]
      };
    });
  }, [allArticles, selectedCats, lat, long]);

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


  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const parser = new DOMParser();
    const extractedPaths = currentPathList.map(pathObj => {
      const doc = parser.parseFromString(pathObj.raw, "image/svg+xml");
      const path = doc.getElementById("cyclist-path");
      const svgTag = doc.querySelector("svg");
      const viewBox = svgTag?.getAttribute("viewBox")?.split(" ") || [0, 0, 767.25, 7337.6];
      return {
        d: path?.getAttribute("d"),
        width: parseFloat(viewBox[2]),
        height: parseFloat(viewBox[3])
      };
    });

    const milestoneLength = elements.milestone.svg.length
    const treeLength = elements.tree.svg.length

    const extractedPoints = currentPathList.map(pathObj => {
      const doc = parser.parseFromString(pathObj.pointsRaw, "image/svg+xml");
      const trees = Array.from(doc.getElementsByClassName("cls-1"))
      const milestones = Array.from(doc.getElementsByClassName("cls-3"))
      const svgTag = doc.querySelector("svg");
      const viewBox = svgTag?.getAttribute("viewBox")?.split(" ") || [0, 0, 767.25, 7337.6];

      return [
        ...milestones.map(mile => ({
          type: 'milestone', // Différenciation de la borne
          x: parseFloat(mile.getAttribute("cx")),
          y: parseFloat(mile.getAttribute("cy")),
          width: parseFloat(viewBox[2]),
          height: parseFloat(viewBox[3]),
          svg: elements.milestone.svg[Math.floor(Math.random() * milestoneLength)],
          svgStyle: elements.milestone.style
        })),
        ...trees.map(tree => ({
          type: 'tree', // Différenciation de l'arbre
          x: parseFloat(tree.getAttribute("cx")),
          y: parseFloat(tree.getAttribute("cy")),
          width: parseFloat(viewBox[2]),
          height: parseFloat(viewBox[3]),
          svg: elements.tree.svg[Math.floor(Math.random() * treeLength)],
          svgStyle: elements.tree.style
        }))
      ];
    });
    setPathsData(extractedPaths)
    setPathsPointsData(extractedPoints)

    return () => window.removeEventListener("resize", checkMobile);
  }, [currentPathList]);

  useEffect(() => {
    if (pathsData.length === 0) return;
    const timer = setTimeout(() => {
      const positions = {};
      mapObjectsConfig.forEach(obj => {
        const pathEl = pathRefs.current[obj.pathIndex];
        const data = pathsData[obj.pathIndex];
        if (!pathEl || !data) return;

        const length = pathEl.getTotalLength();
        const pStart = pathEl.getPointAtLength(0);
        const pEnd = pathEl.getPointAtLength(length);
        const isBottomToTop = pStart.y > pEnd.y;
        const t = isBottomToTop ? obj.progress : 1 - obj.progress;
        const point = pathEl.getPointAtLength(t * length);

        positions[obj.id] = {
          xPercent: (point.x / data.width) * 100,
          yPercent: (point.y / data.height) * 100,
        };
      });

      // ── Positionnement de la ville de départ (au tout début du premier chemin) ──
      const data0 = pathsData[0];
      const pathEl0 = pathRefs.current[0];
      if (data0 && pathEl0) {
        const length = pathEl0.getTotalLength();
        const pStart = pathEl0.getPointAtLength(0);
        const pEnd = pathEl0.getPointAtLength(length);
        const isBottomToTop = pStart.y > pEnd.y;

        // On récupère un point très proche du début (t = 0.005 pour éviter les bords tranchés)
        const t = isBottomToTop ? 0.005 : 0.995;
        const point = pathEl0.getPointAtLength(t * length);

        positions['start_city'] = {
          xPercent: (point.x / data0.width) * 100,
          yPercent: (point.y / data0.height) * 100,
        };
      }

      // ── Positionnement de la fin du chemin ──
      const lastIndex = pathsData.length - 1;
      const dataLast = pathsData[lastIndex];
      const pathElLast = pathRefs.current[lastIndex];
      if (dataLast && pathElLast) {
        const length = pathElLast.getTotalLength();
        const pStart = pathElLast.getPointAtLength(0);
        const pEnd = pathElLast.getPointAtLength(length);
        const isBottomToTop = pStart.y > pEnd.y;

        // On récupère un point très proche de la fin
        const t = isBottomToTop ? 0.995 : 0.005;
        const point = pathElLast.getPointAtLength(t * length);

        positions['end_point'] = {
          xPercent: (point.x / dataLast.width) * 100,
          yPercent: (point.y / dataLast.height) * 100,
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

  const smoothProgress = useSpring(1, {
    stiffness: 100,
    damping: 50,
    mass: 1,
    restDelta: 0.000001,
    restSpeed: 0.000001
  });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => smoothProgress.set(v));
  }, [scrollYProgress]);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setShowScrollHint(latest >= 0.995);
    });
  }, [scrollYProgress]);


  const activeProgress = isMobile ? scrollYProgress : smoothProgress;

  useEffect(() => {
    const unsubscribe = activeProgress.on("change", (latest) => {
      if (pathsData.length === 0) return;

      const N = currentPathList.length;
      const globalPos = (1 - latest) * N;
      const maxIndex = Math.max(0, N - 1);
      const index = Math.min(Math.floor(globalPos), maxIndex);
      const localProgress = globalPos - index;

      const pathEl = pathRefs.current[index];
      const data = pathsData[index];
      if (!pathEl || !data) return;

      const length = pathEl.getTotalLength();
      const pStart = pathEl.getPointAtLength(0);
      const pEnd = pathEl.getPointAtLength(length);
      const isDrawnBottomToTop = pStart.y > pEnd.y;
      const t = isDrawnBottomToTop ? localProgress : 1 - localProgress;
      const point = pathEl.getPointAtLength(t * length);

      setCyclistX(`${(point.x / data.width) * 100}%`);

      if (latest < 0.995) {
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
      if (diffScroll < -0.000001) isMovingUpRef.current = true;
      else if (diffScroll > 0.000001) isMovingUpRef.current = false;
      const isMovingUp = isMovingUpRef.current;
      latestProgress.current = latest;

      const lp1 = Math.max(localProgress - 0.002, 0);
      const lp2 = Math.min(localProgress + 0.002, 1);
      const t1 = isDrawnBottomToTop ? lp1 : 1 - lp1;
      const t2 = isDrawnBottomToTop ? lp2 : 1 - lp2;
      const pt1 = pathEl.getPointAtLength(t1 * length);
      const pt2 = pathEl.getPointAtLength(t2 * length);
      const dx = pt2.x - pt1.x;
      const dy = pt2.y - pt1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const directionX = dist > 0 ? dx / dist : 0;
      const absDirX = Math.abs(directionX);
      const SEUIL_STRAIGHT = 0.25;
      const SEUIL_DIAG = 0.85;

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

  const getMilestoneDistance = (pathIndex, yPercent) => {
    const localProgress = 1 - (yPercent / 100);
    const milestoneGlobalPos = pathIndex + localProgress;

    let prevArticle = mapObjectsConfig[0];
    let nextArticle = mapObjectsConfig[mapObjectsConfig.length - 1];

    for (let obj of mapObjectsConfig) {
      if (obj.globalPos <= milestoneGlobalPos) prevArticle = obj;
      if (obj.globalPos >= milestoneGlobalPos) {
        nextArticle = obj;
        break;
      }
    }
    const dist1 = parseFloat(prevArticle.articleData.fullArticle._distanceFromCentre) || 0;
    const dist2 = parseFloat(nextArticle.articleData.fullArticle._distanceFromCentre) || 0;
    const pos1 = prevArticle.globalPos;
    const pos2 = nextArticle.globalPos;

    const formatDistance = (dist) => {
      const objDist = (dist < 1) ? { num: Math.round(dist * 1000), unit: "m" } : { num: parseFloat(dist).toFixed(1), unit: "km" }
      return (<><span className="milestone-font">{objDist.num}</span><span className="milestone-font xl:-mt-[0.8vh] -mt-[0.4vh]">{objDist.unit}</span></>)
    }

    if (pos1 === pos2) return formatDistance(dist1);

    const ratio = (milestoneGlobalPos - pos1) / (pos2 - pos1);
    const finalDist = Math.max(0, dist1 + ratio * (dist2 - dist1));

    return formatDistance(finalDist);
  };



  return (
    <div className="relative">
      {/* ── Flottant Filtres (Mobile) ── */}
      <div className="md:hidden fixed top-[88px] left-6 z-[9999]">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto border border-gray-100 transition-transform active:scale-95"
        >
          {/* Trois petits points alignés */}
          <div className="flex gap-1">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="w-1.5 h-1.5 bg-black rounded-full"></div>
            ))}
          </div>
        </button>

        {isFilterOpen && (
          <div className="absolute top-14 left-0 bg-[#f7f7f7] rounded-[24px] p-5 shadow-2xl flex flex-col gap-4 w-64 pointer-events-auto origin-top-left border border-gray-100">
            {Object.entries(CategoryList).map(([cat, color]) => {
              const isChecked = selectedCats.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCategory(cat);
                  }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm" style={{ backgroundColor: isChecked ? color : 'white' }} >
                    {isChecked && (
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[15px] font-medium text-black leading-tight select-none">
                    {cat.replace('publique', 'public')}
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
              style={{ y: pathY, transformStyle: "preserve-3d" }}
            >
              {currentPathList.map((pathObj, i) => (
                <div
                  key={i}
                  className="relative w-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    src={pathObj.svg}
                    className="w-full h-full block -mt-1"
                    alt={`Path ${i}`}
                  />
                  {i === 0 && articlePositions['start_city'] && (
                    <div
                      className="absolute z-10 flex flex-col items-center pointer-events-none"
                      style={{
                        left: `${articlePositions['start_city'].xPercent}%`,
                        top: `${articlePositions['start_city'].yPercent}%`,
                        transform: "translate(-50%, 50%) rotateX(-50deg) translateZ(10px)",
                        transformOrigin: "top center",
                        transformStyle: "preserve-3d"
                      }}
                    >
                      <div className="flex items-center justify-center gap-2 drop-shadow-lg w-full xl:m-5 m-2.5">

                        <div className="xl:p-2.5 p-1.5 rounded-full items-center justify-center bg-[#F6E91E] flex hover:bg-[#E5D813] shrink-0 shadow-sm">
                          <svg className="xl:w-[1.5vw] xl:h-[1.5vw] w-[4vw] h-[4vw] text-black drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </div>

                        <div className="xl:text-sm text-[8px] font-extrabold whitespace-nowrap">
                          {cityName}
                        </div>

                      </div>
                    </div>
                  )}

                  {pathsPointsData[i] && pathsPointsData[i].map((c, index) => {
                    const xPercent = (c.x / c.width) * 100;
                    const yPercent = (c.y / c.height) * 100;
                    return (
                      <div
                        key={`${c.type}-${i}-${index}`}
                        className="absolute z-20 pointer-events-none flex justify-center"
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          transform: "translate(-50%, -100%) rotateX(-50deg) translateZ(10px)",
                          transformOrigin: "bottom center",
                          transformStyle: "preserve-3d"
                        }}
                      >

                        {c.type === 'milestone' && (
                          <div
                            className="absolute z-30 flex flex-col items-center font-extrabold text-[0.7vh] xl:text-[1.25vh] xl:bottom-[1.9vh] bottom-[1vh]"
                          >
                            {getMilestoneDistance(i, yPercent)}
                          </div>
                        )}
                        <img
                          src={c.svg}
                          alt={c.type}
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
                          className={`absolute z-40 flex flex-col items-center`}
                          style={{
                            left: `${safeLeft}%`,
                            top: `${pos.yPercent}%`,
                            transform: "translate(-50%, -100%) rotateX(-50deg) translateZ(20px)",
                            transformStyle: "preserve-3d",
                            transformOrigin: "center bottom",
                            willChange: "transform",
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {activeArticleId === obj.id ? (
                              <motion.div
                                key={`article-${obj.id}`}
                                initial={{ opacity: 0.3, scale: 0.5, x: isMobile ? `calc(${50 - safeLeft}vw)` : 0, y: isMobile ? "-10vh" : 0 }}
                                animate={{ opacity: 1, scale: 1, x: isMobile ? `calc(${50 - safeLeft}vw)` : 0, y: isMobile ? "-10vh" : 0 }}
                                exit={{ opacity: 0.3, scale: 0.5, x: isMobile ? `calc(${50 - safeLeft}vw)` : 0, y: isMobile ? "-10vh" : 0 }}
                                transition={{ duration: 0.5, ease: "out" }}
                              >
                                <ArticlePreview articleData={obj.articleData} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key={`dot-${obj.id}`}
                                initial={{ opacity: 0.3, scale: 1, x: isMobile ? `calc(${50 - safeLeft}vw)` : -50, y: isMobile ? "-20vh" : -100 }}
                                animate={{ opacity: 1, scale: 0.25, x: "-50%", y: "-50%" }}
                                exit={{ opacity: 0.3, scale: 1, x: isMobile ? `calc(${50 - safeLeft}vw)` : -50, y: isMobile ? "-20vh" : -100 }}
                                className="xl:w-16 xl:h-16 w-10 h-10 rounded-full z-99 border-7 border-white absolute"
                                style={{
                                  backgroundColor: obj.articleData.category_color,
                                  left: `${obj.dotPos.x}%`,
                                  top: `${obj.dotPos.y}%`,
                                }}
                                transition={{ duration: isMobile ? 1 : 0.33 }}
                              />
                            )}
                          </AnimatePresence>
                          <img
                            src={obj.svg}
                            alt="sign"
                            className="xl:w-[4vw] h-auto w-[7vw] object-contain drop-shadow-sm"
                          />
                        </div>
                      );
                    })}
                  {i === currentPathList.length - 1 && articlePositions['end_point'] && (
                    <motion.div
                      className="z-99 absolute flex flex-col items-center justify-center gap-1.5"
                      style={{
                        left: `${articlePositions['end_point'].xPercent}%`,
                        top: `${articlePositions['end_point'].yPercent}%`,
                        transform: "translate(-50%, -100%) rotateX(-50deg)",
                        transformStyle: "preserve-3d",
                        transformOrigin: "bottom center",
                      }}
                    >
                      <img
                        src={dormir}
                        alt="dormir"
                        className="xl:w-[20vw] xl:h-[20vw] w-[100vw] h-auto drop-shadow-sm"
                      />
                      <Link to="/home"><button className="btn btn-secondary text-primary rounded-[8px]">
                        Retour au menu
                      </button>
                      </Link>
                    </motion.div>
                  )}
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
                left: cyclistX,
                transform: "translateX(-50%) rotateX(-50deg)",
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
            className="absolute z-[9999] flex flex-col items-center gap-3 pointer-events-none"
            style={{
              left: "20px",
              bottom: "14vh"
            }}
          >
            <span className="text-sm font-semibold bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm border border-gray-100">
              Scrollez vers le bas
            </span>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg border border-secondary"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PathComponent;