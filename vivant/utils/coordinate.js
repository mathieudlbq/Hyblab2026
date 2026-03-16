/**
 * 
 * @param {string} city 
 * @returns {Object} {latitude, longitude}
 * 
 */
export async function getCoordinates(city) {

    try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${city}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features.length === 0) {
            console.error("Ville non trouvée");
            return null;
        }
        return data.features[0].geometry.coordinates;


    } catch (e) {
        console.error(e)
    }
}

// getCoordinates("Nantes")

export async function getCityByCoordinates(lat, lng) {
    try {
        const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features.length === 0) {
            console.error("Aucune ville trouvée pour ces coordonnées");
            return null;
        }
        return data.features[0].properties.city;

    } catch (e) {
        console.error(e)
    }
}

// getCityByCoordinates(47.20407866982331, -1.5630556302723189)