// ------- Estado persistente -------
const STORAGE_KEY = 'alphabet-progress-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { validated: s.validated || [], updatedAt: s.updatedAt || (s.validated && s.validated.length ? 1 : 0) };
    }
  } catch (e) {}
  return { validated: [], updatedAt: 0 };
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
let state = loadState();

function isValidated(letter) { return state.validated.includes(letter); }
function getCurrentLetter() {
  return LETTER_ORDER.find(l => !isValidated(l)) || null;
}
function validateLetter(letter) {
  if (!isValidated(letter)) {
    state.validated.push(letter);
    touchState();
  }
}

function touchState() {
  state.updatedAt = Date.now();
  saveState(state);
  if (window.cloudSync) window.cloudSync.save(state);
}

window.getLocalState = () => state;
window.applyRemoteState = remote => {
  state = { validated: remote.validated || [], updatedAt: remote.updatedAt || 0 };
  saveState(state);
  if (parseHash().route === 'home') render();
};

// ------- Pequeños efectos: sonidos y confeti -------
let audioCtx;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freqs, dur) {
  try {
    const ctx = getAudioCtx();
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  } catch (e) {}
}
function playChime() { playTone([523.25, 659.25, 783.99, 1046.5], 0.16); }

function burstConfetti(originY, fullScreen) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#ff6ec7', '#ffd93c', '#2ee6a6', '#8b5cf6', '#ff9f45', '#4dd0e1'];
  const count = fullScreen ? 200 : 110;
  const particles = Array.from({ length: count }).map(() => (fullScreen ? {
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 9 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 14,
    shape: Math.random() > 0.5 ? 'circle' : 'rect'
  } : {
    x: canvas.width / 2 + (Math.random() - 0.5) * 120,
    y: originY != null ? originY : canvas.height / 3,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 9 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 14,
    shape: Math.random() > 0.5 ? 'circle' : 'rect'
  }));
  let frame = 0;
  function tick() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });
    if (frame < (fullScreen ? 160 : 110)) requestAnimationFrame(tick);
    else canvas.remove();
  }
  tick();
}

// ------- Decorado de fondo animado (una sola vez) -------
function initBackgroundDecor() {
  if (document.querySelector('.bg-decor')) return;
  const decor = document.createElement('div');
  decor.className = 'bg-decor';
  const items = [
    { emoji: '⭐', top: '8%', left: '6%', size: '2.2rem', dur: '5s', delay: '0s' },
    { emoji: '🌟', top: '18%', left: '85%', size: '2.6rem', dur: '6.5s', delay: '0.5s' },
    { emoji: '☁️', top: '4%', left: '45%', size: '3rem', dur: '7s', delay: '1s' },
    { emoji: '🎈', top: '70%', left: '90%', size: '2.8rem', dur: '5.5s', delay: '0.3s' },
    { emoji: '🎈', top: '80%', left: '4%', size: '2.4rem', dur: '6s', delay: '1.2s' },
    { emoji: '✨', top: '35%', left: '3%', size: '1.8rem', dur: '4.5s', delay: '0.7s' },
    { emoji: '✨', top: '55%', left: '92%', size: '1.8rem', dur: '5s', delay: '0.2s' },
    { emoji: '☁️', top: '88%', left: '55%', size: '2.6rem', dur: '6.8s', delay: '0.9s' },
  ];
  items.forEach(it => {
    const span = document.createElement('span');
    span.textContent = it.emoji;
    span.style.top = it.top;
    span.style.left = it.left;
    span.style.fontSize = it.size;
    span.style.animationDuration = it.dur;
    span.style.animationDelay = it.delay;
    decor.appendChild(span);
  });
  document.body.appendChild(decor);
}

// ------- Enrutador muy simple basado en el hash -------
function navigate(path) {
  if (window.location.hash === `#${path}`) {
    // El hash no cambia (p. ej. "otra palabra" con la misma letra):
    // no se disparará 'hashchange', así que forzamos el redibujado.
    render();
  } else {
    window.location.hash = path;
  }
}
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => { initBackgroundDecor(); render(); });

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean).map(p => decodeURIComponent(p));
  return { route: parts[0] || 'home', letter: parts[1] || null };
}

const app = document.getElementById('app');

function render() {
  const { route, letter } = parseHash();
  app.innerHTML = '';
  if (route === 'home') return renderHome();
  if (route === 'letter' && letter) return renderLetter(letter);
  if (route === 'draw' && letter) return renderTrace(letter, true);
  if (route === 'game-draw' && letter) return renderTrace(letter, false);
  if (route === 'game-sound' && letter) return renderSoundGame(letter);
  if (route === 'game-hidden' && letter) return renderHiddenLetterGame(letter);
  if (route === 'game-puzzle' && letter) return renderPuzzleGame(letter);
  return renderHome();
}

// ------- Componentes utilitarios -------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

const ICONS = {
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>',
  lock: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 018 0v3"/></g>',
  pen: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-5L16 4l4 4L9 19z"/></g>',
  speaker: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8c1.8 2 1.8 6 0 8"/></g>',
  puzzle: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h4a2 2 0 114 0h4v4a2 2 0 100 4v4H5z"/></g>',
  search: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></g>',
  swap: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></g>',
  face: '<g fill="currentColor"><circle cx="8" cy="10" r="3.2"/><circle cx="16" cy="10" r="3.2"/><path d="M12 13l-2 3h4z"/></g>'
};
function icon(name, size) {
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  span.style.display = 'inline-flex';
  span.innerHTML = `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
  return span;
}

function topbar(title, onBack) {
  return el('div', { class: 'topbar' }, [
    onBack ? el('button', { class: 'icon-btn', onclick: () => { onBack(); } }, icon('back', 22)) : el('div', { style: 'width:52px' }),
    el('h1', {}, title),
    el('div', { style: 'width:52px' })
  ]);
}

const MASCOT_COLORS = { '😴': '#B8AEDB', '🥳': 'var(--green)', '🦉': 'var(--pink)', '✏️': 'var(--pink)', '👂': 'var(--purple)', '🤔': 'var(--purple)', '🧩': 'var(--purple)' };

function mascot(text, emoji) {
  const face = el('div', { class: 'mascot' });
  face.style.background = MASCOT_COLORS[emoji] || 'var(--pink)';
  face.appendChild(icon('face', 30));
  return el('div', { class: 'mascot-row' }, [
    face,
    el('div', { class: 'speech-bubble' }, text)
  ]);
}

const MASCOT_HOME_MESSAGES = [
  '¡Yupi, empieza la aventura del alfabeto!',
  '¡Sigue así, eres un campeón!',
  '¡Cada letra es una nueva estrella que ganar!'
];

const ANIMAL_EMOJI = {
  A: '🐝', B: '🐋', C: '🐰', D: '🐬', E: '🐘', F: '🦩', G: '🐱', H: '🦛',
  I: '🦎', J: '🦒', K: '🐨', L: '🦁', M: '🦋', N: '🦦', Ñ: '🐦', O: '🐻',
  P: '🐧', Q: '🦜', R: '🐸', S: '🐍', T: '🐢', U: '🐦', V: '🐄', W: '🐹',
  X: '🐕', Y: '🐂', Z: '🦊'
};

const IMAGE_EXTENSIONS = ['png', 'svg'];

function tileImage(letter) {
  const holder = el('span', { class: 'tile-art' }, letter);
  const img = new Image();
  img.alt = letter;
  img.onload = () => { holder.innerHTML = ''; holder.appendChild(img); };
  img.src = `assets/thumbs/${letter}.png`;
  return holder;
}

function animalFrame(letter) {
  const frame = el('div', { class: 'animal-frame' }, ANIMAL_EMOJI[letter] || '🐾');
  const img = new Image();
  img.alt = `Letra ${letter} - ${LETTER_ANIMALS[letter]}`;
  img.onload = () => { frame.innerHTML = ''; frame.appendChild(img); };
  let extIndex = 0;
  img.onerror = () => {
    extIndex++;
    if (extIndex < IMAGE_EXTENSIONS.length) img.src = `assets/letters/${letter}.${IMAGE_EXTENSIONS[extIndex]}`;
  };
  img.src = `assets/letters/${letter}.${IMAGE_EXTENSIONS[0]}`;
  return frame;
}

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {}
}

// ------- Pantalla de inicio -------
function renderHome() {
  const current = getCurrentLetter();
  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar('Mi Alfabeto'));
  wrap.appendChild(mascot(
    current ? `Leemos la página de la ${current} y vamos a buscar su estrella!` : MASCOT_HOME_MESSAGES[0],
    '🦉'
  ));
  wrap.appendChild(el('div', { class: 'progress-wrap' },
    `${state.validated.length} de ${LETTER_ORDER.length} letras`));

  const progressOuter = el('div', { class: 'progress-bar-outer home-bar' });
  const progressInner = el('div', { class: 'progress-bar-inner' });
  progressInner.style.width = `${Math.round((state.validated.length / LETTER_ORDER.length) * 100)}%`;
  progressOuter.appendChild(progressInner);
  wrap.appendChild(progressOuter);

  const grid = el('div', { class: 'letter-grid' });
  LETTER_ORDER.forEach((letter, i) => {
    const validated = isValidated(letter);
    const isCurrent = letter === current;
    const locked = !validated && !isCurrent;
    const classes = ['letter-tile'];
    if (validated) classes.push('validated');
    else if (isCurrent) classes.push('current');
    else classes.push('locked');

    const tile = el('button', {
      class: classes.join(' '),
      style: `animation-delay:${Math.min(i * 0.03, 0.6)}s`,
      onclick: locked
        ? (e) => { const t = e.currentTarget; t.classList.add('shake'); setTimeout(() => t.classList.remove('shake'), 400); }
        : () => { navigate(`letter/${letter}`); }
    }, [
      tileImage(letter),
      validated ? el('span', { class: 'badge-icon star' }, icon('star', 16)) : (locked ? el('span', { class: 'badge-icon' }, icon('lock', 14)) : null)
    ]);
    if (!validated && !isCurrent) tile.classList.add('pop-in');
    grid.appendChild(tile);
  });
  wrap.appendChild(grid);

  if (state.validated.length === LETTER_ORDER.length) {
    const finale = el('div', { class: 'finale' }, [
      el('div', { class: 'celebration' }, '¡Felicidades, ya conoces todo el alfabeto!')
    ]);
    wrap.appendChild(finale);
  }
  wrap.appendChild(el('button', { class: 'reset-link', onclick: openResetDialog }, 'Reiniciar'));
  app.appendChild(wrap);
}

function openResetDialog() {
  const normalize = s => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const accepted = ['reiniciar', 'reinitialiser'];
  const input = el('input', { class: 'reset-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Escribe reiniciar' });
  const confirm = el('button', { class: 'btn secondary', disabled: 'true' }, 'Borrar progreso');
  const overlay = el('div', { class: 'reset-overlay' }, [
    el('div', { class: 'reset-dialog' }, [
      el('h2', {}, 'Reiniciar'),
      el('p', {}, 'Se borrarán todas las letras conseguidas. Para confirmar, escribe la palabra «reiniciar».'),
      input,
      confirm,
      el('button', { class: 'reset-cancel', onclick: () => overlay.remove() }, 'Cancelar')
    ])
  ]);
  input.addEventListener('input', () => {
    confirm.disabled = !accepted.includes(normalize(input.value));
  });
  confirm.addEventListener('click', () => {
    if (confirm.disabled) return;
    state.validated = [];
    touchState();
    overlay.remove();
    render();
  });
  document.body.appendChild(overlay);
  input.focus();
}

// ------- Pantalla de una letra -------
function renderLetter(letter) {
  const validated = isValidated(letter);
  const current = getCurrentLetter();
  const isCurrent = letter === current;
  const locked = !validated && !isCurrent;

  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar(`Letra ${letter}`, () => navigate('home')));
  const screen = el('div', { class: 'screen' });

  screen.appendChild(animalFrame(letter));
  screen.appendChild(el('div', { class: 'big-letter' }, [
    el('span', { class: 'cap' }, letter),
    el('span', { class: 'cursive' }, letter.toLowerCase())
  ]));
  screen.appendChild(el('div', { class: 'animal-name' }, `${LETTER_ANIMALS[letter] || ''}`));

  if (locked) {
    screen.appendChild(mascot('Shh, esta letra todavía está dormida. ¡Termina antes las anteriores!', '😴'));
    screen.appendChild(el('button', { class: 'btn locked-msg' }, 'Bloqueada'));
  } else if (!validated) {
    screen.appendChild(mascot('¿Ya has leído tu página? ¡Ven a ganar tu estrella!', '🦉'));
    screen.appendChild(el('button', {
      class: 'btn pulse-cta',
      onclick: () => { navigate(`draw/${letter}`); }
    }, '¡He leído mi página!'));
  } else {
    screen.appendChild(mascot('¡Bravo campeón! Elige un juego divertido:', '🥳'));
    const games = el('div', { class: 'game-grid' }, [
      el('button', { class: 'game-tile', onclick: () => { navigate(`game-draw/${letter}`); } }, [
        el('span', { class: 'game-icon pink' }, icon('pen', 28)), 'Dibujar'
      ]),
      el('button', { class: 'game-tile', onclick: () => { navigate(`game-sound/${letter}`); } }, [
        el('span', { class: 'game-icon purple' }, icon('speaker', 28)), 'Escuchar'
      ]),
      el('button', { class: 'game-tile', onclick: () => { navigate(`game-hidden/${letter}`); } }, [
        el('span', { class: 'game-icon orange' }, icon('search', 28)), 'Letra oculta'
      ]),
      el('button', { class: 'game-tile', onclick: () => { navigate(`game-puzzle/${letter}`); } }, [
        el('span', { class: 'game-icon blue' }, icon('puzzle', 28)), 'Puzzle'
      ]),
    ]);
    screen.appendChild(games);
  }

  wrap.appendChild(screen);
  app.appendChild(wrap);
}

// ------- Juego 1: trazo guiado de la letra -------
function buildGuidePoints(letter, size) {
  const off = document.createElement('canvas');
  off.width = size; off.height = size;
  const ctx = off.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  ctx.font = `bold ${Math.floor(size * 0.75)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size / 2, size / 2 + size * 0.03);
  const data = ctx.getImageData(0, 0, size, size).data;
  const points = [];
  const step = Math.max(4, Math.floor(size / 60));
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const idx = (y * size + x) * 4 + 3;
      if (data[idx] > 128) points.push({ x, y, covered: false });
    }
  }
  return points;
}

function renderTrace(letter, isValidationFlow) {
  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar(isValidationFlow ? `Escribe la ${letter}` : `Dibuja la ${letter}`, () => navigate(`letter/${letter}`)));
  const screen = el('div', { class: 'screen' });
  screen.appendChild(mascot(
    isValidationFlow ? '¡Repasa los puntitos con tu dedo mágico!' : '¡Practica escribiendo la letra, tú puedes!',
    '✏️'
  ));

  const size = Math.min(340, Math.floor(window.innerWidth * 0.8), Math.floor(window.innerHeight * 0.4));
  const canvas = el('canvas', { class: 'trace-canvas pop-in', width: size, height: size });
  const ctx = canvas.getContext('2d');

  const points = buildGuidePoints(letter, size);
  const threshold = 0.7;
  let drawing = false;
  let successFired = false;
  let lastPopAt = 0;

  const traceColors = ['#8b5cf6', '#ff6ec7', '#ffd93c', '#2ee6a6', '#4dd0e1'];

  function drawGuide() {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#f1eaff';
    ctx.font = `bold ${Math.floor(size * 0.75)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, size / 2, size / 2 + size * 0.03);
  }
  drawGuide();

  function coverage() {
    return points.filter(p => p.covered).length / points.length;
  }

  function markNear(x, y) {
    const r2 = 22 * 22;
    for (const p of points) {
      if (!p.covered) {
        const dx = p.x - x, dy = p.y - y;
        if (dx * dx + dy * dy < r2) p.covered = true;
      }
    }
  }

  function paintDot(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = traceColors[Math.floor(coverage() * (traceColors.length - 1))];
    ctx.fill();
  }

  const progressOuter = el('div', { class: 'progress-bar-outer' });
  const progressInner = el('div', { class: 'progress-bar-inner' });
  progressOuter.appendChild(progressInner);

  function updateProgress() {
    const c = coverage();
    progressInner.style.width = `${Math.round(c * 100)}%`;
    const now = Date.now();
    if (c > 0 && now - lastPopAt > 350 && !successFired) { lastPopAt = now; }
    if (c >= threshold && !successFired) {
      successFired = true;
      onSuccess();
    }
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - rect.left) * (size / rect.width), y: (t.clientY - rect.top) * (size / rect.height) };
  }

  function pointerDown(e) { drawing = true; const p = getPos(e); paintDot(p.x, p.y); markNear(p.x, p.y); updateProgress(); e.preventDefault(); }
  function pointerMove(e) { if (!drawing) return; const p = getPos(e); paintDot(p.x, p.y); markNear(p.x, p.y); updateProgress(); e.preventDefault(); }
  function pointerUp() { drawing = false; }

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);

  screen.appendChild(canvas);
  screen.appendChild(progressOuter);

  const resetBtn = el('button', {
    class: 'btn secondary', onclick: () => {
      points.forEach(p => p.covered = false);
      successFired = false;
      drawGuide();
      updateProgress();
    }
  }, 'Empezar de nuevo');
  screen.appendChild(resetBtn);

  function onSuccess() {
    if (isValidationFlow) validateLetter(letter);
    playChime();
    burstConfetti(null, true);
    resetBtn.disabled = true;
    setTimeout(() => navigate(`letter/${letter}`), 1700);
  }

  wrap.appendChild(screen);
  app.appendChild(wrap);
}

// ------- Juego 2: reconocimiento de sonidos -------
function renderSoundGame(letter) {
  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar(`Escucha la ${letter}`, () => navigate(`letter/${letter}`)));
  const screen = el('div', { class: 'screen' });

  const isVowel = VOWELS.includes(letter);
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const validatedLetters = LETTER_ORDER.filter(l => isValidated(l));
  const consonantsValidated = validatedLetters.filter(l => !VOWELS.includes(l));

  let target, spoken, options;

  function newRound() {
    if (isVowel) {
      target = letter;
      spoken = letter.toLowerCase();
      const pool = validatedLetters.filter(l => l !== letter);
      options = shuffle([letter, ...shuffle(pool).slice(0, 2)]);
    } else {
      target = letter;
      const vowel = vowels[Math.floor(Math.random() * vowels.length)];
      spoken = (letter.toLowerCase() + vowel);
      screen._vowel = vowel;
      const pool = consonantsValidated.filter(l => l !== letter);
      options = shuffle([letter, ...shuffle(pool).slice(0, 2)]);
    }
    renderRound();
  }

  function renderRound() {
    screen.innerHTML = '';
    screen.appendChild(mascot(isVowel
      ? '¡Escucha bien el sonido de la letra y encuéntrala!'
      : '¡Escucha el sonido con la vocal y encuentra la letra correcta!', '👂'));

    if (!isVowel) {
      screen.appendChild(el('div', { class: 'sound-vowel' }, screen._vowel.toUpperCase()));
    }

    screen.appendChild(el('button', {
      class: 'btn',
      onclick: () => { speak(spoken); }
    }, 'Escuchar otra vez'));

    const row = el('div', { class: 'choice-row' });
    options.forEach((opt, i) => {
      const btn = el('button', { class: 'choice-btn', style: `animation-delay:${i * 0.08}s` }, opt);
      btn.addEventListener('click', () => {
        if (opt === target) {
          btn.classList.add('correct');
          playChime();
          burstConfetti();
          setTimeout(newRound, 1000);
        } else {
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      });
      row.appendChild(btn);
    });
    screen.appendChild(row);
    speak(spoken);
  }

  newRound();
  wrap.appendChild(screen);
  app.appendChild(wrap);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------- Juego 3: letra oculta -------
function renderHiddenLetterGame(letter) {
  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar(`Letra oculta`, () => navigate(`letter/${letter}`)));
  const screen = el('div', { class: 'screen' });

  const validatedLetters = LETTER_ORDER.filter(l => isValidated(l));
  const validatedSet = new Set(validatedLetters);
  const candidates = WORD_BANK.filter(w => w.word.length >= 2 && [...w.word].every(ch => validatedSet.has(ch)));
  const withLetter = candidates.filter(w => w.word.includes(letter));
  const pool = withLetter.length ? withLetter : candidates;

  if (!pool.length) {
    screen.appendChild(mascot('Todavía faltan letras para este juego. ¡Vuelve pronto!', '🤔'));
    wrap.appendChild(screen);
    app.appendChild(wrap);
    return;
  }

  let lastWord = null;

  function newRound() {
    const choices = pool.length > 1 ? pool.filter(w => w.word !== lastWord) : pool;
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    lastWord = chosen.word;
    const chars = [...chosen.word];
    const sameLetter = chars.map((c, i) => (c === letter ? i : -1)).filter(i => i >= 0);
    const hiddenIndex = sameLetter.length
      ? sameLetter[Math.floor(Math.random() * sameLetter.length)]
      : Math.floor(Math.random() * chars.length);
    const answer = chars[hiddenIndex];
    const distractors = shuffle(validatedLetters.filter(l => l !== answer)).slice(0, 2);
    const options = shuffle([answer, ...distractors]);

    screen.innerHTML = '';
    screen.appendChild(mascot('¿Qué letra falta en la palabra?', '👂'));
    screen.appendChild(el('div', { class: 'word-emoji' }, chosen.emoji));

    const slots = el('div', { class: 'word-slots' });
    const hiddenSlot = el('div', { class: 'word-slot' }, '?');
    chars.forEach((ch, i) => {
      slots.appendChild(i === hiddenIndex ? hiddenSlot : el('div', { class: 'word-slot filled' }, ch));
    });
    screen.appendChild(slots);

    let done = false;
    const row = el('div', { class: 'choice-row' });
    options.forEach((opt, i) => {
      const btn = el('button', { class: 'choice-btn', style: `animation-delay:${i * 0.08}s` }, opt);
      btn.addEventListener('click', () => {
        if (done) return;
        if (opt === answer) {
          done = true;
          btn.classList.add('correct');
          hiddenSlot.textContent = answer;
          hiddenSlot.classList.add('filled');
          playChime();
          burstConfetti(null, true);
          speak(chosen.word.toLowerCase());
          setTimeout(newRound, 1800);
        } else {
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      });
      row.appendChild(btn);
    });
    screen.appendChild(row);
  }

  newRound();
  wrap.appendChild(screen);
  app.appendChild(wrap);
}

// ------- Juego 4: puzzle del animal -------
function renderPuzzleGame(letter) {
  const wrap = el('div', { class: 'screen-in' });
  wrap.appendChild(topbar(`Puzzle de la ${letter}`, () => navigate(`letter/${letter}`)));
  const screen = el('div', { class: 'screen' });
  screen.appendChild(mascot('¡Arrastra las piezas para armar el animal!', '🧩'));
  wrap.appendChild(screen);
  app.appendChild(wrap);

  const imageUrl = `assets/letters/${encodeURIComponent(letter)}.png`;
  const probe = new Image();
  probe.onerror = () => {
    screen.appendChild(el('div', { class: 'hint-text' }, 'Todavía no hay imagen para esta letra.'));
  };
  probe.onload = () => buildPuzzle();
  probe.src = imageUrl;

  function buildPuzzle() {
    const n = 2;
    const boardSize = Math.max(160, Math.min(300, Math.floor(window.innerWidth * 0.78), Math.floor(window.innerHeight * 0.36)));
    const p = Math.floor(boardSize / n);
    const scale = 0.6;
    const tray = el('div', { class: 'puzzle-tray' });
    const board = el('div', { class: 'puzzle-board' });
    board.style.width = board.style.height = `${p * n}px`;
    board.style.gridTemplateColumns = `repeat(${n}, ${p}px)`;
    board.style.gridAutoRows = `${p}px`;

    const slots = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const slot = el('div', { class: 'puzzle-slot' });
        slot.dataset.r = r;
        slot.dataset.c = c;
        board.appendChild(slot);
        slots.push(slot);
      }
    }

    const pieces = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const piece = el('div', { class: 'puzzle-piece' });
        piece.style.width = piece.style.height = `${p}px`;
        piece.style.backgroundImage = `url("${imageUrl}")`;
        piece.style.backgroundSize = `${n * 100}% ${n * 100}%`;
        piece.style.backgroundPosition = `${(c * 100) / (n - 1)}% ${(r * 100) / (n - 1)}%`;
        piece.dataset.r = r;
        piece.dataset.c = c;
        piece.style.transform = `scale(${scale})`;
        pieces.push(piece);
      }
    }
    shuffle(pieces).forEach(piece => {
      const cell = el('div', { class: 'puzzle-cell' });
      cell.style.width = cell.style.height = `${Math.round(p * scale)}px`;
      cell.appendChild(piece);
      tray.appendChild(cell);
      piece._home = cell;
    });

    screen.appendChild(board);
    screen.appendChild(tray);

    let finished = false;
    pieces.forEach(piece => {
      piece.addEventListener('pointerdown', e => {
        if (finished || piece.classList.contains('locked')) return;
        e.preventDefault();
        piece.classList.add('dragging');
        piece.style.transform = 'none';
        document.body.appendChild(piece);
        const move = ev => {
          piece.style.left = `${ev.clientX - p / 2}px`;
          piece.style.top = `${ev.clientY - p / 2}px`;
        };
        move(e);
        const up = ev => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          piece.classList.remove('dragging');
          piece.style.left = piece.style.top = '';
          const target = slots.find(s => {
            const b = s.getBoundingClientRect();
            return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom;
          });
          if (target && !target.firstChild && target.dataset.r === piece.dataset.r && target.dataset.c === piece.dataset.c) {
            piece.classList.add('locked');
            piece.style.transform = 'none';
            target.appendChild(piece);
            if (slots.every(s => s.firstChild)) {
              finished = true;
              playChime();
              burstConfetti(null, true);
              setTimeout(() => navigate(`letter/${letter}`), 1900);
            }
          } else {
            piece.style.transform = `scale(${scale})`;
            piece._home.appendChild(piece);
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      });
    });
  }
}
