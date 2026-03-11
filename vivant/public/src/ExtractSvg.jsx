import path from '/path.svg?raw'
import { useEffect, useRef, useState } from 'react';

const TestSvg = () => {

    const allPaths = [path]

    const extractPathInfo = (svgString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const pathElement = doc.getElementById("cyclist-path");
        const svgElement = doc.querySelector("svg");

        // On récupère la viewBox (ex: "0 0 6200 9442")
        const viewBox = svgElement?.getAttribute("viewBox")?.split(" ") || [0, 0, 1000, 1000];

        return {
            d: pathElement ? pathElement.getAttribute("d") : null,
            width: parseFloat(viewBox[2]), // 6200 dans ton cas
            height: parseFloat(viewBox[3]) // 9442 dans ton cas
        };
    };

    const [pathInfo, setPathInfo] = useState(null);
    const pathRef = useRef(null); // Pour pointer physiquement vers le chemin

    useEffect(() => {
        setPathInfo(extractPathInfo(allPaths[0]));
        console.log(pathInfo)
    }, []);

}
export default TestSvg
