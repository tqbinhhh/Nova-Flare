if (data.current.wind_speed > 15) {
  // show storm warning
}

// Alert Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Simulate real-time updates
    setInterval(() => {
        updateAlerts();
    }, 30000); // Update every 30 seconds
});

// Update alerts (simulated)
function updateAlerts() {
    console.log('Checking for new alerts...');
    // In a real app, this would fetch from API
}

// City filter: show only alerts that match selected region (data-region)
function showCityBanner(city) {
    const banner = document.getElementById('city-banner');
    if (!banner) return;
    if (!city || city === 'ALL') {
        banner.textContent = 'Hiển thị cảnh báo: Toàn quốc';
        banner.classList.remove('text-red-400');
        banner.classList.add('text-slate-400');
    } else {
        banner.textContent = `Hiển thị cảnh báo cho TP. ${city}`;
        banner.classList.remove('text-slate-400');
        banner.classList.add('text-red-400');
    }
    banner.classList.remove('hidden');
}

function filterAlertsByCity(city) {
    const cards = document.querySelectorAll('.alert-card');
    cards.forEach(card => {
        const region = (card.dataset.region || '').toUpperCase();
        if (!city || city === 'ALL') {
            card.style.display = '';
            card.classList.remove('dim');
        } else if (region === city.toUpperCase()) {
            card.style.display = '';
            card.classList.remove('dim');
        } else {
            card.style.display = 'none';
            card.classList.add('dim');
        }
    });
    showCityBanner(city);
}

// init city filter control
document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city-filter');
    if (citySelect) {
        citySelect.addEventListener('change', (e) => {
            filterAlertsByCity(e.target.value);
        });
        // default to Đà Nẵng
        filterAlertsByCity(citySelect.value || 'ĐÀ NẴNG');
    }
});

// SOS Button
const sosBtn = document.querySelector('.sos-btn');
sosBtn.addEventListener('click', () => {
    alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn.');
});