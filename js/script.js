/**
 * ==============================================================================
 * PÁGINA WEB DE ANIVERSARIO - 4 AÑOS CONTIGO ❤️
 * Script Principal: Animaciones, Contador, Lightbox, Música y Sorpresas
 * ==============================================================================
 */

// ==============================================================================
// 1. CONFIGURACIÓN CENTRALIZADA (DATOS REALES DE NUESTRA HISTORIA)
// ==============================================================================
const ANNIVERSARY_CONFIG = {
  // Fecha exacta de inicio de la relación: 16 de septiembre de 2022 (desde el inicio del día)
  startDate: "2022-09-16T00:00:00",

  // Fecha exacta de desbloqueo: 16 de septiembre de 2026 a las 00:00:00
  unlockDate: "2026-09-16T00:00:00",

  // Nombres
  partnerName: "Karen Johanna Laverde Fonseca",
  yourName: "Mi Amor",

  // Canción de Andrés Cepeda
  songTitle: "Por el resto de mi vida — Andrés Cepeda",
  songPath: "assets/music/por-el-resto-de-mi-vida.mp3"
};

// ==============================================================================
// 2. INICIALIZACIÓN AL CARGAR EL DOM
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initAmbientCanvas();
  initLockSystem();
  initScrollReveal();
  initNavSpy();
  initLiveCounter();
  initGalleryLightbox();
  initGalleryExpand();
  initSurpriseModal();
  initSmoothScroll();
  initServiceWorker();
});

// ==============================================================================
// 2.1. SISTEMA DE BLOQUEO TEMPORAL HASTA EL 16 DE SEPTIEMBRE DE 2026
// ==============================================================================
let isAppLocked = false;
let lockIntervalId = null;

function parseUnlockDate(dateStr) {
  // Compatible con todos los navegadores móviles (iOS Safari, Chrome, etc.)
  const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (parts) {
    return new Date(
      parseInt(parts[1], 10),
      parseInt(parts[2], 10) - 1, // Mes base 0 (8 = Septiembre)
      parseInt(parts[3], 10),
      parseInt(parts[4], 10),
      parseInt(parts[5], 10),
      parseInt(parts[6], 10)
    );
  }
  return new Date(dateStr);
}

function initLockSystem() {
  const lockScreen = document.getElementById("lockScreen");
  const lockDays = document.getElementById("lockDays");
  const lockHours = document.getElementById("lockHours");
  const lockMinutes = document.getElementById("lockMinutes");
  const lockSeconds = document.getElementById("lockSeconds");

  if (!lockScreen) return;

  const targetDate = parseUnlockDate(ANNIVERSARY_CONFIG.unlockDate);
  const now = new Date();

  // Comprobar si ya es 16 de septiembre de 2026 a las 00:00:00 o posterior
  if (now >= targetDate) {
    // ESTADO DESBLOQUEADO: Acceso total directo a la historia
    lockScreen.classList.add("unlocked");
    document.body.classList.remove("is-locked");
    isAppLocked = false;
    initMusicPlayer();
    return;
  }

  // ESTADO BLOQUEADO: Proteger la experiencia hasta el 16 de septiembre de 2026 00:00:00
  isAppLocked = true;
  document.body.classList.add("is-locked");
  lockScreen.classList.remove("unlocked", "unlocking");

  function updateLockCountdown() {
    const currentNow = new Date();
    const diff = targetDate - currentNow;

    if (diff <= 0) {
      // Desbloqueo automático al llegar al segundo cero
      if (lockIntervalId) {
        clearInterval(lockIntervalId);
        lockIntervalId = null;
      }
      triggerUnlockSequence();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (lockDays) lockDays.textContent = String(days).padStart(2, "0");
    if (lockHours) lockHours.textContent = String(hours).padStart(2, "0");
    if (lockMinutes) lockMinutes.textContent = String(minutes).padStart(2, "0");
    if (lockSeconds) lockSeconds.textContent = String(seconds).padStart(2, "0");
  }

  // Ejecutar inmediatamente para evitar saltos y luego cada segundo exacto
  if (window._criticalLockInterval) {
    clearInterval(window._criticalLockInterval);
    window._criticalLockInterval = null;
  }
  if (lockIntervalId) {
    clearInterval(lockIntervalId);
  }
  updateLockCountdown();
  lockIntervalId = setInterval(updateLockCountdown, 1000);
}

function triggerUnlockSequence() {
  const lockScreen = document.getElementById("lockScreen");
  isAppLocked = false;

  if (lockIntervalId) {
    clearInterval(lockIntervalId);
    lockIntervalId = null;
  }
  if (window._criticalLockInterval) {
    clearInterval(window._criticalLockInterval);
    window._criticalLockInterval = null;
  }

  // 1. Desbloquear scroll y mostrar secciones principales
  document.body.classList.remove("is-locked");

  // 2. Transición elegante con fade-out de la pantalla de bloqueo
  if (lockScreen) {
    lockScreen.classList.add("unlocking");
    setTimeout(() => {
      lockScreen.classList.add("unlocked");
    }, 1200);
  }

  // 3. Celebrar con lluvia de corazones
  if (typeof triggerHeartConfetti === "function") {
    triggerHeartConfetti();
  }

  // 4. Iniciar música según configuración (autoplay / fallback en interacción)
  initMusicPlayer();
}

window.triggerUnlockSequence = triggerUnlockSequence;

// ==============================================================================
// 3. LIENZO INTERACTIVO DE CORAZONES Y ESTRELLAS (CANVAS)
// ==============================================================================
function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const totalParticles = window.innerWidth < 768 ? 25 : 45;

  // Clase para cada partícula flotante (Corazón o Estrella)
  class FloatingParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Iniciar en posiciones aleatorias
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.size = Math.random() * 12 + 6;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.isHeart = Math.random() > 0.4; // 60% corazones, 40% estrellas
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
    }

    update() {
      this.y -= this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;

      if (this.isHeart) {
        // Dibujar un corazón suave con curvas Bézier
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, (this.size + topCurveHeight) / 1.4, 0, this.size);
        ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 1.4, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        // Dibujar un destello / estrella brillante
        ctx.fillStyle = "#fdf0d5";
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Destello en cruz
        ctx.fillRect(-this.size * 0.4, -0.5, this.size * 0.8, 1);
        ctx.fillRect(-0.5, -this.size * 0.4, 1, this.size * 0.8);
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new FloatingParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

// ==============================================================================
// 4. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER)
// ==============================================================================
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((el) => revealObserver.observe(el));
}

// ==============================================================================
// 5. NAVEGACIÓN ACTIVA SEGÚN SCROLL (NAV SPY)
// ==============================================================================
function initNavSpy() {
  const sections = document.querySelectorAll("header[id], section[id]");
  const navDots = document.querySelectorAll(".floating-nav .nav-dot");

  window.addEventListener("scroll", () => {
    let current = "";
    const scrollPos = window.pageYOffset + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute("id");
      }
    });

    navDots.forEach((dot) => {
      dot.classList.remove("active");
      if (dot.getAttribute("href") === `#${current}`) {
        dot.classList.add("active");
      }
    });
  });
}

// ==============================================================================
// 6. CONTADOR DE 4 AÑOS EN TIEMPO REAL
// ==============================================================================
function initLiveCounter() {
  const clockDays = document.getElementById("clockDays");
  const clockHours = document.getElementById("clockHours");
  const clockMinutes = document.getElementById("clockMinutes");
  const clockSeconds = document.getElementById("clockSeconds");

  const statDays = document.getElementById("statDays");
  const statMonths = document.getElementById("statMonths");
  const statYears = document.getElementById("statYears");

  // Si no se ha configurado la fecha exacta todavía, mostramos el hito base de 4 años
  if (!ANNIVERSARY_CONFIG.startDate) {
    if (clockDays) clockDays.textContent = "1460";
    if (clockHours) clockHours.textContent = "00";
    if (clockMinutes) clockMinutes.textContent = "00";
    if (clockSeconds) clockSeconds.textContent = "00";
    if (statDays) statDays.textContent = "1460";
    return;
  }

  const startDate = new Date(ANNIVERSARY_CONFIG.startDate);

  function updateClock() {
    const now = new Date();
    const diff = now - startDate;

    if (diff < 0) {
      if (clockDays) clockDays.textContent = "1460";
      if (clockHours) clockHours.textContent = "00";
      if (clockMinutes) clockMinutes.textContent = "00";
      if (clockSeconds) clockSeconds.textContent = "00";
      return;
    }

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (clockDays) clockDays.textContent = totalDays.toLocaleString();
    if (clockHours) clockHours.textContent = String(hours).padStart(2, "0");
    if (clockMinutes) clockMinutes.textContent = String(minutes).padStart(2, "0");
    if (clockSeconds) clockSeconds.textContent = String(seconds).padStart(2, "0");

    if (statDays && totalDays > 0) {
      statDays.textContent = totalDays.toLocaleString();
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ==============================================================================
// 7. GALERÍA CON VISOR LIGHTBOX (CON SOPORTE DE IMÁGENES REALES)
// ==============================================================================
function initGalleryLightbox() {
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDesc = document.getElementById("lightboxDesc");
  const lightboxCaptionText = document.getElementById("lightboxCaptionText");
  const lightboxImgBox = document.getElementById("lightboxImgBox");

  if (!lightboxModal) return;

  // Delegación de eventos para tarjetas presentes y expandidas dinámicamente
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".gallery-card, .memory-card");
    if (!card) return;

    const title = card.getAttribute("data-title") || "Recuerdo Especial";
    const desc = card.getAttribute("data-desc") || "";
    const imgSrc = card.getAttribute("data-img");

    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;
    if (lightboxCaptionText) lightboxCaptionText.textContent = title;

    if (lightboxImgBox) {
      if (imgSrc) {
        lightboxImgBox.innerHTML = `<img src="${imgSrc}" class="lightbox-real-img" alt="${title}">`;
      } else {
        lightboxImgBox.innerHTML = `
          <div class="lightbox-placeholder-view">
            <span class="lightbox-icon">📸</span>
            <h4>${title}</h4>
            <p>${desc}</p>
          </div>`;
      }
    }

    lightboxModal.classList.add("active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  function closeLightbox() {
    lightboxModal.classList.remove("active");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener("click", closeLightbox);
  }

  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxModal.classList.contains("active")) {
      closeLightbox();
    }
  });
}

// ==============================================================================
// 7.1. CONTROLADOR DE EXPANSIÓN DE GALERÍA ("VER MÁS RECUERDOS")
// ==============================================================================
function initGalleryExpand() {
  const expandBtn = document.getElementById("galleryExpandBtn");
  const extraContainer = document.getElementById("galleryExtraContainer");

  if (!expandBtn || !extraContainer) return;

  expandBtn.addEventListener("click", () => {
    const isExpanded = extraContainer.classList.contains("expanded");
    if (isExpanded) {
      extraContainer.classList.remove("expanded");
      expandBtn.innerHTML = `<span>Ver todos nuestros recuerdos (Colección completa ❤️)</span> <span>⬇️</span>`;
      // Scroll suave de regreso al inicio de la galería
      const galeriaSection = document.getElementById("galeria");
      if (galeriaSection) {
        galeriaSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      extraContainer.classList.add("expanded");
      expandBtn.innerHTML = `<span>Ver menos recuerdos ✨</span> <span>⬆️</span>`;
    }
  });
}

// ==============================================================================
// 8. MODAL DE SORPRESA FINAL & EXPLOSIÓN DE CORAZONES
// ==============================================================================
function initSurpriseModal() {
  const openSurpriseBtn = document.getElementById("openSurpriseBtn");
  const closeSurpriseBtn = document.getElementById("closeSurpriseBtn");
  const surpriseModal = document.getElementById("surpriseModal");
  const modalHeartBurstBtn = document.getElementById("modalHeartBurstBtn");

  if (!surpriseModal || !openSurpriseBtn) return;

  function openModal() {
    surpriseModal.classList.add("active");
    surpriseModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    triggerHeartConfetti();
  }

  function closeModal() {
    surpriseModal.classList.remove("active");
    surpriseModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openSurpriseBtn.addEventListener("click", openModal);

  if (closeSurpriseBtn) {
    closeSurpriseBtn.addEventListener("click", closeModal);
  }

  surpriseModal.addEventListener("click", (e) => {
    if (e.target === surpriseModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && surpriseModal.classList.contains("active")) {
      closeModal();
    }
  });

  if (modalHeartBurstBtn) {
    modalHeartBurstBtn.addEventListener("click", () => {
      triggerHeartConfetti();
    });
  }
}

/**
 * Generador de lluvia de corazones festivos
 */
function triggerHeartConfetti() {
  const heartEmojis = ["💖", "❤️", "💕", "✨", "🌸", "🌹", "💍", "🥰"];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-confetti-heart";
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

    // Posición inicial aleatoria
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;

    heart.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      font-size: ${Math.random() * 24 + 16}px;
      z-index: 9999;
      pointer-events: none;
      transition: transform ${Math.random() * 2 + 2}s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2.5s ease;
      opacity: 1;
    `;

    document.body.appendChild(heart);

    // Animación hacia arriba con dispersión
    setTimeout(() => {
      const destX = startX + (Math.random() - 0.5) * 400;
      const destY = -100 - Math.random() * 200;
      const rot = (Math.random() - 0.5) * 720;
      heart.style.transform = `translate(${destX - startX}px, ${destY - startY}px) rotate(${rot}deg)`;
      heart.style.opacity = "0";
    }, 50);

    // Eliminar del DOM al terminar
    setTimeout(() => {
      heart.remove();
    }, 3000);
  }
}

// ==============================================================================
// 9. REPRODUCTOR DE MÚSICA FLOTANTE (AUTOPLAY + FALLBACK EN PRIMERA INTERACCIÓN)
// ==============================================================================
let isMusicPlayerInitialized = false;

function initMusicPlayer() {
  if (isMusicPlayerInitialized) return;
  const musicPlayer = document.getElementById("musicPlayer");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const audioElement = document.getElementById("audioElement");
  const musicTitle = document.getElementById("musicTitle");
  const musicStatus = document.getElementById("musicStatus");

  if (!musicPlayer || !audioElement) return;
  isMusicPlayerInitialized = true;

  // Garantizar la ruta exacta del archivo configurado
  const exactPath = ANNIVERSARY_CONFIG.songPath || "assets/music/por-el-resto-de-mi-vida.mp3";
  if (!audioElement.getAttribute("src")) {
    audioElement.src = exactPath;
  }

  if (musicTitle && ANNIVERSARY_CONFIG.songTitle) {
    musicTitle.textContent = ANNIVERSARY_CONFIG.songTitle;
  }

  let userHasManuallyPaused = false;
  let isPlaybackStarted = false;

  // Sincronización precisa con eventos nativos del elemento de audio
  audioElement.addEventListener("play", () => {
    isPlaybackStarted = true;
    musicPlayer.classList.add("playing");
    if (musicStatus) {
      musicStatus.textContent = "Reproduciendo: Andrés Cepeda";
    }
    removeInteractionListeners();
  });

  audioElement.addEventListener("pause", () => {
    musicPlayer.classList.remove("playing");
    if (musicStatus) {
      musicStatus.textContent = "Pausado";
    }
  });

  audioElement.addEventListener("ended", () => {
    musicPlayer.classList.remove("playing");
    if (musicStatus) {
      musicStatus.textContent = "Nuestra canción ❤️";
    }
  });

  audioElement.addEventListener("error", () => {
    musicPlayer.classList.remove("playing");
    console.warn("Aviso: Comprobando archivo de música en assets/music/");
  });

  // Eventos de usuario para fallback de reproducción en iOS / Safari
  const interactionEvents = ["click", "touchstart", "touchend", "scroll", "keydown"];

  function onFirstInteraction() {
    if (isPlaybackStarted || userHasManuallyPaused) {
      removeInteractionListeners();
      return;
    }

    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaybackStarted = true;
          removeInteractionListeners();
        })
        .catch(() => {
          // Si el navegador requiere interacción táctil directa en vez de scroll
        });
    }
  }

  function addInteractionListeners() {
    interactionEvents.forEach((ev) => {
      window.addEventListener(ev, onFirstInteraction, { passive: true, capture: true });
    });
  }

  function removeInteractionListeners() {
    interactionEvents.forEach((ev) => {
      window.removeEventListener(ev, onFirstInteraction, { capture: true });
    });
  }

  // 1. Intento de Autoplay inmediato al cargar la página
  function attemptAutoplay() {
    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaybackStarted = true;
          removeInteractionListeners();
        })
        .catch(() => {
          // Bloqueado por política de Safari/iOS/navegador: activar fallback transparente
          addInteractionListeners();
        });
    }
  }

  attemptAutoplay();

  // Función para alternar reproducción y pausa manual desde el reproductor
  function toggleMusic(e) {
    if (e) {
      e.stopPropagation();
    }

    if (audioElement.paused) {
      userHasManuallyPaused = false;
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("No se pudo reanudar el audio:", error);
        });
      }
    } else {
      userHasManuallyPaused = true;
      removeInteractionListeners();
      audioElement.pause();
    }
  }

  // Evento al pulsar el botón circular de música
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener("click", toggleMusic);
  }

  // Evento al pulsar en cualquier parte de la píldora flotante
  musicPlayer.addEventListener("click", (e) => {
    if (e.target.closest("#musicToggleBtn")) return;
    toggleMusic(e);
  });
}

// ==============================================================================
// 10. SCROLL SUAVE PARA BOTÓN DE LA PORTADA
// ==============================================================================
function initSmoothScroll() {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("historia");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// ==============================================================================
// 11. REGISTRO DE SERVICE WORKER PARA PWA (IPHONE Y ANDROID)
// ==============================================================================
function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          console.info("PWA Service Worker registrado:", registration.scope);
          registration.update();
        })
        .catch((error) => {
          console.warn("Service Worker PWA no disponible:", error);
        });
    });
  }
}

