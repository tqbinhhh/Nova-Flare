import { getWeatherByCoords } from "./weatherApi.js";

// Dashboard Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initDashboardMap();
    
    // Simulate real-time updates
    setInterval(() => {
        updateStats();
    }, 60000); // Update every minute
});

// Initialize dashboard map
function initDashboardMap() {
    const dashboardMap = L.map('dashboard-map').setView([14.0583, 108.2772], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(dashboardMap);
    
    // Add heatmap
    const heatData = [
        [16.0678, 108.2208, 0.8],
        [10.8231, 106.6297, 0.6],
        [21.0285, 105.8542, 0.4],
        [11.9404, 108.4583, 0.7], // Đà Lạt
        [20.8449, 106.6881, 0.5]  // Hải Phòng
    ];
    
    L.heatLayer(heatData, {radius: 25}).addTo(dashboardMap);
}

// Update stats (simulated)
function updateStats() {
    // Simulate changing numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const current = parseInt(stat.textContent.replace(',', ''));
        const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
        const newValue = Math.max(0, current + change);
        stat.textContent = newValue.toLocaleString();
    });
    
    console.log('Dashboard stats updated');
}

// Export functions (simulated)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('export-btn')) {
        const type = e.target.textContent.includes('CSV') ? 'CSV' : 'GeoJSON';
        alert(`Đang xuất dữ liệu ${type}...`);
        
        // Simulate download
        setTimeout(() => {
            alert(`File ${type} đã được tải xuống!`);
        }, 2000);
    }
});

// SOS Button
const sosBtn = document.querySelector('.sos-btn');
sosBtn.addEventListener('click', () => {
    alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn.');
});

async function loadWeather() {
    try {
        const lat = 10.8231;   // Ho Chi Minh City
        const lon = 106.6297;
        
        const data = await getWeatherByCoords(lat, lon);

        console.log(data); // keep for debugging

        // Example DOM usage (adjust IDs if needed)
        document.getElementById("temperature").textContent =`${data.current.temp} °C`;

        document.getElementById("weather-desc").textContent = data.current.weather[0].description;
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

loadWeather();
