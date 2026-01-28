// Khởi tạo các icon Lucide
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.textContent.toLowerCase().replace(' ', '-');
            showSection(target);
            
            // Update active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Initialize map
    initMap();
});

// Show section function
function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    let targetSection;
    switch(sectionName) {
        case 'bản đồ':
            targetSection = document.getElementById('map-section');
            break;
        case 'báo-ngập':
            targetSection = document.getElementById('report-section');
            break;
        case 'cảnh-báo':
            targetSection = document.getElementById('alert-section');
            break;
        case 'chatbot-ai':
            targetSection = document.getElementById('chatbot-section');
            break;
        case 'cẩm-nang':
            targetSection = document.getElementById('guide-section');
            break;
        case 'dashboard':
            targetSection = document.getElementById('dashboard-section');
            initDashboardMap();
            break;
    }
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Initialize map
function initMap() {
    const map = L.map('map').setView([14.0583, 108.2772], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add heatmap layer (simulated)
    const heatData = [
        [16.0678, 108.2208, 0.8], // Đà Nẵng
        [10.8231, 106.6297, 0.6], // TP.HCM
        [21.0285, 105.8542, 0.4]  // Hà Nội
    ];
    
    L.heatLayer(heatData, {radius: 25}).addTo(map);
    
    // Add markers
    const floodAreas = [
        { lat: 16.0678, lng: 108.2208, title: 'Đà Nẵng - Ngập úng khu vực cầu sông Hàn' },
        { lat: 10.8231, lng: 106.6297, title: 'TP.HCM - Ngập úng quận 1' },
        { lat: 21.0285, lng: 105.8542, title: 'Hà Nội - Ngập úng khu vực cầu Long Biên' }
    ];
    
    floodAreas.forEach(area => {
        L.marker([area.lat, area.lng])
            .addTo(map)
            .bindPopup(`<b>${area.title}</b><br>Cảnh báo ngập lụt!`);
    });
}

// Hiệu ứng click cho nút SOS
const sosBtn = document.querySelector('.sos-btn');
sosBtn.addEventListener('click', () => {
    alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn.');
});

// Giả lập cập nhật bản đồ khi nhấn vào các nút chức năng
const fabBtns = document.querySelectorAll('.fab-btn');
fabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        console.log('Chức năng đang được kích hoạt...');
        // Bạn có thể thêm logic mở modal hoặc form báo cáo tại đây
    });
});

// Depth slider
const depthSlider = document.getElementById('depth-slider');
const depthValue = document.getElementById('depth-value');
if (depthSlider) {
    depthSlider.addEventListener('input', () => {
        depthValue.textContent = depthSlider.value + 'm';
    });
}

// Get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            alert(`Vị trí: ${position.coords.latitude}, ${position.coords.longitude}`);
        });
    } else {
        alert('Geolocation không được hỗ trợ.');
    }
}

// Estimate depth (simulated)
function estimateDepth() {
    const fileInput = document.getElementById('depth-image');
    if (fileInput.files.length > 0) {
        document.getElementById('depth-result').innerHTML = '<p>Đang phân tích...</p>';
        setTimeout(() => {
            document.getElementById('depth-result').innerHTML = '<p>Ước lượng độ sâu: 1.2m (Độ tin cậy: 85%)</p>';
        }, 2000);
    } else {
        alert('Vui lòng chọn ảnh.');
    }
}

// Start quiz
function startQuiz() {
    const questions = [
        { q: 'Khi gặp người đuối nước, bạn nên:', a: ['Nhảy xuống cứu ngay', 'Gọi cứu hộ và ném phao', 'Bơi ra xa'], correct: 1 }
    ];
    
    let score = 0;
    questions.forEach(q => {
        const answer = confirm(`${q.q}\n\n1. ${q.a[0]}\n2. ${q.a[1]}\n3. ${q.a[2]}`);
        if (answer && q.correct === 1) score++;
    });
    
    document.getElementById('quiz-result').innerHTML = `<p>Điểm của bạn: ${score}/${questions.length}</p>`;
}

// Chatbot functions
function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    
    if (input.value.trim()) {
        messages.innerHTML += `<div class="mb-2"><strong>Bạn:</strong> ${input.value}</div>`;
        // Simulate AI response
        setTimeout(() => {
            messages.innerHTML += `<div class="mb-2"><strong>AI:</strong> Cảm ơn bạn đã hỏi. Đây là câu trả lời mẫu.</div>`;
            messages.scrollTop = messages.scrollHeight;
        }, 1000);
        input.value = '';
    }
}

function emergencyCall() {
    alert('Đang gọi hotline cứu hộ: 115');
}

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