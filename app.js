(() => {
  'use strict';

  const BASE_TITLE = 'Pomodoro';
  const MODES = {
    work: { key: 'work', label: 'Trabajo', duration: 25 * 60 },
    break: { key: 'break', label: 'Descanso', duration: 5 * 60 },
  };
  const RING_RADIUS = 130;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const els = {
    time: document.getElementById('time'),
    ringProgress: document.getElementById('ring-progress'),
    start: document.getElementById('btn-start'),
    pause: document.getElementById('btn-pause'),
    reset: document.getElementById('btn-reset'),
    modeButtons: Array.from(document.querySelectorAll('.mode-btn')),
    status: document.getElementById('status'),
    cycleCount: document.getElementById('cycle-count'),
    card: document.querySelector('.card'),
  };

  let mode = MODES.work;
  let remaining = mode.duration;
  let running = false;
  let endAt = 0;
  let tickerId = null;
  let titleAlertId = null;
  let completedPomodoros = 0;
  let audioContext = null;

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function render() {
    els.time.textContent = formatTime(remaining);
    const fraction = remaining / mode.duration;
    els.ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    els.ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
    if (!titleAlertId) {
      document.title = `${formatTime(remaining)} · ${mode.label} — ${BASE_TITLE}`;
    }
  }

  function updateControls() {
    els.start.disabled = running;
    els.pause.disabled = !running;
    els.reset.disabled = !running && remaining === mode.duration;
  }

  function announce(message) {
    els.status.textContent = message;
  }

  function stopTicker() {
    if (tickerId !== null) {
      clearInterval(tickerId);
      tickerId = null;
    }
  }

  function tick() {
    remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    render();
    if (remaining === 0) {
      finishPhase();
    }
  }

  function start() {
    if (running) return;
    ensureAudio();
    stopTitleAlert();
    if (remaining === 0) {
      remaining = mode.duration;
    }
    running = true;
    endAt = Date.now() + remaining * 1000;
    tickerId = setInterval(tick, 200);
    announce(`${mode.label} en curso.`);
    updateControls();
    render();
  }

  function pause() {
    if (!running) return;
    remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    stopTicker();
    running = false;
    announce('Temporizador en pausa.');
    updateControls();
    render();
  }

  function reset() {
    stopTicker();
    stopTitleAlert();
    running = false;
    remaining = mode.duration;
    announce(`${mode.label} reiniciado a ${formatTime(remaining)}.`);
    updateControls();
    render();
  }

  function finishPhase() {
    stopTicker();
    running = false;
    playAlert();
    pulseCard();
    const finishedLabel = mode.label;
    if (mode.key === 'work') {
      completedPomodoros += 1;
      els.cycleCount.textContent = String(completedPomodoros);
    }
    setMode(mode.key === 'work' ? 'break' : 'work');
    announce(`${finishedLabel} finalizado. ${mode.label} (${formatTime(mode.duration)}) preparado.`);
    startTitleAlert(`⏰ ¡${finishedLabel} terminado!`);
    updateControls();
  }

  function setMode(key) {
    mode = MODES[key];
    stopTicker();
    running = false;
    remaining = mode.duration;
    document.body.dataset.mode = key;
    els.modeButtons.forEach((btn) => {
      const active = btn.dataset.modeKey === key;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    render();
    updateControls();
  }

  function pulseCard() {
    els.card.classList.remove('is-completed');
    void els.card.offsetWidth;
    els.card.classList.add('is-completed');
    setTimeout(() => els.card.classList.remove('is-completed'), 1800);
  }

  function startTitleAlert(message) {
    stopTitleAlert();
    let flip = true;
    document.title = message;
    titleAlertId = setInterval(() => {
      flip = !flip;
      document.title = flip
        ? message
        : `${formatTime(remaining)} · ${mode.label} — ${BASE_TITLE}`;
    }, 1200);
  }

  function stopTitleAlert() {
    if (titleAlertId !== null) {
      clearInterval(titleAlertId);
      titleAlertId = null;
    }
  }

  function ensureAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioContext) {
      audioContext = new Ctx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function beep(at, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.setValueAtTime(0.0001, at);
    gain.linearRampToValueAtTime(0.35, at + 0.02);
    gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.05);
  }

  function playAlert() {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const t0 = audioContext.currentTime + 0.05;
    beep(t0, 880, 0.18);
    beep(t0 + 0.28, 880, 0.18);
    beep(t0 + 0.56, 1174.66, 0.32);
  }

  els.start.addEventListener('click', start);
  els.pause.addEventListener('click', pause);
  els.reset.addEventListener('click', reset);

  els.modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      stopTitleAlert();
      const key = btn.dataset.modeKey;
      if (key === mode.key && !running && remaining === mode.duration) return;
      setMode(key);
      announce(`${mode.label}: ${Math.round(mode.duration / 60)} minutos listos.`);
    });
  });

  setMode('work');
  announce('Listo para comenzar.');
})();
