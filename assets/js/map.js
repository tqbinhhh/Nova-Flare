import { getWeatherByCoords } from './weatherApi.js';

let map;
let userMarker;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMap();
    initGeolocation();
    initSOS();
});

function initMap() {
    console.log('Initializing map...');
    try {
        // Default view (HCMC) if geolocation fails
        map = L.map('map').setView([10.8231, 106.6297], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add initial heatmap data
        const heatData = [
            [16.0678, 108.2208, 0.8], // Đà Nẵng
            [10.8231, 106.6297, 0.6], // TP.HCM
            [21.0285, 105.8542, 0.4]  // Hà Nội
        ];
        L.heatLayer(heatData, { radius: 25 }).addTo(map);

        // Add markers for flood areas (severity-coded)
        const floodAreas = [
            { lat: 16.0678, lng: 108.2208, title: 'Đà Nẵng - Ngập úng cầu sông Hàn', severity: 'high' },
            { lat: 10.8231, lng: 106.6297, title: 'TP.HCM - Ngập úng quận 1', severity: 'medium' },
            { lat: 21.0285, lng: 105.8542, title: 'Hà Nội - Ngập úng cầu Long Biên', severity: 'low' }
        ];

        const severityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

        floodAreas.forEach(area => {
            const color = severityColors[area.severity] || '#ef4444';
            const iconHtml = `<div class="map-marker" style="background:${color}; box-shadow:0 0 10px ${color}55;"></div>`;
            const markerIcon = L.divIcon({
                className: 'flood-marker',
                html: iconHtml,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                popupAnchor: [0, -8]
            });

            L.marker([area.lat, area.lng], { icon: markerIcon })
                .addTo(map)
                .bindPopup(`<b>${area.title}</b><br><em>Mức: ${area.severity === 'high' ? 'Lớn' : area.severity === 'medium' ? 'Vừa' : 'Thấp'}</em><br>Cảnh báo ngập lụt!`);
        });

        // Weather on click
        map.on("click", async function (e) {
            const { lat, lng } = e.latlng;
            try {
                const data = await getWeatherByCoords(lat, lng);
                const popupContent = `
                    <div class="p-2">
                        <strong class="text-blue-500">Thông tin thời tiết</strong><br>
                        🌡 Nhiệt độ: ${data.current.temp} °C<br>
                        🌥 ${data.current.weather[0].description}<br>
                        💨 Gió: ${data.current.wind_speed} m/s
                    </div>
                `;
                L.popup().setLatLng([lat, lng]).setContent(popupContent).openOn(map);
            } catch (error) {
                console.error("Weather fetch failed:", error);
            }
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        handleMapError();
    }
}

function initGeolocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    // Real-time tracking using watchPosition
    navigator.geolocation.watchPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`New position: ${latitude}, ${longitude}`);

            // Update or create user marker
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: '<div class="pulse-ring"></div><div class="dot"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    popupAnchor: [0, -10]
                });

                userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
                userMarker.bindPopup("Vị trí của bạn").openPopup();

                // Only auto-center on first find to avoid annoying the user during interaction
                map.setView([latitude, longitude], 15);
            }

            // Sync weather for current location (optional / background)
            try {
                const weather = await getWeatherByCoords(latitude, longitude);
                console.log("Current location weather:", weather);
            } catch (e) { }
        },
        (error) => {
            console.warn(`Geolocation error (${error.code}): ${error.message}`);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

function initSOS() {
    const sosBtn = document.querySelector('.sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn qua GPS.');
        });
    }
}

function handleMapError() {
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
        mapDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full bg-slate-900/80 rounded-3xl text-slate-500">
                <i data-lucide="map-off" class="w-12 h-12 mb-4"></i>
                <p class="font-bold">Không thể tải bản đồ</p>
                <p class="text-xs">Vui lòng kiểm tra kết nối mạng và quyền định vị</p>
            </div>
        `;
        lucide.createIcons();
    }
}
