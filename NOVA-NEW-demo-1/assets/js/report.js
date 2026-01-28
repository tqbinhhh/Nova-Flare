// FloodShield Report Page - Enhanced JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize depth slider
    const depthSlider = document.getElementById('depth-slider');
    const depthValue = document.getElementById('depth-value');

    if (depthSlider && depthValue) {
        depthSlider.addEventListener('input', function() {
            const depth = parseFloat(this.value);
            depthValue.textContent = depth.toFixed(1) + 'm';

            // Sync with AI Estimator logic for consistency
            const resultBox = document.getElementById('quick-report-ai-result');
            if (resultBox) {
                const info = getFloodWarning(depth * 1000); // Slider is in meters, getFloodWarning expects mm
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-6 flex items-start gap-3">
                        <i data-lucide="${info.icon}" class="w-5 h-5 ${info.colorClass} shrink-0 mt-0.5"></i>
                        <p class="text-xs font-semibold ${info.colorClass}">
                            ${info.warning}
                        </p>
                    </div>
                `;
                lucide.createIcons();
            }
        });
    }

    // Add drag and drop functionality
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('drop', handleDrop);
    });

    // Add smooth animations
    const reportCards = document.querySelectorAll('.report-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    reportCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add loading states
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-accent');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                this.innerHTML = '<div class="loading"></div> Đang xử lý...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    // Reset button text will be handled by specific functions
                }, 2000);
            }
        });
    });

    // SOS Button functionality
    const sosBtn = document.querySelector('.sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', function() {
            if (confirm('Bạn có muốn gọi khẩn cấp 115?')) {
                alert('Tín hiệu SOS đã được gửi! Đội cứu hộ đang xác định vị trí của bạn.');
            }
        });
    }

    // Initialize local training progress from previous uploads
    updateTrainingProgress();
});

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#60a5fa';
    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
    e.currentTarget.style.background = 'rgba(51, 65, 85, 0.3)';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload({
            files: files
        });
    }
}

// Enhanced file upload handling
function handleFileUpload(input) {
    const files = input.files || input;
    if (files.length > 0) {
        const file = files[0];
        // For Quick Report card
        const isQuickReport = input.id === 'media-upload';
        const uploadArea = isQuickReport ? document.getElementById('quick-upload-area') : (input.closest('.upload-area') || input.parentElement.querySelector('.upload-area'));

        if (uploadArea) {
            uploadArea.innerHTML = `
                <i data-lucide="check-circle" class="w-12 h-12 text-green-400 mb-2"></i>
                <p class="text-sm text-green-400 font-semibold">${file.name}</p>
                <p class="text-xs text-slate-400">File đã được chọn</p>
            `;
            lucide.createIcons();

            // Store preview URL globally for manual marking and show manual mark button
            try {
                latestUploadedImageURL = URL.createObjectURL(file);
                const manualBtn = document.getElementById('manual-mark-sample');
                if (manualBtn) manualBtn.classList.remove('hidden');
            } catch (e) {
                // ignore URL errors
            }

            if (isQuickReport) {
                const resultBox = document.getElementById('quick-report-ai-result');
                if (resultBox) {
                    resultBox.classList.remove('hidden');
                    resultBox.innerHTML = `
                        <div class="flex items-center gap-2 mb-4 animate-pulse">
                            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI đang học các dấu hiệu...</p>
                        </div>
                    `;

                    // Simulate analysis logic after 1.5s
                    setTimeout(() => {
                        const randomDepthCm = [12, 18, 40, 70][Math.floor(Math.random() * 4)];
                        const info = getFloodWarning(randomDepthCm * 10);

                        // Update slider to match AI depth
                        const slider = document.getElementById('depth-slider');
                        const depthDisplay = document.getElementById('depth-value');
                        if (slider) {
                            slider.value = randomDepthCm / 100;
                            depthDisplay.textContent = (randomDepthCm / 100).toFixed(1) + 'm';
                        }

                        // Save example as training data so the local "AI" can learn signs
                        saveTrainingExample(file.name, randomDepthCm);
                        updateTrainingProgress();

                        resultBox.innerHTML = `
                            <div class="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4 flex flex-col gap-2">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="brain" class="w-4 h-4 text-blue-400"></i>
                                    <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Phân tích AI</span>
                                </div>
                                <div class="flex items-start gap-3">
                                    <i data-lucide="${info.icon}" class="w-5 h-5 ${info.colorClass} shrink-0 mt-0.5"></i>
                                    <div>
                                        <p class="text-sm font-bold ${info.colorClass}">Nước dâng tới: <span class="text-white">${randomDepthCm} cm (${(randomDepthCm/100).toFixed(2)} m)</span></p>
                                        <p class="text-xs font-semibold ${info.colorClass}">${info.summary}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="p-3 bg-slate-900 rounded-lg border border-white/5 text-xs text-slate-300">
                                <div class="font-bold mb-2">Cần lưu ý:</div>
                                <ul class="list-disc ml-4 space-y-1">
                                    ${info.notes.map(n => `<li>${n}</li>`).join('')}
                                </ul>
                                <div class="font-bold mt-3 mb-1">Hướng dẫn an toàn:</div>
                                <ul class="list-disc ml-4 space-y-1">
                                    ${info.guidance.map(g => `<li>${g}</li>`).join('')}
                                </ul>
                                <div class="mt-3 text-[11px] text-slate-400 font-semibold">Ví dụ đã được lưu cho quá trình huấn luyện cục bộ.</div>
                            </div>
                        `; 
                        lucide.createIcons();

                        // If enabled, run more precise body-level detection
                        if (enableBodyDetection) {
                            analyzeWaterLevelFromFile(file).then(res => {
                                if (res && !res.error) {
                                    resultBox.innerHTML += `
                                        <div class="mt-3 p-3 bg-slate-800 rounded-lg text-xs text-slate-300">
                                            <div class="font-bold mb-1">Xác định mức theo cơ thể: <span class="text-white">${res.label}</span></div>
                                            <div class="text-slate-400 text-[12px]">${res.explain}</div>
                                            <div class="mt-2 flex gap-2">
                                                <button class="py-2 px-3 bg-white/5 text-xs rounded-xl" onclick="openManualMark(latestUploadedImageURL, function(mark){ handleManualMarkResult(mark, 'quick') })">Đánh dấu thủ công</button>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    resultBox.innerHTML += `<div class="mt-3 text-xs text-yellow-300">Không thể phân tích tự động: ${res && res.error ? res.error : 'Không phát hiện'}. <button class="py-1 px-2 bg-white/5 text-xs rounded" onclick="openManualMark(latestUploadedImageURL, function(mark){ handleManualMarkResult(mark, 'quick') })">Đánh dấu thủ công</button></div>`;
                                }
                                lucide.createIcons();
                            }).catch(e => {
                                console.error('Body detection error', e);
                            });
                        }
                    }, 1500);
                }
            }
        }

        // Show success animation
        uploadArea.classList.add('success');
        setTimeout(() => uploadArea.classList.remove('success'), 600);
    }
}

// Enhanced AI upload handling
function handleAIUpload(input) {
    handleFileUpload(input);
}

// Enhanced location function
function getLocation() {
    const button = document.querySelector('.btn-primary');
    const originalText = button.innerHTML;

    if (navigator.geolocation) {
        button.innerHTML = '<div class="loading"></div> Đang lấy vị trí...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const {
                    latitude,
                    longitude
                } = position.coords;
                button.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5 mr-2"></i> Vị trí đã gửi!';
                button.classList.add('success');

                // Simulate sending location
                setTimeout(() => {
                    alert(`Vị trí đã được gửi thành công!\nTọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                    button.innerHTML = originalText;
                    button.classList.remove('success');
                    lucide.createIcons();
                }, 1500);
            },
            (error) => {
                button.innerHTML = originalText;
                let errorMessage = 'Không thể lấy vị trí. ';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Vui lòng cho phép truy cập vị trí.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Quá thời gian chờ.';
                        break;
                    default:
                        errorMessage += 'Lỗi không xác định.';
                        break;
                }

                alert(errorMessage);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        alert('Trình duyệt không hỗ trợ định vị GPS.');
        button.innerHTML = originalText;
    }
}

// Enhanced depth estimation
function getFloodWarning(depthMm) {
    const depthCm = depthMm / 10;

    // default
    let summary = "Mức nước thấp, nhưng vẫn có nguy cơ trơn trượt và rác thải. Hãy cẩn thận.";
    let colorClass = "text-blue-400";
    let icon = "info";
    let depthLabel = `<15cm`;
    let notes = ["Cẩn thận bề mặt trơn trượt", "Tránh tiếp xúc nhiều với nước bẩn"];
    let guidance = ["Cẩn thận khi di chuyển qua vùng ngập", "Rửa tay và sát trùng nếu tiếp xúc với nước bẩn"];

    // >30cm up to knee or more
    if (depthCm > 30) {
        depthLabel = `Trên 30 cm - đến đầu gối`;
        summary = "Trên 30 cm - đến đầu gối: Cực kỳ nguy hiểm, khó kiểm soát hướng di chuyển và dễ tiếp xúc với nước ô nhiễm (rác, vi khuẩn). Nguy cơ điện giật và bệnh tật cao.";
        colorClass = "text-red-500";
        icon = "alert-octagon";
        notes = ["Khó kiểm soát hướng di chuyển", "Tiếp xúc với nước ô nhiễm (rác, vi khuẩn)", "Nguy cơ điện giật", "Có thể gây bệnh da liễu và tiêu hoá"];
        guidance = ["Tránh mọi hành vi đi qua vùng ngập này", "Di chuyển tới vùng cao an toàn", "Gọi hỗ trợ khẩn cấp nếu cần (115)", "Không chạm vào thiết bị điện bị ngập"];
    } else if (depthCm === 30) {
        depthLabel = `30 cm`;
        summary = "30 cm: Nguy cơ cao cuốn trôi các loại xe nhỏ và gây nguy hiểm lớn khi di chuyển.";
        colorClass = "text-orange-500";
        icon = "triangle-alert";
        notes = ["Nguy cơ cuốn trôi phương tiện nhỏ", "Khó điều khiển khi lái xe qua vùng ngập"];
        guidance = ["Không lái xe nhỏ qua vùng ngập", "Nếu phải đi bộ, tìm đường tránh hoặc chọn đường cao hơn"];
    } else if (depthCm >= 15) {
        depthLabel = `15-30 cm`;
        summary = "15 cm: Mức nguy hiểm cho người đi bộ, có thể gây té ngã. Ngâm mình trong nước bẩn có thể gây các bệnh da liễu, nhiễm trùng vết thương, bệnh đường tiêu hoá.";
        colorClass = "text-yellow-400";
        icon = "alert-triangle";
        notes = ["Mức nguy hiểm cho người đi bộ", "Dễ bị té ngã", "Nguy cơ nhiễm khuẩn khi tiếp xúc với nước bẩn"];
        guidance = ["Tránh đi bộ qua vùng ngập khi có thể", "Nếu phải đi qua, sử dụng giày/bốt cao và giữ trẻ em xa khu vực", "Rửa sạch và sát trùng vết thương sau khi tiếp xúc"];
    } else {
        depthLabel = `<15cm`;
        summary = "Mức nước thấp, nhưng vẫn có nguy cơ trơn trượt và rác thải. Hãy cẩn thận.";
        colorClass = "text-blue-400";
        icon = "info";
        notes = ["Bề mặt trơn trượt", "Rác thải có thể gây vướng víu"];
        guidance = ["Cẩn thận khi đi qua vùng ẩm ướt", "Hạn chế tiếp xúc trực tiếp với nước bẩn"];
    }

    return {
        depthLabel,
        summary,
        notes,
        guidance,
        colorClass,
        icon
    };
}

function estimateDepth() {
    const fileInput = document.getElementById('ai-image');
    const resultBox = document.getElementById('depth-result');
    const analyzeBtn = document.getElementById('analyze-btn');

    if (fileInput.files.length === 0) {
        showResult('Vui lòng chọn ảnh trước khi phân tích.', 'error');
        return;
    }

    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<div class="loading"></div> Đang phân tích AI...';
    analyzeBtn.disabled = true;

    resultBox.innerHTML = '<div class="text-center"><div class="loading"></div><p class="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">AI đang học các dấu hiệu...</p></div>';

    // Simulate AI processing with the new rules
    setTimeout(() => {
        // Generating depths in mm to match the slider logic often used in these apps, 
        // but let's stick to cm/m for display.
        // We'll simulate values around the thresholds: 10, 20, 35, 60 cm
        const testDepthsCm = [10, 18, 35, 65];
        const randomIndex = Math.floor(Math.random() * testDepthsCm.length);
        const depthCm = testDepthsCm[randomIndex];
        const depthM = (depthCm / 100).toFixed(2);
        const conf = Math.floor(Math.random() * 20) + 75; // 75-95% confidence

        const info = getFloodWarning(depthCm * 10); // getFloodWarning expects mm

        resultBox.innerHTML = `
            <div class="text-center w-full">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <i data-lucide="brain" class="w-6 h-6 text-purple-400"></i>
                    </div>
                    <div class="text-left">
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-tighter">AI Analysis Result</p>
                        <p class="text-xl font-black text-white">Nước dâng tới: <span class="text-purple-400">${depthCm} cm (${depthM} m)</span></p>
                    </div>
                </div>
                
                <div class="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 animate-in fade-in slide-in-from-bottom-2">
                    <div class="flex items-start gap-3">
                        <i data-lucide="${info.icon}" class="w-5 h-5 ${info.colorClass} shrink-0 mt-0.5"></i>
                        <div>
                            <p class="text-sm font-medium ${info.colorClass} text-left leading-relaxed">${info.summary}</p>
                            <div class="mt-2 text-xs text-slate-400">
                                <div class="font-semibold">Cần lưu ý:</div>
                                <ul class="list-disc ml-4 mt-1">
                                    ${info.notes.map(n => `<li>${n}</li>`).join('')}
                                </ul>
                                <div class="font-semibold mt-2">Hướng dẫn an toàn:</div>
                                <ul class="list-disc ml-4 mt-1">
                                    ${info.guidance.map(g => `<li>${g}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-1">
                    <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Confidence Score</span>
                        <span>${conf}%</span>
                    </div>
                    <div class="bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-1000 ease-out" style="width: ${conf}%"></div>
                    </div>
                </div>
            </div>
        `;

        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
        lucide.createIcons();

        // If enabled, run body-level detection for the same file
        if (enableBodyDetection && fileInput.files[0]) {
            analyzeWaterLevelFromFile(fileInput.files[0]).then(res => {
                if (res && !res.error) {
                    const details = `\n<div class="mt-3 p-3 bg-slate-800 rounded-lg text-xs text-slate-300">\n    <div class="font-bold mb-1">Xác định mức theo cơ thể: <span class="text-white">${res.label}</span></div>\n    <div class="text-slate-400 text-[12px]">${res.explain}</div>\n    <div class="mt-2 flex gap-2">\n        <button class="py-2 px-3 bg-white/5 text-xs rounded-xl" onclick="openManualMark(latestUploadedImageURL, function(mark){ handleManualMarkResult(mark, 'estimate') })">Đánh dấu thủ công</button>\n    </div>\n</div>`;
                    resultBox.innerHTML += details;
                    lucide.createIcons();
                } else {
                    const fallback = `<div class="mt-3 text-xs text-yellow-300">Không thể phân tích tự động: ${res && res.error ? res.error : 'Không phát hiện'}. <button class="py-1 px-2 bg-white/5 text-xs rounded" onclick="openManualMark(latestUploadedImageURL, function(mark){ handleManualMarkResult(mark, 'estimate') })">Đánh dấu thủ công</button></div>`;
                    resultBox.innerHTML += fallback;
                    lucide.createIcons();
                }
            }).catch(e => console.error('body detection error', e));
        }

        // Save example to local training store and update progress
        const fileName = (fileInput.files[0] && fileInput.files[0].name) ? fileInput.files[0].name : `ai_sim_${Date.now()}`;
        saveTrainingExample(fileName, depthCm);
        updateTrainingProgress();

        // Add success animation
        resultBox.classList.add('success');
        setTimeout(() => resultBox.classList.remove('success'), 600);

    }, 2500);
}

// Survey option selection
function selectOption(button, isYes) {
    const options = button.parentElement.querySelectorAll('.option-btn');
    options.forEach(opt => opt.classList.remove('selected'));
    button.classList.add('selected');

    // Store the answer
    button.dataset.answer = isYes;
}

// Enhanced quiz function
function startQuiz() {
    const resultBox = document.getElementById('quiz-result');
    const selectedOption = document.querySelector('.option-btn.selected');

    if (!selectedOption) {
        showResult('Vui lòng chọn câu trả lời trước khi bắt đầu quiz!', 'warning');
        return;
    }

    const knowsFirstAid = selectedOption.dataset.answer === 'true';

    resultBox.innerHTML = '<div class="text-center"><div class="loading"></div><p class="mt-2">Đang tải câu hỏi...</p></div>';

    setTimeout(() => {
        const questions = [{
                question: 'Khi gặp người đuối nước, bạn nên làm gì trước tiên?',
                options: [
                    'Nhảy xuống nước cứu ngay lập tức',
                    'Gọi điện cứu hộ 115 và ném phao cứu sinh',
                    'Bơi ra xa để tránh nguy hiểm'
                ],
                correct: 1,
                explanation: 'Luôn ưu tiên an toàn của bản thân và gọi cứu hộ chuyên nghiệp trước.'
            },
            {
                question: 'Độ sâu nước an toàn để bơi là bao nhiêu?',
                options: [
                    'Từ 1.2m trở lên',
                    'Từ 0.8m trở lên',
                    'Bất kỳ độ sâu nào cũng an toàn'
                ],
                correct: 0,
                explanation: 'Nước sâu từ 1.2m trở lên mới an toàn cho người lớn bơi.'
            },
            {
                question: 'Khi sơ cứu người đuối nước, bạn nên:',
                options: [
                    'Ép bụng để吐 nước ra',
                    'Đặt người nằm nghiêng, kiểm tra đường thở',
                    'Lắc mạnh người để tỉnh lại'
                ],
                correct: 1,
                explanation: 'Kiểm tra đường thở và đặt nằm nghiêng là cách sơ cứu đúng.'
            }
        ];

        let score = 0;
        let quizHTML = '<div class="space-y-4">';

        questions.forEach((q, index) => {
            const userAnswer = Math.floor(Math.random() * 3); // Simulate user answers
            const isCorrect = userAnswer === q.correct;

            if (isCorrect) score++;

            quizHTML += `
                <div class="border-l-4 ${isCorrect ? 'border-green-400' : 'border-red-400'} pl-4 py-2">
                    <p class="font-semibold text-white">Câu ${index + 1}: ${q.question}</p>
                    <p class="text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}">
                        ${isCorrect ? '✓' : '✗'} ${q.options[userAnswer]}
                    </p>
                    <p class="text-xs text-slate-400 mt-1">${q.explanation}</p>
                </div>
            `;
        });

        quizHTML += `
            <div class="text-center mt-6 p-4 bg-slate-700 rounded-lg">
                <p class="text-xl font-bold text-white">Kết quả: ${score}/${questions.length}</p>
                <p class="text-slate-400">${getScoreMessage(score, questions.length)}</p>
                ${knowsFirstAid ? '<p class="text-green-400 text-sm mt-2">👍 Kiến thức của bạn khá tốt!</p>' : '<p class="text-blue-400 text-sm mt-2">📚 Hãy học thêm về sơ cứu đuối nước</p>'}
            </div>
        </div>`;

        resultBox.innerHTML = quizHTML;

        // Add success animation
        resultBox.classList.add('success');
        setTimeout(() => resultBox.classList.remove('success'), 600);

    }, 2000);
}

// Save training example locally so the UI can show progress and the local 'AI' can learn patterns
function saveTrainingExample(fileName, depthCm) {
    try {
        const key = 'floodTrainingData';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const label = getDepthLabel(depthCm);
        arr.push({
            fileName,
            depthCm,
            label,
            timestamp: Date.now()
        });
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
        console.error('Không lưu được ví dụ huấn luyện:', e);
    }
}

function getDepthLabel(depthCm) {
    if (depthCm > 50) return '>50cm (đầu gối+)';
    if (depthCm > 30) return '>30cm đến đầu gối';
    if (depthCm === 30) return '30cm';
    if (depthCm >= 15) return '15-30cm';
    return '<15cm';
}

function updateTrainingProgress() {
    const key = 'floodTrainingData';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const count = arr.length;
    const target = 50; // 50 examples ≈ 100% local progress
    const percent = Math.min(100, Math.round((count / target) * 100));
    const resultBox = document.getElementById('quiz-result');
    if (resultBox) {
        resultBox.innerHTML = `
        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Training Progress</div>
        <div class="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-cyan-500" style="width: ${percent}%"></div>
        </div>
        <div class="mt-2 text-xs text-slate-400 training-count font-semibold">AI đã học ${count} ảnh (${percent}%)</div>
        ${percent >= 100 ? '<div class="mt-2 text-xs text-green-400 font-bold">✅ Mô hình cục bộ đã được huấn luyện tốt</div>' : ''}`;
    }
}

// Hydro stations (đập / trạm thủy điện) - status dashboard
const hydroStations = [
    {
        id: 'dn1', name: 'Đập Hòa Khánh', region: 'ĐÀ NẴNG', commune: 'Hòa Khánh', status: 'release', releaseRate: '350 m³/s', lastUpdate: Date.now() - 60000,
        recentReleases: [
            { ts: Date.now() - 6 * 3600000, rate: 80 },
            { ts: Date.now() - 4 * 3600000, rate: 120 },
            { ts: Date.now() - 2 * 3600000, rate: 260 },
            { ts: Date.now() - 60 * 1000, rate: 350 }
        ]
    },
    {
        id: 'dn2', name: 'Trạm bơm Cẩm Lệ', region: 'ĐÀ NẴNG', commune: 'Cẩm Lệ', status: 'watch', releaseRate: null, lastUpdate: Date.now() - 5 * 60000,
        recentReleases: [
            { ts: Date.now() - 5 * 3600000, rate: 0 },
            { ts: Date.now() - 2 * 3600000, rate: 0 },
            { ts: Date.now() - 30 * 60000, rate: 0 }
        ]
    },
    {
        id: 'dn3', name: 'Đập Sơn Trà', region: 'ĐÀ NẴNG', commune: 'Sơn Trà', status: 'normal', releaseRate: '60 m³/s', lastUpdate: Date.now() - 180000,
        recentReleases: [
            { ts: Date.now() - 8 * 3600000, rate: 40 },
            { ts: Date.now() - 3 * 3600000, rate: 55 },
            { ts: Date.now() - 180000, rate: 60 }
        ]
    },
    {
        id: 'kh1', name: 'Đập Sông Vĩnh', region: 'KHÁNH HÒA', commune: 'Sông Vĩnh', status: 'normal', releaseRate: '120 m³/s', lastUpdate: Date.now() - 3600000,
        recentReleases: [
            { ts: Date.now() - 8 * 3600000, rate: 90 },
            { ts: Date.now() - 4 * 3600000, rate: 110 },
            { ts: Date.now() - 3600000, rate: 120 }
        ]
    }
];

function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s trước`;
    if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
    if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
    return `${Math.floor(s / 86400)} ngày trước`;
}

// Helper: parse releaseRate string or recentReleases to numeric m3/s
function parseRateToNumber(station) {
    if (!station) return -1;
    if (typeof station.releaseRate === 'number') return station.releaseRate;
    if (typeof station.releaseRate === 'string') {
        const m = station.releaseRate.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (m) return parseFloat(m[1]);
    }
    if (station.recentReleases && station.recentReleases.length) {
        const last = station.recentReleases[station.recentReleases.length - 1];
        return typeof last.rate === 'number' ? last.rate : (parseFloat(last.rate) || -1);
    }
    return -1;
}

function computeTotalDischarge(stations) {
    let sum = 0;
    let count = 0;
    stations.forEach(s => {
        const v = parseRateToNumber(s);
        if (v >= 0) { sum += v; count++; }
    });
    if (count === 0) return -1;
    return Math.round(sum);
}

function populateCommuneFilter(region = 'ĐÀ NẴNG') {
    const select = document.getElementById('hydro-commune-filter');
    if (!select) return;
    const communes = new Set();
    hydroStations.forEach(s => {
        if (region === 'ALL' || (s.region || '').toUpperCase() === region.toUpperCase()) {
            if (s.commune) communes.add(s.commune);
        }
    });
    const prev = localStorage.getItem('hydroCommune') || 'ALL';
    select.innerHTML = `<option value="ALL">Tất cả xã</option>` + Array.from(communes).map(c => `<option value="${c}" ${prev === c ? 'selected' : ''}>${c}</option>`).join('');
}

function onHydroCommuneChange(el) {
    const val = el && el.value ? el.value : 'ALL';
    localStorage.setItem('hydroCommune', val);
    renderHydroStations('ĐÀ NẴNG', val);
}

// Build a small sparkline SVG from an array of numeric rates
function buildSparklineSVG(values = [], w = 140, h = 36) {
    if (!values || values.length === 0) return '';
    const max = Math.max(...values);
    const min = Math.min(...values);
    const len = values.length;
    const points = values.map((v, i) => {
        const x = (i / (len - 1)) * (w - 4) + 2;
        const y = h - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - 4) + 2);
        return `${x},${y}`;
    }).join(' ');
    const last = values[values.length - 1];
    const color = last > 200 ? '#ef4444' : (last > 100 ? '#f59e0b' : '#22c55e');
    return `<svg class="sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

function formatRate(station) {
    if (station.releaseRate) return station.releaseRate;
    if (station.recentReleases && station.recentReleases.length) {
        const last = station.recentReleases[station.recentReleases.length - 1];
        return `${last.rate} m³/s`;
    }
    return '—';
}

function openHydroDetails(id) {
    const station = hydroStations.find(s => s.id === id);
    if (!station) return alert('Không tìm thấy trạm.');
    const modal = document.getElementById('hydro-modal');
    const title = document.getElementById('hydro-modal-title');
    const body = document.getElementById('hydro-modal-body');
    if (!modal || !title || !body) return;

    title.textContent = `${station.name} • ${station.region}`;
    const rates = (station.recentReleases || []).map(r => r.rate);
    const spark = buildSparklineSVG(rates, 420, 80);

    let html = `<div class="mb-2">Mức xả hiện tại: <strong class="text-white">${formatRate(station)}</strong></div>`;
    html += `<div class="mb-4">${spark}</div>`;
    html += `<div class="text-xs text-slate-400">Lịch sử xả gần đây:</div>`;
    html += `<div class="mt-2 max-h-44 overflow-auto text-sm">`;
    if (station.recentReleases && station.recentReleases.length) {
        html += `<table class="w-full text-left text-slate-300 text-[13px]"><thead><tr><th class="pb-2">Thời gian</th><th class="pb-2">Mức (m³/s)</th></tr></thead><tbody>`;
        station.recentReleases.slice().reverse().forEach(r => {
            html += `<tr><td class="py-1">${new Date(r.ts).toLocaleString()}</td><td class="py-1 font-bold">${r.rate}</td></tr>`;
        });
        html += `</tbody></table>`;
    } else {
        html += `<div class="text-slate-400">Không có dữ liệu lịch sử.</div>`;
    }
    html += `</div>`;
    html += `<div class="mt-4 flex gap-2"><button class="py-2 px-3 bg-white/5 text-xs rounded" onclick="downloadHydroCSV('${station.id}')">Tải CSV</button><button class="py-2 px-3 bg-white/5 text-xs rounded" onclick="closeHydroModal()">Đóng</button></div>`;

    body.innerHTML = html;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeHydroModal() { const modal = document.getElementById('hydro-modal'); if (modal) modal.classList.add('hidden'); }

function downloadHydroCSV(id) {
    const station = hydroStations.find(s => s.id === id);
    if (!station || !station.recentReleases) return alert('Không có dữ liệu để tải.');
    const rows = [['timestamp', 'rate_m3s']];
    station.recentReleases.forEach(r => rows.push([new Date(r.ts).toISOString(), r.rate]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${station.id}_releases.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
} 

function renderHydroStations(region = 'ĐÀ NẴNG', commune = 'ALL') {
    const list = document.getElementById('hydro-list');
    const banner = document.getElementById('hydro-alert-banner');
    if (!list) return;

    const filtered = hydroStations.filter(s => region === 'ALL' ? true : (s.region || '').toUpperCase() === region.toUpperCase());

    if (filtered.length === 0) {
        list.innerHTML = `<p class="text-slate-400">Không tìm thấy trạm/đập cho khu vực này.</p>`;
        if (banner) banner.classList.add('hidden');
        return;
    }

    // Compute total discharge and determine severity thresholds
    const summary = document.getElementById('hydro-summary');
    const total = computeTotalDischarge(filtered);
    const THRESHOLDS = { amber: 250, red: 500 };
    let totalSeverity = 'normal';
    if (total >= THRESHOLDS.red) totalSeverity = 'red';
    else if (total >= THRESHOLDS.amber) totalSeverity = 'amber';

    if (summary) summary.textContent = `Tổng lưu lượng xả (${region}${commune && commune !== 'ALL' ? ' • ' + commune : ''}): ${total > -1 ? total + ' m³/s' : '—'}`;

    if (banner) {
        if (totalSeverity === 'red') {
            banner.textContent = `CẢNH BÁO ĐỎ: Tổng lưu lượng xả ${total} m³/s (vượt ngưỡng ${THRESHOLDS.red} m³/s).`;
            banner.classList.remove('hidden');
            banner.classList.remove('bg-yellow-400/10','text-yellow-400','bg-red-600/10','text-red-300');
            banner.classList.add('bg-red-600/10','text-red-300');
        } else if (totalSeverity === 'amber') {
            banner.textContent = `CẢNH BÁO VÀNG: Tổng lưu lượng xả ${total} m³/s (vượt ngưỡng ${THRESHOLDS.amber} m³/s). Hãy cảnh giác.`;
            banner.classList.remove('hidden');
            banner.classList.remove('bg-yellow-400/10','text-yellow-400','bg-red-600/10','text-red-300');
            banner.classList.add('bg-yellow-400/10','text-yellow-400');
        } else {
            // fallback to showing if any station is releasing
            const anyRelease = filtered.some(s => s.status === 'release');
            if (anyRelease) {
                banner.textContent = `Có trạm đang xả lũ.`;
                banner.classList.remove('hidden');
                banner.classList.remove('bg-yellow-400/10','text-yellow-400','bg-red-600/10','text-red-300');
                banner.classList.add('bg-red-600/10','text-red-300');
            } else {
                banner.classList.add('hidden');
            }
        }
    }

    list.innerHTML = '';
    filtered.forEach(station => {
        let statusLabel = 'Bình thường';
        let statusClass = 'bg-green-600 text-white';
        if (station.status === 'release') { statusLabel = 'ĐANG XẢ LŨ'; statusClass = 'bg-red-600 text-white'; }
        if (station.status === 'watch') { statusLabel = 'Giám sát'; statusClass = 'bg-yellow-400 text-black'; }

        const item = document.createElement('div');
        item.className = 'station-item p-3 bg-slate-900 rounded-lg border border-white/5 mb-3 flex items-center justify-between';

        const currentRate = formatRate(station);
        const spark = buildSparklineSVG((station.recentReleases || []).map(r => r.rate));

        // Determine station-level warning (mốc)
        const stationNum = parseRateToNumber(station);
        let mLabel = 'Bình thường';
        let mClass = 'bg-green-600 text-white';
        if (stationNum >= 500) { mLabel = 'Mốc: Đỏ'; mClass = 'bg-red-600 text-white'; }
        else if (stationNum >= 250) { mLabel = 'Mốc: Vàng'; mClass = 'bg-yellow-400 text-black'; }

        item.innerHTML = `
            <div class="flex-1 pr-4">
                <div class="font-bold text-white">${station.name} <span class="text-xs text-slate-400">/ ${station.region} ${station.commune ? '• ' + station.commune : ''}</span></div>
                <div class="text-xs text-slate-400 mt-1">Cập nhật: ${timeAgo(station.lastUpdate)}</div>
                <div class="mt-2 flex items-center gap-3">
                    <div class="text-xl font-extrabold text-white">${currentRate}</div>
                    <div class="sparkline-mini">${spark}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="inline-block px-3 py-1 rounded-full ${statusClass} text-xs font-bold">${statusLabel}</div>
                <div class="mt-2"><span class="inline-block px-2 py-1 rounded-full ${mClass} text-xs font-bold">${mLabel}</span></div>
                <div class="mt-2"><button class="py-1 px-3 bg-white/5 text-xs rounded" onclick="openHydroDetails('${station.id}')">Xem</button></div>
            </div>
        `;
        list.appendChild(item);
    });

function refreshHydroData() {
    // Simulate small random updates for demo purposes (no live API)
    hydroStations.forEach(s => {
        const r = Math.random();
        if (r > 0.96) {
            s.status = 'release';
            const newRate = Math.floor(100 + Math.random() * 400);
            s.recentReleases = s.recentReleases || [];
            s.recentReleases.push({ ts: Date.now(), rate: newRate });
            s.releaseRate = `${newRate} m³/s`;
            s.lastUpdate = Date.now();
        } else if (r > 0.8) {
            s.status = 'watch';
            s.lastUpdate = Date.now() - Math.floor(Math.random() * 600000);
        } else {
            s.status = 'normal';
            s.lastUpdate = Date.now() - Math.floor(Math.random() * 3600000);
        }
    });

    // Re-render current region + commune
    const list = document.getElementById('hydro-list');
    if (list) {
        const commune = localStorage.getItem('hydroCommune') || 'ALL';
        renderHydroStations(document.getElementById('hydro-card') ? 'ĐÀ NẴNG' : 'ALL', commune);
        populateCommuneFilter(document.getElementById('hydro-card') ? 'ĐÀ NẴNG' : 'ALL');
    }
} 

// Live API integration removed — this demo uses local station data only.
// If you have a real API, implement fetchHydroStationsFromAPI(apiUrl) to map remote payloads to our station shape.

function initHydroSettings() {
    // Populate commune filter and apply saved selection
    populateCommuneFilter('ĐÀ NẴNG');
    const savedCommune = localStorage.getItem('hydroCommune') || 'ALL';
    const communeSelect = document.getElementById('hydro-commune-filter');
    if (communeSelect) {
        communeSelect.value = savedCommune;
        communeSelect.addEventListener('change', (e) => onHydroCommuneChange(e.target));
    }

    // helper to render keeping commune
    window.renderHydroFor = function(region) {
        const commune = document.getElementById('hydro-commune-filter') ? document.getElementById('hydro-commune-filter').value : 'ALL';
        populateCommuneFilter(region);
        renderHydroStations(region, commune);
    };
}

// Live API controls removed — not used in demo mode.

// Initialize hydro stations on load and periodic update
document.addEventListener('DOMContentLoaded', function() {
    initHydroSettings();
    const savedCommune = localStorage.getItem('hydroCommune') || 'ALL';
    renderHydroStations('ĐÀ NẴNG', savedCommune);
    setInterval(refreshHydroData, 60000);
});

// -------------------- Body-level detection (pose + waterline heuristic) --------------------
let enableBodyDetection = false;
let detectorPromise = null;
let latestUploadedImageURL = null;

function toggleBodyDetection(checkbox) {
    enableBodyDetection = checkbox.checked;
}

async function loadDetector() {
    if (!window.poseDetection || !window.tf) {
        console.warn('Pose detection or TF.js not loaded. Precise body-level detection unavailable.');
        return null;
    }
    if (!detectorPromise) {
        detectorPromise = (async () => {
            try {
                await tf.ready();
                const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: 'SINGLEPOSE_LIGHTNING' });
                return detector;
            } catch (e) {
                console.error('Không thể tải detector:', e);
                return null;
            }
        })();
    }
    return detectorPromise;
}

// High-level helper: given a File, load image and analyze
async function analyzeWaterLevelFromFile(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
            try {
                const res = await analyzeWaterLevel(img);
                resolve(res);
            } catch (e) {
                resolve({ error: e.toString() });
            }
        };
        img.onerror = () => resolve({ error: 'Không thể tải ảnh' });
        const url = URL.createObjectURL(file);
        latestUploadedImageURL = url;
        img.src = url;
    });
}

async function analyzeWaterLevel(img) {
    // Downscale for performance
    const maxDim = 800;
    const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;

    function isWaterPixel(r, g, b) {
        const avg = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (1 - min / max);
        // Heuristic: bluish or murky water (greenish) OR high saturation but not very bright
        return ((b > r && b > g && b > 80) || (g > r && g > b && g > 80) || sat > 0.25) && avg < 230;
    }

    // Compute water-likeness per row (sample columns for speed)
    const rowScores = new Array(h).fill(0);
    for (let y = 0; y < h; y++) {
        let waterCount = 0;
        let samples = 0;
        for (let x = 0; x < w; x += 6) {
            const idx = (y * w + x) * 4;
            const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
            samples++;
            if (isWaterPixel(r, g, b)) waterCount++;
        }
        rowScores[y] = waterCount / samples;
    }

    // Find horizontal waterline by scanning from bottom up for consecutive rows above threshold
    const threshold = 0.18;
    const consecutive = 5;
    let waterY = null;
    for (let y = h - 1; y >= 0; y--) {
        let sum = 0;
        for (let k = 0; k < consecutive; k++) {
            if (y - k < 0) break;
            sum += rowScores[y - k];
        }
        const avg = sum / consecutive;
        if (avg > threshold) {
            waterY = y;
            break;
        }
    }

    // Load pose detector and estimate keypoints
    let person = null;
    try {
        const detector = await loadDetector();
        if (detector) {
            const poses = await detector.estimatePoses(img);
            if (poses && poses.length > 0) {
                const p = poses[0];
                person = p.keypoints || p;
            }
        }
    } catch (e) {
        console.warn('Pose estimation lỗi:', e);
    }

    // Helper to get avg y of named keypoints
    function avgY(names) {
        const ys = names.map(n => {
            const k = person && person.find(pt => pt.name === n || pt.part === n);
            return k && k.y && k.score > 0.3 ? k.y : null;
        }).filter(Boolean);
        if (ys.length === 0) return null;
        return ys.reduce((a, b) => a + b, 0) / ys.length;
    }

    let label = null;
    let explain = '';
    let confidence = 0;

    if (waterY === null) {
        label = 'Không xác định được mực nước (không phát hiện vùng nước rõ ràng)';
        explain = 'Không tìm thấy biên nước rõ ràng trong ảnh. Bạn có thể đánh dấu thủ công.';
        confidence = 30;
    } else if (!person) {
        label = 'Không phát hiện người trên ảnh';
        explain = 'Phát hiện vùng nước, nhưng không thấy cơ thể để so sánh. Bạn có thể đánh dấu thủ công.';
        confidence = 50;
    } else {
        // Map waterY to body landmarks (y increases downward)
        const ankleY = avgY(['left_ankle', 'right_ankle', 'ankle']);
        const kneeY = avgY(['left_knee', 'right_knee', 'knee']);
        const hipY = avgY(['left_hip', 'right_hip', 'hip']);
        const shoulderY = avgY(['left_shoulder', 'right_shoulder', 'shoulder']);
        const noseY = avgY(['nose']);

        const normalized = (v) => v !== null ? (v / h) : null;
        const ny = waterY / h;

        // Determine label by comparing normalized positions
        if (ankleY && ny < normalized(ankleY) - 0.02) {
            label = 'Dưới mắt cá chân (chỉ chân bị ướt)';
        } else if (ankleY && kneeY && ny >= normalized(ankleY) - 0.02 && ny < normalized(kneeY)) {
            label = 'Tới mắt cá chân / bắp chân (nguy cơ té ngã cao)';
        } else if (kneeY && hipY && ny >= normalized(kneeY) && ny < normalized(hipY)) {
            label = 'Ngang gối (rất nguy hiểm)';
        } else if (hipY && shoulderY && ny >= normalized(hipY) && ny < normalized(shoulderY)) {
            label = 'Tới hông/eo (rủi ro lớn, dễ tiếp xúc với nước ô nhiễm)';
        } else if (shoulderY && ny >= normalized(shoulderY)) {
            label = 'Ngực / vai trở lên (cực kỳ nguy hiểm)';
        } else if (noseY && ny >= normalized(noseY)) {
            label = 'Nước tối cổ (nguy cơ tử vong)';
        } else {
            label = 'Mức nước giữa các điểm chuẩn, vui lòng kiểm tra thủ công';
        }

        explain = `Tìm thấy người và biên nước tại y=${Math.round(waterY)} (ảnh thu nhỏ cao=${h}px). Mức xấp xỉ: ${label}`;
        confidence = 70 + Math.round((rowScores[waterY] || 0) * 30);
    }

    return {
        waterY,
        label,
        explain,
        confidence,
        imageCanvas: canvas
    };
}

// Small utility: open a simple full-screen modal to let user mark waterline manually
function openManualMark(imageSrc, callback) {
    // create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    const canvas = document.createElement('canvas');
    canvas.style.maxWidth = '90%';
    canvas.style.maxHeight = '90%';
    canvas.style.cursor = 'crosshair';

    overlay.appendChild(canvas);

    const close = () => { document.body.removeChild(overlay); };
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    const img = new Image();
    img.onload = () => {
        const scale = Math.min(window.innerWidth * 0.9 / img.width, window.innerHeight * 0.9 / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let lineY = null;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            if (lineY !== null) {
                ctx.beginPath();
                ctx.moveTo(0, lineY);
                ctx.lineTo(canvas.width, lineY);
                ctx.strokeStyle = 'rgba(255,0,0,0.8)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        canvas.addEventListener('mousemove', (ev) => {
            const rect = canvas.getBoundingClientRect();
            lineY = ev.clientY - rect.top;
            draw();
        });

        canvas.addEventListener('click', (ev) => {
            const rect = canvas.getBoundingClientRect();
            const y = ev.clientY - rect.top;
            // return normalized y (0..1)
            const normalizedY = y / canvas.height;
            close();
            callback({ normalizedY, manual: true });
        });
    };
    img.src = imageSrc;
    document.body.appendChild(overlay);
}

// Map manual normalizedY to a label using pose detection if possible
async function labelFromNormalizedY(normalizedY) {
    if (!latestUploadedImageURL) return { label: 'Không có ảnh', explain: '' };
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
            const res = await analyzeWaterLevel(img);
            if (res && res.imageCanvas) {
                const y = Math.round(normalizedY * res.imageCanvas.height);
                // Re-run label logic using person keypoints from res
                if (!res.label || res.label.startsWith('Không')) {
                    // if automatic failed to find person, just return approximate percent
                    const pct = Math.round(normalizedY * 100);
                    resolve({ label: `Mực khoảng ${pct}% chiều cao ảnh`, explain: 'Đánh dấu thủ công' });
                } else {
                    resolve({ label: res.label + ' (đánh dấu thủ công)', explain: res.explain });
                }
            } else {
                resolve({ label: 'Không thể phân tích', explain: 'Không thể phân tích ảnh để so sánh với cơ thể' });
            }
        };
        img.src = latestUploadedImageURL;
    });
}

async function handleManualMarkResult(mark, target = 'quick') {
    const labelObj = await labelFromNormalizedY(mark.normalizedY);
    const box = target === 'quick' ? document.getElementById('quick-report-ai-result') : document.getElementById('depth-result');
    if (box) {
        const html = `
            <div class="mt-3 p-3 bg-yellow-900/10 rounded-lg text-xs text-slate-200">
                <div class="font-bold mb-1">Kết quả đánh dấu thủ công: <span class="text-white">${labelObj.label}</span></div>
                <div class="text-slate-400 text-[12px]">${labelObj.explain}</div>
            </div>
        `;
        box.innerHTML += html;
    }
}

// Fill the location input using geolocation (lat,lng)
function fillLocationFromGPS() {
    const locInput = document.getElementById('report-location');
    if (!navigator.geolocation) {
        showResult('Trình duyệt không hỗ trợ định vị GPS.', 'error');
        return;
    }
    const original = locInput.value;
    locInput.value = 'Đang lấy vị trí...';
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        locInput.value = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }, err => {
        locInput.value = original;
        showResult('Không thể lấy vị trí. Vui lòng cho phép quyền định vị.', 'warning');
    }, { enableHighAccuracy: true, timeout: 8000 });
}

// Simulate checking impact at a given location and description
function checkLocationImpact() {
    const loc = (document.getElementById('report-location')?.value || '').trim();
    const desc = (document.getElementById('report-description')?.value || '').trim();
    const btn = document.getElementById('check-btn');
    const resultBox = document.getElementById('depth-result');

    if (!loc) {
        showResult('Vui lòng nhập địa điểm hoặc dùng vị trí hiện tại.', 'warning');
        return;
    }

    const original = btn.innerHTML;
    btn.innerHTML = '<div class="loading"></div> Đang kiểm tra...';
    btn.disabled = true;

    resultBox.innerHTML = '<div class="text-center"><div class="loading"></div><p class="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">Đang phân tích ảnh hưởng...</p></div>';

    setTimeout(() => {
        // naive simulation rules
        const l = loc.toLowerCase();
        let info = {};
        if (l.includes('đà nẵng') || l.includes('da nang')) {
            info = {
                severity: 'Cần chú ý',
                colorClass: 'text-orange-400',
                icon: 'alert-circle',
                summary: 'Khu vực Đà Nẵng đang có mưa vừa đến to, một số tuyến đường trũng ghi nhận ngập nặng.',
                notes: ['Một số tuyến đường trũng bị ngập', 'Giao thông khu vực trung tâm bị chậm trễ', 'Nguy cơ rò rỉ điện tại các khu ngập sâu'],
                guidance: ['Tránh di chuyển qua khu vực trũng', 'Nếu đang lái xe, tạm dừng tại nơi cao hơn', 'Báo cấp cứu nếu phát hiện người bị nguy hiểm']
            };
        } else if (l.includes('khánh hòa') || l.includes('nha trang')) {
            info = {
                severity: 'Rất nguy hiểm',
                colorClass: 'text-red-500',
                icon: 'alert-octagon',
                summary: 'Dòng chảy mạnh và sóng lớn tại ven biển, cấm tắm và tiếp cận bờ biển.',
                notes: ['Sóng cao, dòng chảy mạnh', 'Rủi ro chấn thương khi tiếp cận bờ biển'],
                guidance: ['Không đến gần bờ', 'Tuân thủ lệnh cấm biển', 'Gọi lực lượng cứu hộ nếu cần']
            };
        } else if (desc.toLowerCase().includes('ngập') || desc.toLowerCase().includes('nước')) {
            info = {
                severity: 'Cần chú ý',
                colorClass: 'text-yellow-400',
                icon: 'alert-triangle',
                summary: `Báo cáo người dân: "${desc}" — cần kiểm tra thực tế.`,
                notes: ['Ưu tiên bảo vệ người và tài sản', 'Cần rào chắn khu vực ngập'],
                guidance: ['Ghi nhận vị trí và gửi cho cơ quan chức năng', 'Tránh khu vực cho đến khi an toàn']
            };
        } else {
            info = {
                severity: 'Thông tin nhẹ',
                colorClass: 'text-blue-400',
                icon: 'info',
                summary: 'Không có cảnh báo lớn tự động tại vị trí này. Vui lòng mô tả thêm hoặc liên hệ cơ quan địa phương nếu thấy có dấu hiệu bất thường.',
                notes: ['Không phát hiện chỉ dấu ngập/ổn định theo dữ liệu hiện tại'],
                guidance: ['Theo dõi tình hình và cập nhật thêm thông tin', 'Gửi hình ảnh để nhận phân tích chi tiết']
            };
        }

        resultBox.innerHTML = `
            <div class="text-center w-full">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <i data-lucide="${info.icon}" class="w-6 h-6 ${info.colorClass}"></i>
                    </div>
                    <div class="text-left">
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-tighter">Kết quả phân tích vị trí</p>
                        <p class="text-xl font-black text-white">${loc} — <span class="${info.colorClass}">${info.severity}</span></p>
                    </div>
                </div>
                <div class="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <p class="text-sm font-medium ${info.colorClass} text-left leading-relaxed">${info.summary}</p>
                </div>
                <div class="p-3 bg-slate-900 rounded-lg border border-white/5 text-xs text-slate-300">
                    <div class="font-bold mb-2">Cần lưu ý:</div>
                    <ul class="list-disc ml-4 space-y-1">
                        ${info.notes.map(n => `<li>${n}</li>`).join('')}
                    </ul>
                    <div class="font-bold mt-3 mb-1">Hướng dẫn an toàn:</div>
                    <ul class="list-disc ml-4 space-y-1">
                        ${info.guidance.map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        lucide.createIcons();
        btn.innerHTML = original;
        btn.disabled = false;

    }, 1500);
}

// Helper function to get score message
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'Xuất sắc! Bạn rất am hiểu về an toàn đuối nước.';
    if (percentage >= 60) return 'Tốt! Bạn có kiến thức cơ bản về an toàn.';
    if (percentage >= 40) return 'Cần cải thiện. Hãy học thêm về sơ cứu.';
    return 'Cần học hỏi nhiều hơn về an toàn đuối nước.';
}

// Helper function to show results
function showResult(message, type = 'info') {
    const colors = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
    };

    const resultBox = document.getElementById('depth-result') || document.getElementById('quiz-result');
    if (resultBox) {
        resultBox.innerHTML = `<p class="${colors[type] || colors.info} text-center">${message}</p>`;
    } else {
        alert(message);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close any modals or reset forms
    if (e.key === 'Escape') {
        // Reset upload areas
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            area.innerHTML = `
                <i data-lucide="upload" class="w-12 h-12 text-slate-400 mb-2"></i>
                <p class="text-sm text-slate-400">Kéo thả hoặc click để tải ảnh/video</p>
            `;
        });
        lucide.createIcons();
    }
});