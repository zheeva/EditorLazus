/**
 * CYBERPUNK ASCII & BEAT-SYNC VIDEO GENERATOR
 * Dirancang untuk berjalan 100% di Client-Side Browser Mobile.
 */

// Selektor Elemen DOM
const videoInput = document.getElementById('videoInput');
const audioInput = document.getElementById('audioInput');
const startBtn = document.getElementById('startBtn');
const downloadBtn = document.getElementById('downloadBtn');
const hiddenVideo = document.getElementById('hiddenVideo');
const outputCanvas = document.getElementById('outputCanvas');
const ctx = outputCanvas.getContext('2d');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const statusLabel = document.getElementById('statusLabel');
const videoLabel = document.getElementById('videoLabel');
const audioLabel = document.getElementById('audioLabel');

// State Global Aplikasi
let audioBuffer = null;
let audioUrl = null;
let videoUrl = null;
let isBeatArray = []; // Menyimpan timestamp (detik) deteksi beat
let recordedBlobs = [];
let mediaRecorder = null;
let audioContext = null;

// Konfigurasi Optimasi Performa Mobile (Resolusi Rendah untuk Proses, Output 9:16)
const RENDER_WIDTH = 360;  // Resolusi horizontal rendah agar hemat RAM HP
const RENDER_HEIGHT = 640; // Rasio vertikal 9:16
outputCanvas.width = RENDER_WIDTH;
outputCanvas.height = RENDER_HEIGHT;

// Palet karakter ASCII dari gelap ke terang
const ASCII_CHARS = " .:-=+*#%@";

// Event Listener Input File
videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        videoUrl = URL.createObjectURL(file);
        hiddenVideo.src = videoUrl;
        videoLabel.innerText = `📹 ${file.name.substring(0, 15)}...`;
        checkInputs();
    }
});

audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        audioUrl = URL.createObjectURL(file);
        audioLabel.innerText = `🎵 ${file.name.substring(0, 15)}...`;
        
        // Membaca file audio ke ArrayBuffer untuk analisis Web Audio API
        const reader = new FileReader();
        reader.onload = async function(event) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            statusLabel.innerText = "Menganalisis ketukan musik (Beat)...";
            try {
                audioBuffer = await audioContext.decodeAudioData(event.target.result);
                analyzeBeats(audioBuffer);
                statusLabel.innerText = "Analisis musik selesai. Siap merender!";
                checkInputs();
            } catch (err) {
                statusLabel.innerText = "Gagal menganalisis audio.";
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    }
});

function checkInputs() {
    if (videoUrl && audioBuffer) {
        startBtn.disabled = false;
    }
}

/**
 * ====================================================================
 * BAGIAN 2: LOGIKA WEB AUDIO API & ANALISIS BEAT (BASS DETECTION)
 * ====================================================================
 */
function analyzeBeats(buffer) {
    // Mengekstrak data audio dari channel pertama (Mono)
    const rawData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    
    // Konfigurasi Filter Frekuensi Rendah (Bass: 20Hz - 150Hz)
    // Di lingkungan Client-side murni, kita mengukur magnitudo puncak secara berkala (per 0.05 detik)
    const checkInterval = 0.05; 
    const sampleStep = Math.floor(sampleRate * checkInterval);
    const peaks = [];

    // Mengumpulkan energi puncak di setiap interval waktu
    for (let i = 0; i < rawData.length; i += sampleStep) {
        let max = 0;
        for (let j = 0; j < sampleStep && (i + j) < rawData.length; j++) {
            const val = Math.abs(rawData[i + j]);
            if (val > max) max = val;
        }
        peaks.push({
            time: i / sampleRate,
            energy: max
        });
    }

    // Menentukan Threshold (Ambang batas dinamis untuk deteksi Kick/Beat)
    let sum = 0;
    peaks.forEach(p => sum += p.energy);
    const averageEnergy = sum / peaks.length;
    const threshold = averageEnergy * 1.4; // Faktor pengali 1.4 untuk menyaring ketukan kuat

    // Menyimpan timestamp ketika energi melebihi threshold
    isBeatArray = [];
    for (let i = 1; i < peaks.length; i++) {
        // Deteksi puncak (Thresholding & memastikan nilai saat ini lebih tinggi dari sebelumnya/lokal peak)
        if (peaks[i].energy > threshold && peaks[i].energy > peaks[i-1].energy) {
            // Mencegah deteksi ganda yang terlalu berdekatan (minimal jeda 0.25 detik antar beat)
            if (isBeatArray.length === 0 || (peaks[i].time - isBeatArray[isBeatArray.length - 1]) > 0.25) {
                isBeatArray.push(peaks[i].time);
            }
        }
    }
    console.log("Beat Terdeteksi pada detik:", isBeatArray);
}

/**
 * ====================================================================
 * BAGIAN 2: LOGIKA CANVAS & PROSES ARTIFAK VISUAL (ASCII & BEAT AURA)
 * ====================================================================
 */
startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    downloadBtn.disabled = true;
    progressContainer.style.display = 'block';
    statusLabel.innerText = "Memulai Pemrosesan & Perekaman...";

    // Memastikan video siap diputar dari awal
    hiddenVideo.currentTime = 0;
    
    // Putar audio latar belakang menggunakan AudioContext agar tersinkronisasi murni dengan waktu perekaman
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    
    // Hubungkan audio ke output (Speaker) dan ke Canvas Capture Stream nantinya jika diperlukan
    audioSource.connect(audioContext.destination);
    
    // Setup Media Perekaman (Bagian 3)
    startRecording(audioSource);

    // Jalankan video dan audio secara simultan
    hiddenVideo.play();
    audioSource.start(0);

    // Loop pemrosesan frame demi frame menggunakan requestAnimationFrame
    function renderLoop() {
        if (hiddenVideo.paused || hiddenVideo.ended) {
            // Berhenti jika video habis
            audioSource.stop();
            stopRecording();
            return;
        }

        const currentTime = hiddenVideo.currentTime;
        const duration = hiddenVideo.duration;
        
        // Update status Progress Bar
        const progressPercentage = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        statusLabel.innerText = `Memproses: ${Math.floor(progressPercentage)}%`;

        // 1. Bersihkan canvas dengan latar belakang hitam
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);

        // 2. Deteksi apakah frame saat ini berada di area Timestamp Beat musik
        let hasBeatEffect = false;
        const beatWindow = 0.15; // Efek aura bertahan selama 0.15 detik setelah beat
        for (let i = 0; i < isBeatArray.length; i++) {
            if (currentTime >= isBeatArray[i] && currentTime <= (isBeatArray[i] + beatWindow)) {
                hasBeatEffect = true;
                break;
            }
        }

        // 3. Render Efek Aura Neon di latar belakang jika terdeteksi Beat
        if (hasBeatEffect) {
            ctx.save();
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 8;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#00ffcc';
            
            // Menggambar lingkaran kilatan energi aura radial di tengah canvas
            ctx.beginPath();
            ctx.arc(RENDER_WIDTH / 2, RENDER_HEIGHT / 2, RENDER_WIDTH * 0.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 4. Transformasi Citra Video menjadi Karakter ASCII Art
        // Agar ringan di mobile, kita melakukan sampling piksel per blok ukuran tertentu (Grid)
        const fontGridSize = 6; // Mengambil sample setiap 6 piksel
        ctx.save();
        
        // Buat temporary canvas kecil di memori untuk ekstraksi data piksel dengan performa tinggi
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const sampleW = Math.floor(RENDER_WIDTH / fontGridSize);
        const sampleH = Math.floor(RENDER_HEIGHT / fontGridSize);
        tempCanvas.width = sampleW;
        tempCanvas.height = sampleH;
        
        // Gambar frame video mentah diperkecil ke temporary canvas
        tempCtx.drawImage(hiddenVideo, 0, 0, sampleW, sampleH);
        const imgData = tempCtx.getImageData(0, 0, sampleW, sampleH);
        const pixels = imgData.data;

        // Setelan font teks ASCII
        ctx.font = `${fontGridSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let y = 0; y < sampleH; y++) {
            for (let x = 0; x < sampleW; x++) {
                const index = (y * sampleW + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                // Rumus konversi Luminans Skala Abu-abu (Grayscale)
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

                // Petakan tingkat kecerahan ke karakter ASCII
                const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
                const asciiChar = ASCII_CHARS[charIndex];

                // Berikan warna dinamis (Cyberpunk Neon Green/Aqua jika terang, Magenta jika ada Beat)
                if (hasBeatEffect && brightness > 128) {
                    ctx.fillStyle = '#ff0055'; // Warp warna ke Pink neon saat drop beat
                } else {
                    ctx.fillStyle = `rgb(${Math.floor(brightness*0.2)}, ${brightness}, ${Math.floor(brightness*0.8)})`;
                }

                // Gambar karakter ke layar utama
                ctx.fillText(asciiChar, x * fontGridSize + (fontGridSize/2), y * fontGridSize + (fontGridSize/2));
            }
        }
        ctx.restore();

        // Lanjutkan loop pemrosesan frame berikutnya
        requestAnimationFrame(renderLoop);
    }

    // Jalankan rekursi pemrosesan
    requestAnimationFrame(renderLoop);
});

/**
 * ====================================================================
 * BAGIAN 3: LOGIKA EKSPOR VIDEO (MEDIARECORDER API)
 * ====================================================================
 */
function startRecording(audioSource) {
    recordedBlobs = [];
    
    // 1. Ambil video stream secara real-time dari Canvas dengan target 30 FPS stabilitas mobile
    const canvasStream = outputCanvas.captureStream(30);

    // 2. Ambil audio stream dari AudioContext destination node agar musik ikut terekam bersih
    const dest = audioContext.createMediaStreamDestination();
    audioSource.connect(dest);
    const audioTrack = dest.stream.getAudioTracks()[0];
    
    // Gabungkan visual track dari canvas dan audio track dari musik
    canvasStream.addTrack(audioTrack);

    // 3. Tentukan tipe format video yang didukung browser (Terutama Chrome/Safari Mobile)
    let options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback untuk browser iOS Safari yang condong ke MP4/MPEG
        options = { mimeType: 'video/mp4' };
    }

    try {
        mediaRecorder = new MediaRecorder(canvasStream, options);
    } catch (e) {
        console.error("MediaRecorder gagal diinisialisasi:", e);
        statusLabel.innerText = "Browser tidak mendukung perekaman format ini.";
        return;
    }

    // Kumpulkan potongan data rekaman (chunks)
    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    };

    // Mulai proses penulisan file ke memori internal
    mediaRecorder.start(10); // Simpan per interval 10ms
}

function stopRecording() {
    mediaRecorder.stop();
    
    statusLabel.innerText = "Penyatuan Video Selesai! Siap diunduh.";
    progressBar.style.width = `100%`;
    startBtn.disabled = false;
    downloadBtn.disabled = false;

    // Aksi tombol unduh hasil akhir
    downloadBtn.onclick = () => {
        // Satukan semua chunk menjadi sebuah Blob video utuh
        const blob = new Blob(recordedBlobs, { type: mediaRecorder.mimeType });
        const url = window.URL.createObjectURL(blob);
        
        // Buat tautan unduhan buatan (Virtual Anchor Element)
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `CyberASCII_Anime_${Date.now()}.mp4`; // Output siap tayang di TikTok
        document.body.appendChild(a);
        a.click();
        
        // Hapus objek URL dari memori demi menjaga performa RAM HP
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };
}
