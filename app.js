(() => {
  'use strict';

  const BASE_TITLE = 'Pomodoro';
  const MODE_META = {
    work: { label: 'Trabajo', short: 'Trabajo' },
    short: { label: 'Descanso corto', short: 'Corto' },
    long: { label: 'Descanso largo', short: 'Largo' },
  };
  const METHODS = {
    classic: { name: 'Clásico', work: 25, short: 5, long: 15, longEvery: 4 },
    rule5217: { name: 'Regla 52/17', work: 52, short: 17, long: 17, longEvery: 2 },
    deep: { name: 'Trabajo profundo', work: 90, short: 20, long: 30, longEvery: 2 },
    extended: { name: 'Extendido', work: 50, short: 10, long: 20, longEvery: 3 },
  };
  const RING_RADIUS = 130;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const els = {
    time: document.getElementById('time'),
    ringProgress: document.getElementById('ring-progress'),
    start: document.getElementById('btn-start'),
    pause: document.getElementById('btn-pause'),
    reset: document.getElementById('btn-reset'),
    methodSelect: document.getElementById('method-select'),
    modeButtons: Array.from(document.querySelectorAll('.mode-btn')),
    status: document.getElementById('status'),
    cycleCount: document.getElementById('cycle-count'),
    card: document.querySelector('.card'),
  };

  let methodKey = 'classic';
  let mode = 'work';
  let remaining = 0;
  let running = false;
  let endAt = 0;
  let tickerId = null;
  let titleAlertId = null;
  let completedPomodoros = 0;
  let audioContext = null;

  function currentMethod() {
    return METHODS[methodKey];
  }

  function getDuration(modeKey) {
    return currentMethod()[modeKey] * 60;
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function render() {
    els.time.textContent = formatTime(remaining);
    const fraction = remaining / getDuration(mode);
    els.ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    els.ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
    if (!titleAlertId) {
      document.title = `${formatTime(remaining)} · ${MODE_META[mode].label} — ${BASE_TITLE}`;
    }
  }

  function updateControls() {
    els.start.disabled = running;
    els.pause.disabled = !running;
    els.reset.disabled = !running && remaining === getDuration(mode);
  }

  function updateModeLabels() {
    els.modeButtons.forEach((btn) => {
      const key = btn.dataset.modeKey;
      btn.textContent = `${MODE_META[key].short} · ${currentMethod()[key]}`;
    });
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
      remaining = getDuration(mode);
    }
    running = true;
    endAt = Date.now() + remaining * 1000;
    tickerId = setInterval(tick, 200);
    announce(`${MODE_META[mode].label} en curso.`);
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
    remaining = getDuration(mode);
    announce(`${MODE_META[mode].label} reiniciado a ${formatTime(remaining)}.`);
    updateControls();
    render();
  }

  function finishPhase() {
    stopTicker();
    running = false;
    playAlert();
    pulseCard();
    const finishedLabel = MODE_META[mode].label;
    if (mode === 'work') {
      completedPomodoros += 1;
      els.cycleCount.textContent = String(completedPomodoros);
      setMode(completedPomodoros % currentMethod().longEvery === 0 ? 'long' : 'short');
    } else {
      setMode('work');
    }
    announce(`${finishedLabel} finalizado. ${MODE_META[mode].label} (${formatTime(getDuration(mode))}) preparado.`);
    startTitleAlert(`⏰ ¡${finishedLabel} terminado!`);
    updateControls();
  }

  function setMode(modeKey) {
    mode = modeKey;
    stopTicker();
    running = false;
    remaining = getDuration(modeKey);
    document.body.dataset.mode = modeKey;
    els.modeButtons.forEach((btn) => {
      const active = btn.dataset.modeKey === modeKey;
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
        : `${formatTime(remaining)} · ${MODE_META[mode].label} — ${BASE_TITLE}`;
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

  els.methodSelect.addEventListener('change', () => {
    stopTicker();
    stopTitleAlert();
    running = false;
    methodKey = els.methodSelect.value;
    document.body.dataset.method = methodKey;
    updateModeLabels();
    setMode('work');
    const method = currentMethod();
    announce(`Método ${method.name}: ${method.work} min de trabajo, ${method.short} de descanso corto y ${method.long} de descanso largo (cada ${method.longEvery} pomodoros).`);
  });

  els.modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      stopTitleAlert();
      const key = btn.dataset.modeKey;
      if (key === mode && !running && remaining === getDuration(key)) return;
      setMode(key);
      announce(`${MODE_META[key].label}: ${formatTime(getDuration(key))} listos.`);
    });
  });

  document.body.dataset.method = methodKey;
  updateModeLabels();
  setMode('work');
  announce('Listo para comenzar.');
})();
