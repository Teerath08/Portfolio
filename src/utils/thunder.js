// Thunder and Lightning Navigation Utility
let thunderListeners = [];

export function subscribeToThunder(listener) {
  thunderListeners.push(listener);
  return () => {
    thunderListeners = thunderListeners.filter((l) => l !== listener);
  };
}

// Butter-smooth cinematic scrolling engine with quintic deceleration
export function smoothScrollTo(targetY, duration = 850) {
  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();
  const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);

  let isCancelled = false;
  const onUserInterrupt = () => {
    isCancelled = true;
    window.removeEventListener("wheel", onUserInterrupt);
    window.removeEventListener("touchstart", onUserInterrupt);
  };
  window.addEventListener("wheel", onUserInterrupt, { passive: true });
  window.addEventListener("touchstart", onUserInterrupt, { passive: true });

  function step(currentTime) {
    if (isCancelled) return;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeOutQuint(progress);

    window.scrollTo(0, Math.round(startY + distance * ease));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      window.removeEventListener("wheel", onUserInterrupt);
      window.removeEventListener("touchstart", onUserInterrupt);
    }
  }

  requestAnimationFrame(step);
}

// Gentle, realistic procedural Web Audio thunder synthesizer
export function playThunderAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const duration = 0.9;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate lightning crackle and low rolling rumble
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const crackle = (Math.random() * 2 - 1) * Math.exp(-t * 18);
      const rumble = (Math.random() * 2 - 1) * Math.exp(-t * 2.5);
      data[i] = crackle * 0.45 + rumble * 0.55;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Resonant low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
  } catch (err) {
    // Graceful fallback if audio is not permitted by browser
  }
}

/**
 * Triggers a thunder lightning strike and smoothly glides to the target section
 * @param {string} targetId - ID of section without '#' (e.g. 'about', 'skills')
 * @param {MouseEvent|{clientX: number, clientY: number}} [e] - Click event or coordinate
 */
export function triggerThunderNav(targetId, e = null) {
  const cleanId = targetId.replace("#", "");
  const targetEl = document.getElementById(cleanId);

  let startCoords = null;
  if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
    startCoords = { x: e.clientX, y: e.clientY };
  } else {
    startCoords = { x: window.innerWidth / 2, y: 40 };
  }

  // Play lightning audio
  playThunderAudio();

  // Notify thunder visual overlay
  thunderListeners.forEach((fn) => fn({ targetId: cleanId, targetEl, startCoords }));

  // Smooth cinematic glide to target
  if (targetEl) {
    const navbarHeight = 75;
    const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

    smoothScrollTo(Math.max(0, targetY), 850);

    // Pulse target heading upon arrival
    setTimeout(() => {
      const heading =
        targetEl.querySelector(".floating-3d-heading") ||
        targetEl.querySelector("h2") ||
        targetEl;
      if (heading) {
        heading.classList.remove("thunder-targeted");
        void heading.offsetWidth; // trigger reflow
        heading.classList.add("thunder-targeted");
        setTimeout(() => heading.classList.remove("thunder-targeted"), 1500);
      }
    }, 600);
  }
}
