import { motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";

// Imports des SVGs pour extraction de données (raw) et pour affichage (URL)
import path1Raw from './assets/paths/1.svg?raw';
import path2Raw from './assets/paths/2.svg?raw';
import path3Raw from './assets/paths/3.svg?raw';
import path1Url from './assets/paths/1.svg';
import path2Url from './assets/paths/2.svg';
import path3Url from './assets/paths/3.svg';

import up_straight from './assets/mr_patate/up_straight.svg';
import up_left from     './assets/mr_patate/up_left.svg';
import up_right from    './assets/mr_patate/up_right.svg';
import down_straight from './assets/mr_patate/down_straight.svg';
import down_left from   './assets/mr_patate/down_left.svg';
import down_right from  './assets/mr_patate/down_right.svg';
import right from       './assets/mr_patate/right.svg';
import left from        './assets/mr_patate/left.svg';

const dicoPaths = {
  path1: { raw: path1Raw, svg: path1Url },
  path2: { raw: path2Raw, svg: path2Url },
  path3: { raw: path3Raw, svg: path3Url }
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
  dicoPaths.path2,
  dicoPaths.path3,
  dicoPaths.path2,
  dicoPaths.path1,
  dicoPaths.path3
];

const InfinitePath = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathRefs = useRef([]);
  const [pathsData, setPathsData] = useState([]);

  const [cyclistX, setCyclistX] = useState("50%");
  const pathY = useMotionValue("calc(85vh - 100%)");

  // NOUVEAU : isMovingUpRef pour "vérouiller" le sens quand le spring ralentit trop
  const latestProgress = useRef(0);
  const isMovingUpRef = useRef(true); 
  const currentSvgPos = useRef(posCyclist.up_right);
  const [cyclistSvgPos, setCyclistSvgPos] = useState(posCyclist.up_right);

  const SPEED_DESKTOP = 5000;
  const SPEED_MOBILE = 2500;

  const dynamicHeight = useMemo(() => {
    const speed = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
    const multiplier = Math.max(1, pathList.length / 2);
    return `${multiplier * speed}vh`;
  }, [isMobile, pathList.length]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const parser = new DOMParser();
    const extracted = pathList.map(pathObj => {
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
    setPathsData(extracted);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

      const totalSegments = pathList.length;
      const globalPos = latest * totalSegments;
      const maxIndex = Math.max(0, pathList.length - 1);
      const index = Math.min(Math.floor(globalPos), maxIndex);
      const localProgress = globalPos - index;

      const pathEl = pathRefs.current[index];
      const data = pathsData[index];
      if (!pathEl || !data) return;

      const length = pathEl.getTotalLength();

      // Détecter le sens du path et forcer la lecture bas → haut
      const pStart = pathEl.getPointAtLength(0);
      const pEnd = pathEl.getPointAtLength(length);
      const isDrawnBottomToTop = pStart.y > pEnd.y;
      const t = isDrawnBottomToTop ? localProgress : 1 - localProgress;

      const point = pathEl.getPointAtLength(t * length);

      // 1. POSITION X DU CYCLISTE
      const xPercent = (point.x / data.width) * 100;
      setCyclistX(`${xPercent}%`);

      // 2. GESTION DU SCROLL HAUT/BAS (Ultra sensible)
      const diffScroll = latest - latestProgress.current;
      
      // On baisse le seuil drastiquement (1e-6) : 
      // Il captera les scrolls lents instantanément, mais ignorera les micro-erreurs mathématiques.
      if (diffScroll > 0.000001) {
        isMovingUpRef.current = true;
      } else if (diffScroll < -0.000001) {
        isMovingUpRef.current = false;
      }
      
      const isMovingUp = isMovingUpRef.current;
      latestProgress.current = latest;

      // 3. LA MAGIE GÉOMÉTRIQUE : Calculer l'angle RÉEL du chemin
      const lp1 = Math.max(localProgress - 0.002, 0);
      const lp2 = Math.min(localProgress + 0.002, 1);
      
      const t1 = isDrawnBottomToTop ? lp1 : 1 - lp1;
      const t2 = isDrawnBottomToTop ? lp2 : 1 - lp2;
      
      const pt1 = pathEl.getPointAtLength(t1 * length);
      const pt2 = pathEl.getPointAtLength(t2 * length);
      
      const dx = pt2.x - pt1.x;
      const dy = pt2.y - pt1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // directionX représente l'inclinaison physique du chemin (> 0 = droite, < 0 = gauche)
      let directionX = dist > 0 ? dx / dist : 0;
      const absDirX = Math.abs(directionX);

      // Seuils d'angle (0.25 = léger virage, 0.6 = virage fort)
      const SEUIL_STRAIGHT = 0.25; 
      const SEUIL_DIAG = 0.85;      

      let newImage;
      
      if (absDirX < SEUIL_STRAIGHT) {
        // Ligne droite verticale
        newImage = isMovingUp ? posCyclist.up_straight : posCyclist.down_straight;
      } else if (directionX > 0) {
        // Le chemin monte vers la DROITE ( ↗ )
        if (isMovingUp) {
          newImage = absDirX < SEUIL_DIAG ? posCyclist.up_right : posCyclist.right;
        } else {
          // Si on recule sur ce chemin, on va vers le BAS à GAUCHE ( ↙ )
          newImage = absDirX < SEUIL_DIAG ? posCyclist.down_left : posCyclist.left;
        }
      } else {
        // Le chemin monte vers la GAUCHE ( ↖ )
        if (isMovingUp) {
          newImage = absDirX < SEUIL_DIAG ? posCyclist.up_left : posCyclist.left;
        } else {
          // Si on recule sur ce chemin, on va vers le BAS à DROITE ( ↘ )
          newImage = absDirX < SEUIL_DIAG ? posCyclist.down_right : posCyclist.right;
        }
      }

      // Mise à jour de React SEULEMENT si on a vraiment changé d'image
      if (newImage !== currentSvgPos.current) {
        currentSvgPos.current = newImage;
        setCyclistSvgPos(newImage);
      }

      // 4. POSITION Y DU DÉCOR
      const N = pathList.length;
      const percentY = ((N - 1 - index) + (point.y / data.height)) / N * 100;
      pathY.set(`calc(85vh - ${percentY}%)`);
    });

    return () => unsubscribe();
  }, [activeProgress, pathsData, pathList.length]);

  return (
    <div ref={containerRef} className="relative" style={{ height: dynamicHeight }}>
      <div className="sticky top-0 mask-y-from-75% mask-y-to-90% h-screen overflow-hidden flex justify-center [perspective:1200px]">
        <div
          className="xl:w-[50vw] relative w-[110vw] flex-none"
          style={{ transform: "rotateX(50deg)", transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="flex flex-col-reverse w-full will-change-transform"
            style={{ y: pathY }}
          >
            {pathList.map((pathObj, i) => (
              <div key={i} className="relative w-full">
                <img
                  src={pathObj.svg}
                  className="w-full h-full object-cover -mt-1"
                  alt={`Path ${i}`}
                />
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
            className="absolute bottom-[8.5%] z-50 xl:w-35 xl:h-35 w-20 h-20 pointer-events-none"
            style={{
              left: cyclistX,
              transform: "translateX(-50%) translateZ(20px) rotateX(-50deg)",
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
  );
};

export default InfinitePath;