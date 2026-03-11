  import { motion, useTransform, useScroll, useSpring } from "framer-motion";
  import { useRef } from "react";

  const images = [
    "/Path 1.svg",
    "/Path 2.svg",
    "/Path 3.svg",
    "/Path 1.svg",
    "/Path 2.svg",
    "/Path 3.svg",
  ];

  // On triple pour garantir qu'il y a toujours du contenu avant et après pendant le "saut"
  const tripleImages = [...images];

  const InfinitePath = () => {

    const containerRef = useRef(null);

    
    // 2. On récupère la progression du scroll (0 à 1)
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 100, // plus on augmente plus c'est réactif
      damping: 30,    // plus on augmente plus ça "glisse"
      mass: 3,
      restDelta: 0.000001,
      restSpeed: 0.000001
    });

    const y = useTransform(smoothProgress, [0, 1], ["-50%", "0%"]);
    return (
      <div ref={containerRef} className="relative h-[5000vh] ">

        <div className="sticky top-0 mask-y-from-75% mask-y-to-90% h-screen w- overflow-hidden flex justify-center [perspective:1200px]">
          
          <div 
            className="xl:w-[50vw] relative w-[110vw] flex-none" 
            style={{ 
              transform: "rotateX(50deg)",
              transformStyle: "preserve-3d" 
            }}
          >
            
            <motion.div 
              className="flex flex-col w-full will-change-transform"
              initial={{ y: "-50%" }}
              style={{ y }}
              transition={{
                duration: 20, // Ajuste pour la vitesse du chemin
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {tripleImages.map((src, index) => (
                <div 
                  key={index} 
                  className="w-full h-full -mt-1"
                >
                  <img 
                    src={src} 
                    alt="Segment du chemin" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </motion.div>
          </div>
          
        </div>
      </div>
    );
  };

  export default InfinitePath;