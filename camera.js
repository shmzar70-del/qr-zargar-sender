// =====================================================
// فایل: camera.js
// مدیریت دوربین و اسکن QR کد
// =====================================================

// ✅ وقتی صفحه کامل بارگذاری شد، اجرا کن
document.addEventListener('DOMContentLoaded', function() {

    // المنت‌های صفحه
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const resultDiv = document.getElementById('qr-result');
    const context = canvas.getContext('2d');

    let scanning = false;
    let stream = null;

    // 1️⃣ شروع دوربین
    function startCamera() {
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // دوربین عقب
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        })
        .then(function(mediaStream) {
            stream = mediaStream;
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            console.log('✅ دوربین روشن شد');
            startScanning();
        })
        .catch(function(err) {
            console.error('❌ خطای دوربین:', err);
            alert('❌ دسترسی به دوربین ممکن نیست. لطفاً مجوز را بررسی کنید.');
            showMessage('❌ دسترسی به دوربین ممکن نیست', 'error');
        });
    }

    // 2️⃣ شروع اسکن
    function startScanning() {
        scanning = true;
        scanLoop();
    }

    // 3️⃣ حلقه اسکن
    function scanLoop() {
        if (!scanning) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // اگر کتابخانه jsQR موجود است
            if (typeof jsQR !== 'undefined') {
                try {
                    const code = jsQR(imageData.data, canvas.width, canvas.height, {
                        inversionAttempts: 'dontInvert'
                    });

                    if (code && code.data) {
                        scanning = false;
                        showMessage('✅ کد پیدا شد: ' + code.data, 'success');
                        stopCamera();
                    }
                } catch (e) {
                    // خطا در اسکن
                }
            } else {
                console.warn('⚠️ کتابخانه jsQR پیدا نشد');
            }
        }

        if (scanning) {
            setTimeout(scanLoop, 500);
        }
    }

    // 4️⃣ نمایش پیام در صفحه
    function showMessage(text, type) {
        if (resultDiv) {
            const color = type === 'success' ? '#4CAF50' : '#f44336';
            resultDiv.innerHTML = `
                <div style="background:${color};color:white;padding:15px;border-radius:8px;text-align:center;margin:10px 0;">
                    ${text}
                    <br>
                    <button onclick="location.reload()" style="margin-top:10px;padding:8px 20px;background:#fff;color:#333;border:none;border-radius:5px;cursor:pointer;">
                        اسکن دوباره
                    </button>
                </div>
            `;
        } else {
            alert(text);
        }
    }

    // 5️⃣ توقف دوربین
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        scanning = false;
    }

    // 6️⃣ شروع فرآیند
    if (typeof jsQR === 'undefined') {
        console.error('❌ jsQR پیدا نشد');
        showMessage('❌ کتابخانه jsQR بارگذاری نشده است', 'error');
    } else {
        startCamera();
    }

    // 7️⃣ وقتی صفحه بسته می‌شود، دوربین را خاموش کن
    window.addEventListener('beforeunload', function() {
        stopCamera();
    });

});