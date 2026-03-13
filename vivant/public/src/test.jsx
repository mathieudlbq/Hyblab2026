import { motion, useSpring, useMotionValue, useScroll } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useLocation } from 'react-router-dom';
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
import path3PointsRaw from './assets/paths/pathPoints/2.svg?raw'
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
  tree: Object.values(treeFiles),
  milestone: Object.values(milestoneFiles),
  sign: Object.values(signFiles)
};

console.log(elements)

const ESPACEMENT = 0.10; 
const NB_ARTICLES = 10;

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

const pathList = [
  dicoPaths.path1,
  dicoPaths.path1,
];
 
const InfinitePath = () => {
  const location = useLocation();
  const initialState = location.state || {};

  // ── État provenant du Router ──
  const [lat, setLat] = useState(initialState.lat ?? null);
  const [long, setLong] = useState(initialState.long ?? null);
  const [articles, setArticles] = useState(initialState.articles ?? []);

  const mapObjectsConfig = useMemo(() => {
    return articles.map((article, index) => {
      const globalPos = (index + 1) * ESPACEMENT;
      const pathIndex = Math.floor(globalPos) % pathList.length;
      const progress = globalPos % 1;
      return { 
        id: article.ID, 
        pathIndex, 
        progress, 
        articleData: {
          nom: article.Title,
          text: `${article.Date}${article._distanceFromCentre != null ? ` - 📍 à ${article._distanceFromCentre} km` : ""}`,
          image: article['Image Featured'],
          categories: article.Catégories,
          fullArticle: article // on garde l'objet entier au cas où
        }
      };
    });
  }, [articles]);

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
  const SignDecalage = 12
 
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
          type: "milestone"
        })),
        ...trees.map(tree => ({
          x: parseFloat(tree.getAttribute("cx")),
          y: parseFloat(tree.getAttribute("cy")),
          width: parseFloat(viewBox[2]),
          height: parseFloat(viewBox[3]),
          type: "tree"
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
      setArticlePositions(positions);
    }, 150);
    return () => clearTimeout(timer);
  }, [pathsData]);
 
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
  }, [activeProgress, pathsData]);
 
  return (
    <>
    <div 
      ref={containerRef} 
      className={`relative transition-all duration-700`} 
      style={{ height: dynamicHeight }}
    >
      <div className="sticky top-0 mask-y-from-75% mask-y-to-90% h-screen overflow-hidden flex justify-center [perspective:1200px]" >
        <div
          className="xl:w-[50vw] relative w-[100vw] flex-none"
          style={{ transform: "rotateX(50deg)", transformStyle: "preserve-3d" }}
        >
          {/*
            preserve-3d doit être propagé sur toute la chaîne :
            motion.div → div(path) → div(article)
            Sans ça, le translateZ de l'article est aplati (flat) et n'a aucun effet.
          */}
          <motion.div
            className="flex flex-col-reverse w-full will-change-transform"
            style={{ y: pathY, transformStyle: "preserve-3d" }}
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
                {pathsPointsData[i] && pathsPointsData[i].map((c, index) => {
                  // 1. On calcule la position en pourcentage pour que ce soit responsive
                  const xPercent = (c.x / c.width) * 100;
                  const yPercent = (c.y / c.height) * 100;
                  
                  // 2. On pioche un arbre dans ton tableau (on boucle avec le modulo s'il y a plus de points que d'arbres)
                  const treeSvg = elements.tree[index % elements.tree.length];
                  const mileSvg = elements.milestone[index % elements.milestone.length];

                  return (
                    <div
                      key={`${c.type}.-${i}-${index}`}
                      className="absolute z-20 pointer-events-none flex justify-center"
                      style={{
                        left: `${xPercent}%`,
                        top: `${yPercent}%`,
                        // On redresse l'arbre en 3D pour qu'il tienne debout sur la route !
                        transform: "translate(-50%, -100%) rotateX(-50deg) translateZ(10px)",
                        transformOrigin: "bottom center",
                        transformStyle: "preserve-3d"
                      }}
                    >
                      <img 
                        src={c.type === "tree" ? treeSvg : mileSvg} 
                        alt="element" 
                        className="xl:h-[40%] xl:w-[40%] w-[15vw] h-[15vh] object-contain drop-shadow-md" // Ajuste w-24 h-24 selon la taille voulue
                      />
                    </div>
                  );
                })}

                {mapObjectsConfig
                  .filter(obj => obj.pathIndex === i)
                  .map(obj => {
                    const pos = articlePositions[obj.id];
                    const signSvg = elements.sign[obj.id % elements.sign.length];
                    if (!pos) return null;
                    const isOnRightSide = pos.xPercent > 50;
    
                    // On calcule une position "bridée" pour éviter de coller aux bords de la div
                    // On garde une marge de sécurité (ex: 10% de chaque côté)
                    const safeLeft = Math.max(10, Math.min(90, pos.xPercent + (isOnRightSide ? SignDecalage : -SignDecalage)));
                    
                    return (
                      <div
                        key={obj.id}
                        className="absolute z-40 cursor-pointer flex flex-col items-center gap-20"
                        style={{
                          left:            `${safeLeft}%`,
                          top:             `${pos.yPercent}%`,
                          transform:       "translate(-50%, -100%) rotateX(-50deg) translateZ(40px)",
                          transformStyle:  "preserve-3d",
                          transformOrigin: "center bottom",
                          willChange:      "transform",
                        }}
                      > 
                        

                        <ArticlePreview articleData={obj.articleData} />

                        <img 
                          src={signSvg} 
                          alt="element" 
                          className="xl:h-[7vh] xl:w-[7vw] w-[7vw] h-[7vh] object-contain drop-shadow-md" // Ajuste w-24 h-24 selon la taille voulue
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
            className="absolute xl:bottom-[8.5vh] bottom-[10vh] z-50 xl:w-35 xl:h-35 w-20 h-20 pointer-events-none"
            style={{
              left:            cyclistX,
              transform:       "translateX(-50%) translateZ(20px) rotateX(-50deg)",
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
    </>
  );
};
 
export default InfinitePath;