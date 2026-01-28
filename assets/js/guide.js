// Guide Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Track video progress
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('play', () => {
            console.log('Video started playing');
        });
        
        video.addEventListener('ended', () => {
            console.log('Video completed');
            // Could save progress to localStorage
        });
    });
});

// SOS Button
const sosBtn = document.querySelector('.sos-btn');
sosBtn.addEventListener('click', () => {
    alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn.');
});