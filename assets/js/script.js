// ===== CONFIGURATION - CHỈNH SỬA THÔNG TIN TẠI ĐÂY =====
const CONFIG = {
  // Tên cô dâu và chú rể
  bride: "",
  groom: "",

  brideGroomTitle: " ❤️ ",

  // Ngày giờ cưới (định dạng: YYYY-MM-DDTHH:MM:SS)
  weddingDate: "2026-01-24T17:00:00",

  // Địa điểm
  venue: "Nhà hàng tiệc cưới Đông Phương",
  address: "",

  // URL Google Maps (thay đổi theo địa chỉ thật)
  mapUrl: "",

  // URL nhạc nền (thay bằng link nhạc của bạn)
  musicUrl: "./assets/music/Ôm Trọn Thương Yêu - Rum.mp3",

  // URL Google Apps Script Web App (sau khi deploy)
  googleSheetsUrl:
    "https://script.google.com/macros/s/AKfycbxXD7BwrL9ZHro_FOoTVrKu4hDjT2Uv2J-w8yyLoauR6M8rH4OYe963rkVKXmuibVSl/exec",

  // ID Google Sheets (lấy từ URL sheets)
  googleSheetsId: "1UTJaIhmdPYQznCw_i29xrv-7Yv-6LuPxgLs83Dt9OdM",

  // Bật/tắt chế độ offline (lưu localStorage khi không kết nối được Sheets)
  offlineMode: true,
};

// Floating Hearts Animation
function createFloatingHearts() {
  const container = document.getElementById("floatingHearts");
  const hearts = ["❤️", "💕", "💖", "💗", "💝"];

  setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + "%";
    heart.style.animationDuration = Math.random() * 5 + 10 + "s";
    heart.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 15000);
  }, 800);
}

// Music Control with Auto-play
let isPlaying = false;
let music;

function initMusicControl() {
  // Create audio element
  music = document.createElement("audio");
  music.loop = true;
  music.volume = 0.3;
  // Replace with your music URL
  music.src = CONFIG.musicUrl;
  document.body.appendChild(music);

  const musicControl = document.getElementById("musicControl");
  const musicIcon = document.getElementById("musicIcon");

  // Try auto-play
  forceAutoPlay(musicIcon);

  // Toggle music on click
  musicControl.addEventListener("click", () => {
    if (isPlaying) {
      music.pause();
      musicIcon.textContent = "🎵";
      isPlaying = false;
      showToast("Đã tắt nhạc nền");
    } else {
      music
        .play()
        .then(() => {
          musicIcon.textContent = "⏸️";
          isPlaying = true;
          showToast("Đang phát nhạc nền");
        })
        .catch((e) => {
          console.log("Cannot play music:", e);
          showToast("Không thể phát nhạc nền");
        });
    }
  });

  // Keyboard support
  musicControl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      musicControl.click();
    }
  });
}

function forceAutoPlay(musicIcon) {
  // Method 1: Try direct play immediately
  const playPromise = music.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Auto-play successful
        isPlaying = true;
        musicIcon.textContent = "⏸️";
      })
      .catch((error) => {
        // Method 2: Play on FIRST interaction of ANY type
        const playOnInteraction = () => {
          music
            .play()
            .then(() => {
              isPlaying = true;
              musicIcon.textContent = "⏸️";
            })
            .catch((e) => console.log("Play error:", e));
        };

        // Add one-time listeners for any interaction
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("touchstart", playOnInteraction, {
          once: true,
        });
        document.addEventListener("keydown", playOnInteraction, { once: true });
        document.addEventListener("scroll", playOnInteraction, {
          once: true,
          passive: true,
        });
      });
  }
}

// Music Control (Old - Remove this section)
const musicControl = document.getElementById("musicControl");
const musicIcon = document.getElementById("musicIcon");

// Scroll Up Button
const scrollUpBtn = document.getElementById("scrollUp");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    scrollUpBtn.classList.add("show");
  } else {
    scrollUpBtn.classList.remove("show");
  }
});

scrollUpBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// // RSVP Form
// document.getElementById("rsvpForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const formData = {
//     name: document.getElementById("name").value,
//     phone: document.getElementById("phone").value,
//     message: document.getElementById("message").value,
//     guests: document.getElementById("guests").value,
//     timestamp: new Date().toISOString(),
//   };

//   // Save to localStorage
//   const rsvps = JSON.parse(localStorage.getItem("wedding-rsvps") || "[]");
//   rsvps.push(formData);
//   localStorage.setItem("wedding-rsvps", JSON.stringify(rsvps));

//   showToast("✨ Cảm ơn bạn đã xác nhận tham dự! 💕");
//   this.reset();
// });

// ===== RSVP FORM =====
function initRSVPForm() {
  const rsvpForm = document.getElementById("rsvpForm");
  if (!rsvpForm) {
    console.warn("RSVP form not found");
    return;
  }

  rsvpForm.addEventListener("submit", handleRSVPSubmit);
}

// Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// ===== CẬP NHẬT HÀM XỬ LÝ RSVP =====
async function handleRSVPSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Disable button và hiển thị loading
  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ Đang gửi...";

  const formData = new FormData(e.target);
  const rsvpData = {
    name: formData.get("name")?.trim(),
    phone: formData.get("phone")?.trim(),
    count: formData.get("guests"),
    message: formData.get("message")?.trim(),
    timestamp: new Date().toISOString(),
    ip: await getUserIP(),
  };

  // Validate required fields
  if (!rsvpData.name || !rsvpData.phone) {
    showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
    resetSubmitButton(submitBtn, originalBtnText);
    return;
  }

  // Validate phone number
  // const phoneRegex = /^[0-9]{10,11}$/;
  // if (!phoneRegex.test(rsvpData.phone)) {
  //   showToast("Số điện thoại không hợp lệ!", "error");
  //   resetSubmitButton(submitBtn, originalBtnText);
  //   return;
  // }

  try {
    // Gửi đến Google Sheets
    const success = await sendToGoogleSheets(rsvpData);

    if (success) {
      // Lưu backup vào localStorage
      saveToLocalStorage(rsvpData);

      showToast("✅ Cảm ơn bạn đã xác nhận tham dự!", "success");
      e.target.reset();

      // Analytics tracking (optional)
      trackRSVPSubmission(rsvpData);
    } else {
      throw new Error("Không thể gửi đến Google Sheets");
    }
  } catch (error) {
    console.error("RSVP submission error:", error);

    if (CONFIG.offlineMode) {
      // Lưu vào localStorage nếu offline
      saveToLocalStorage(rsvpData);
      showToast("⚠️ Đã lưu tạm thời. Sẽ đồng bộ khi có mạng!", "warning");
      e.target.reset();
    } else {
      showToast("❌ Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
  } finally {
    resetSubmitButton(submitBtn, originalBtnText);
  }
}

// ===== FUNCTION GỬI DỮ LIỆU ĐẾN GOOGLE SHEETS =====
async function sendToGoogleSheets(data) {
  try {
    const response = await fetch(CONFIG.googleSheetsUrl, {
      method: "POST",
      mode: "no-cors", // Important for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // no-cors mode không trả về response, assume success
    return true;
  } catch (error) {
    console.error("Google Sheets error:", error);

    // Fallback: thử gửi qua GET method
    try {
      const params = new URLSearchParams({
        name: data.name,
        phone: data.phone,
        count: data.count,
        message: data.message,
        timestamp: data.timestamp,
      });

      await fetch(`${CONFIG.googleSheetsUrl}?${params}`, {
        method: "GET",
        mode: "no-cors",
      });

      return true;
    } catch (fallbackError) {
      console.error("Fallback method failed:", fallbackError);
      return false;
    }
  }
}

// ===== FUNCTION LƯU VÀO LOCALSTORAGE =====
function saveToLocalStorage(data) {
  try {
    const existingRSVPs = JSON.parse(
      localStorage.getItem("wedding-rsvps") || "[]"
    );
    existingRSVPs.push({
      ...data,
      synced: false,
      localId: Date.now(),
    });
    localStorage.setItem("wedding-rsvps", JSON.stringify(existingRSVPs));
  } catch (error) {
    console.error("localStorage save error:", error);
  }
}

// ===== FUNCTION LẤY IP ADDRESS =====
async function getUserIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    return data.ip;
  } catch (error) {
    return "Unknown";
  }
}

// ===== FUNCTION RESET NÚT SUBMIT =====
function resetSubmitButton(button, originalText) {
  button.disabled = false;
  button.textContent = originalText;
}

// ===== CẬP NHẬT FUNCTION TOAST VỚI LOẠI THÔNG BÁO =====
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) {
    alert(message);
    return;
  }

  // Xóa class cũ
  toast.className = "toast";

  // Thêm class theo loại
  switch (type) {
    case "success":
      toast.classList.add("toast-success");
      break;
    case "error":
      toast.classList.add("toast-error");
      break;
    case "warning":
      toast.classList.add("toast-warning");
      break;
  }

  toastMessage.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// ===== FUNCTION ĐỒNG BỘ DỮ LIỆU OFFLINE =====
async function syncOfflineData() {
  try {
    const offlineData = JSON.parse(
      localStorage.getItem("wedding-rsvps") || "[]"
    );
    const unsyncedData = offlineData.filter((item) => !item.synced);

    if (unsyncedData.length === 0) return;

    let syncedCount = 0;

    for (const data of unsyncedData) {
      const success = await sendToGoogleSheets(data);
      if (success) {
        // Đánh dấu đã sync
        const index = offlineData.findIndex(
          (item) => item.localId === data.localId
        );
        if (index !== -1) {
          offlineData[index].synced = true;
        }
        syncedCount++;
      }
    }

    if (syncedCount > 0) {
      localStorage.setItem("wedding-rsvps", JSON.stringify(offlineData));
      showToast(`🔄 Đã đồng bộ ${syncedCount} dữ liệu offline!`, "success");
    }
  } catch (error) {
    console.error("Sync offline data error:", error);
  }
}

// ===== FUNCTION TRACKING ANALYTICS (TÙY CHỌN) =====
function trackRSVPSubmission(data) {
  // Google Analytics 4 (nếu có)
  if (typeof gtag !== "undefined") {
    gtag("event", "rsvp_submit", {
      custom_parameter_1: "wedding_rsvp",
      value: 1,
    });
  }

  // Facebook Pixel (nếu có)
  if (typeof fbq !== "undefined") {
    fbq("track", "SubmitApplication");
  }
}

// Smooth Scroll for Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  createFloatingHearts();
  initMusicControl();
  initRSVPForm();

  // Add entrance animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeInUp 0.8s ease-out forwards";
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(".profile-card, .calendar-container")
    .forEach((el) => {
      observer.observe(el);
    });
});

// // Album Modal Functionality
// const albumItems = document.querySelectorAll(".album-item");
// const modal = document.getElementById("albumModal");
// const modalImage = document.getElementById("modalImage");
// const modalCaption = document.getElementById("modalCaption");
// const modalClose = document.querySelector(".modal-close");
// const modalPrev = document.querySelector(".modal-prev");
// const modalNext = document.querySelector(".modal-next");

// const albumData = [
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
//   {
//     src: "./assets/images/578792686_4145088262381125_8706124705216850285_n.jpg",
//     caption: "",
//   },
// ];

// let currentIndex = 0;

// function showModal(index) {
//   currentIndex = index;

//   // Get the clicked image element
//   const clickedItem = albumItems[index];
//   const clickedImg = clickedItem.querySelector("img.album-photo");

//   // Create new image element for modal
//   const img = document.createElement("img");
//   img.src = clickedImg.src;
//   img.alt = clickedImg.alt;
//   img.className = "modal-image";

//   // Clear and add to modal
//   modalImage.innerHTML = "";
//   modalImage.appendChild(img);

//   // Update caption
//   const captionText = clickedItem.querySelector(".album-overlay p");
//   modalCaption.textContent = captionText
//     ? captionText.textContent
//     : albumData[index].caption;

//   modal.classList.add("active");
//   document.body.style.overflow = "hidden";
// }

// function closeModal() {
//   modal.classList.remove("active");
//   document.body.style.overflow = "auto";
// }

// function showNext() {
//   currentIndex = (currentIndex + 1) % albumData.length;
//   const img = modalImage.querySelector("img");
//   const imgalbumphoto = modalImage.querySelector("img.album-photo");
//   img.style.opacity = "0";
//   setTimeout(() => {
//     img.src = albumData[currentIndex].src;
//     img.alt = albumData[currentIndex].caption;
//     modalCaption.textContent = albumData[currentIndex].caption;
//     img.style.opacity = "1";
//   }, 100);
// }

// function showPrev() {
//   currentIndex = (currentIndex - 1 + albumData.length) % albumData.length;
//   const img = modalImage.querySelector("img");
//   img.style.opacity = "0";
//   setTimeout(() => {
//     img.src = albumData[currentIndex].src;
//     img.alt = albumData[currentIndex].caption;
//     modalCaption.textContent = albumData[currentIndex].caption;
//     img.style.opacity = "1";
//   }, 200);
// }

// albumItems.forEach((item, index) => {
//   item.addEventListener("click", () => showModal(index));
// });

// modalClose.addEventListener("click", closeModal);
// modalNext.addEventListener("click", showNext);
// modalPrev.addEventListener("click", showPrev);

// // Close modal on background click
// modal.addEventListener("click", (e) => {
//   if (e.target === modal) closeModal();
// });

// // Keyboard navigation
// document.addEventListener("keydown", (e) => {
//   if (modal.classList.contains("active")) {
//     if (e.key === "Escape") closeModal();
//     if (e.key === "ArrowRight") showNext();
//     if (e.key === "ArrowLeft") showPrev();
//   }
// });

// // Image fade transition
// const style = document.createElement("style");
// style.textContent = `
//             .modal-image img {
//                 transition: opacity 0.3s ease;
//             }
//         `;
// document.head.appendChild(style);

// Prevent right-click (optional)
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Image slider
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".dots");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let index = 0;
  let interval;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function showSlide(i) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  }

  function goToSlide(i) {
    index = i;
    showSlide(index);
    restartAutoPlay();
  }

  // Auto play
  function startAutoPlay() {
    interval = setInterval(nextSlide, 3000);
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Button events
  nextBtn.addEventListener("click", () => {
    nextSlide();
    restartAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    restartAutoPlay();
  });

  // Start slider
  startAutoPlay();
});

// ===== RECENT EDITS IN assets/css/styles.css =====
const popup = document.getElementById("invitePopup");
const overlay = document.getElementById("popupOverlay");
const closeBtn = document.getElementById("closePopup");

function closePopup() {
  popup.classList.remove("show");
  document.getElementById("envelope").classList.remove("open");
}

closeBtn.addEventListener("click", closePopup);

overlay.addEventListener("click", closePopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePopup();
  }
});

// lock scroll
// document.body.style.overflow = "hidden";
// document.body.style.overflow = "";

// envelope.addEventListener("click", () => {
//   envelope.classList.add("open");

//   setTimeout(() => {
//     popup.classList.remove("show");
//     document.body.classList.add("entered");
//   }, 800);
// });

function toggleImage(card) {
    const img = card.querySelector('img');
    const currentSrc = img.src;
    const altSrc = img.getAttribute('data-alt-src');
    
    // Swap the images
    img.src = altSrc;
    img.setAttribute('data-alt-src', currentSrc);
}



