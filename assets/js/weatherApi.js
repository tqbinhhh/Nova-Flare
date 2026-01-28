const API_KEY = "4bd0abfe45f35c376287784817b48c67";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// FREE & SAFE endpoint
export async function getWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    return response.json();
}
