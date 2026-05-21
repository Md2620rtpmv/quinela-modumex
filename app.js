// ═══════════════════════════════════════════
// FIREBASE INIT
// ═══════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, collection,
  onSnapshot, query, writeBatch, deleteField, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDs2Wk2iODl-ksKd3gGMUutWeKDgkAVrds",
  authDomain: "quinela-modumex-2026.firebaseapp.com",
  projectId: "quinela-modumex-2026",
  storageBucket: "quinela-modumex-2026.firebasestorage.app",
  messagingSenderId: "1066526814642",
  appId: "1:1066526814642:web:ca6242d03e179167ba34ab",
  measurementId: "G-KHTH5HVVZ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════
// CONSTANTES DEL MUNDIAL
// ═══════════════════════════════════════════
const TEAMS = {
  MEX:'🇲🇽 México', RSA:'🇿🇦 Sudáfrica', COR:'🇰🇷 Corea', RPC:'🇨🇳 China',
  CAN:'🇨🇦 Canadá', BOS:'🇧🇦 Bosnia', QAT:'🇶🇦 Qatar', SUI:'🇨🇭 Suiza',
  BRA:'🇧🇷 Brasil', MAR:'🇲🇦 Marruecos', HAI:'🇭🇹 Haití', ESC:'🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia',
  USA:'🇺🇸 USA', PAR:'🇵🇾 Paraguay', AUS:'🇦🇺 Australia', TUR:'🇹🇷 Turquía',
  ALE:'🇩🇪 Alemania', CUR:'🇨🇼 Curazao', CDM:'🇨🇩 Congo DR', ECU:'🇪🇨 Ecuador',
  PBA:'🇵🇸 Palestina', JAP:'🇯🇵 Japón', SUE:'🇸🇪 Suecia', TUN:'🇹🇳 Túnez',
  BEL:'🇧🇪 Bélgica', EGI:'🇪🇬 Egipto', IRA:'🇮🇷 Irán', NZL:'🇳🇿 Nueva Zelanda',
  ESP:'🇪🇸 España', CAB:'🇨🇻 Cabo Verde', ARA:'🇸🇦 Arabia Saudita', URU:'🇺🇾 Uruguay',
  ARG:'🇦🇷 Argentina', ALG:'🇩🇿 Argelia', AUT:'🇦🇹 Austria', JOR:'🇯🇴 Jordania',
  POR:'🇵🇹 Portugal', RDC:'🇨🇩 RD Congo', UZB:'🇺🇿 Uzbekistán', COL:'🇨🇴 Colombia',
  ING:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', CRO:'🇭🇷 Croacia', GHA:'🇬🇭 Ghana', PAN:'🇵🇦 Panamá',
  FRA:'🇫🇷 Francia', SEN:'🇸🇳 Senegal', IRK:'🇮🇶 Irak', NOR:'🇳🇴 Noruega'
};

const GROUPS = {
  A: [['MEX','RSA'],['COR','RPC'],['RPC','RSA'],['MEX','COR'],['RSA','COR'],['RPC','MEX']],
  B: [['CAN','BOS'],['QAT','SUI'],['SUI','BOS'],['CAN','QAT'],['BOS','QAT'],['SUI','CAN']],
  C: [['BRA','MAR'],['HAI','ESC'],['ESC','MAR'],['BRA','HAI'],['ESC','BRA'],['MAR','HAI']],
  D: [['USA','PAR'],['AUS','TUR'],['USA','AUS'],['TUR','PAR'],['PAR','AUS'],['TUR','USA']],
  E: [['ALE','CUR'],['CDM','ECU'],['ALE','CDM'],['ECU','CUR'],['CUR','CDM'],['ECU','ALE']],
  F: [['PBA','JAP'],['SUE','TUN'],['PBA','SUE'],['TUN','JAP'],['JAP','SUE'],['TUN','PBA']],
  G: [['BEL','EGI'],['IRA','NZL'],['BEL','IRA'],['NZL','EGI'],['NZL','BEL'],['EGI','IRA']],
  H: [['ESP','CAB'],['ARA','URU'],['ESP','ARA'],['URU','CAB'],['CAB','ARA'],['URU','ESP']],
  I: [['FRA','SEN'],['IRK','NOR'],['FRA','IRK'],['NOR','SEN'],['SEN','IRK'],['NOR','FRA']],
  J: [['ARG','ALG'],['AUT','JOR'],['ARG','AUT'],['JOR','ALG'],['ALG','AUT'],['JOR','ARG']],
  K: [['POR','RDC'],['UZB','COL'],['POR','UZB'],['COL','RDC'],['RDC','UZB'],['COL','POR']],
  L: [['ING','CRO'],['GHA','PAN'],['ING','GHA'],['PAN','CRO'],['CRO','GHA'],['PAN','ING']]
};

const ELIM_ROUNDS = [
  {id:'r32', label:'Dieciseisavos', matches:16},
  {id:'r16', label:'Octavos de Final', matches:8},
  {id:'qf',  label:'Cuartos de Final', matches:4},
  {id:'sf',  label:'Semifinales',       matches:2},
  {id:'fin', label:'Final',             matches:1},
  {id:'3rd', label:'Tercer Lugar',      matches:1}
];

const DEFAULT_PTS = {
  grupo_exacto: 3, grupo_ganador: 1,
  elim_enfrentamiento: 1,
  elim_r32: 2, elim_r16: 4, elim_qf: 4, elim_sf: 6, elim_fin: 8, elim_3rd: 4
};

const PTS_LABELS = {
  grupo_exacto: 'Marcador exacto (grupos)',
  grupo_ganador: 'Ganador/empate (grupos)',
  elim_enfrentamiento: 'Enfrentamiento correcto (los 2 equipos)',
  elim_r32: 'Dieciseisavos (ganador)',
  elim_r16: 'Octavos (ganador)',
  elim_qf: 'Cuartos (ganador)',
  elim_sf: 'Semis (ganador)',
  elim_fin: 'Final (ganador)',
  elim_3rd: 'Tercer lugar (ganador)'
};

// ═══════════════════════════════════════════
// AUTH (cliente)
// ═══════════════════════════════════════════
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'modumex2026'; // ← CAMBIAR antes de producción
const ADMIN_PAGES = ['quinielas','participantes','admin'];

// ═══════════════════════════════════════════
// ELIMINATORIA: fecha de desbloqueo automático
// ═══════════════════════════════════════════
// 28 de junio de 2026, 00:00 hora de México (UTC-6)
// La fase de grupos del Mundial 2026 termina el 27 de junio
const ELIM_UNLOCK_DATE = new Date('2026-06-28T06:00:00Z'); // 00:00 CST = 06:00 UTC

// ═══════════════════════════════════════════
// FECHA LÍMITE para capturar quinielas (empleados)
// ═══════════════════════════════════════════
// 10 de junio 2026, 15:00 hrs hora México (UTC-6) = 21:00 UTC
const QUINIELA_DEADLINE = new Date('2026-06-10T21:00:00Z');

function isQuinielaOpen() {
  return new Date() < QUINIELA_DEADLINE;
}

let session = { type: null, pid: null, nombre: null };
let _pendingPage = null;
let elimCountdownInterval = null;

// ═══════════════════════════════════════════
// STATE en memoria (mirror de Firestore)
// ═══════════════════════════════════════════
let state = {
  config: { cuota: 150, mult: 2, nombre: 'Quiniela Modumex · Mundial 2026', empresa: 'Grupo Modumex' },
  pts: { ...DEFAULT_PTS },
  participants: [],         // [{id, nombre, area, pago, codigo}]
  results: {},              // {G_A_0: {h:1,a:0}, ...}
  elimResults: {},          // {r32_0: {home,away,h,a,winner}, ...}
  quinielas: {},            // {pid: {groups: {G_A_0:{h,a}}, elim: {r32_0:{winner}}}}
  elimOverride: false       // si true, admin desbloqueó manualmente la elim
};

let unsubscribers = [];
let isConnected = false;
let dataReady = false;

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function $(id) { return document.getElementById(id); }

// Devuelve el código del equipo envuelto en un <span> con tooltip del nombre completo
// Ej: getTeam('MEX') → '<span title="México">MEX</span>'
function getTeam(code) {
  if (!code) return '';
  const full = TEAMS[code] || '';
  // El nombre limpio sin la bandera emoji al inicio
  const cleanName = full.split(' ').slice(1).join(' ') || code;
  return `<span title="${cleanName}" style="cursor:help;">${code}</span>`;
}

// Solo el nombre completo del equipo (sin emoji)
function getTeamName(code) {
  if (!code) return '';
  const full = TEAMS[code] || '';
  return full.split(' ').slice(1).join(' ') || code;
}

// Helpers legacy (mantienen compatibilidad con código existente)
function getFlag(code) { return ''; }   // ya no devolvemos bandera
function getShortName(code) { return getTeam(code); }

function flash() {
  document.body.style.background = 'rgba(0,166,81,0.06)';
  setTimeout(() => { document.body.style.background = ''; }, 400);
}

function showToast(msg, type = 'success', duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type === 'error' ? 'error' : type === 'warn' ? 'warn' : '');
  setTimeout(() => { t.classList.remove('show'); }, duration);
}

function genCodigo(nombre) {
  // Toma el primer nombre, mayúsculas, sin acentos
  const base = (nombre.split(' ')[0] || 'USER')
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '')
    .slice(0, 8) || 'USER';
  // Random suffix
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0,1,O,I para evitar confusión
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return base + '-' + suffix;
}

// Helper: genera las <option> de los 48 equipos del Mundial, ordenadas alfabéticamente
// selectedCode: código del equipo a marcar como seleccionado (opcional)
// placeholder: texto del option vacío (default "— Selecciona equipo —")
function getTeamOptions(selectedCode = '', placeholder = '— Selecciona equipo —') {
  const codes = Object.keys(TEAMS).sort((a, b) => {
    const na = TEAMS[a].split(' ').slice(1).join(' ');
    const nb = TEAMS[b].split(' ').slice(1).join(' ');
    return na.localeCompare(nb);
  });
  let html = `<option value="">${placeholder}</option>`;
  codes.forEach(c => {
    const sel = (c === selectedCode) ? ' selected' : '';
    html += `<option value="${c}"${sel}>${TEAMS[c]}</option>`;
  });
  // Si el código seleccionado no está en la lista (caso edge: equipo custom), añadirlo
  if (selectedCode && !codes.includes(selectedCode)) {
    html += `<option value="${selectedCode}" selected>${selectedCode}</option>`;
  }
  return html;
}

// ═══════════════════════════════════════════
// FIRESTORE: LISTENERS EN TIEMPO REAL
// ═══════════════════════════════════════════
function setStatus(mode, text) {
  const el = $('data-status');
  const txt = $('data-status-text');
  el.classList.remove('online','offline','loading');
  el.classList.add(mode);
  txt.textContent = text;
}

function attachListeners() {
  // 1) Participantes
  const unsubP = onSnapshot(collection(db, 'participants'),
    snapshot => {
      state.participants = [];
      snapshot.forEach(d => {
        state.participants.push({ id: d.id, ...d.data() });
      });
      // Orden por nombre
      state.participants.sort((a,b) => (a.nombre||'').localeCompare(b.nombre||''));
      onDataChange('participants');
    },
    err => {
      console.error('Error en participants:', err);
      setStatus('offline','Sin conexión');
      isConnected = false;
    }
  );

  // 2) Quinielas
  const unsubQ = onSnapshot(collection(db, 'quinielas'),
    snapshot => {
      state.quinielas = {};
      snapshot.forEach(d => { state.quinielas[d.id] = d.data(); });
      onDataChange('quinielas');
    },
    err => console.error('Error en quinielas:', err)
  );

  // 3) Resultados (1 documento con todos los partidos de grupos)
  const unsubR = onSnapshot(doc(db, 'results', 'all'),
    snapshot => {
      state.results = snapshot.exists() ? (snapshot.data().matches || {}) : {};
      onDataChange('results');
    },
    err => console.error('Error en results:', err)
  );

  // 4) Eliminatoria (1 documento)
  const unsubE = onSnapshot(doc(db, 'elimResults', 'all'),
    snapshot => {
      state.elimResults = snapshot.exists() ? (snapshot.data().matches || {}) : {};
      onDataChange('elim');
    },
    err => console.error('Error en elim:', err)
  );

  // 5) Config general
  const unsubC = onSnapshot(doc(db, 'config', 'general'),
    snapshot => {
      if (snapshot.exists()) {
        state.config = { ...state.config, ...snapshot.data() };
      }
      onDataChange('config');
    },
    err => console.error('Error en config:', err)
  );

  // 6) Sistema de puntos
  const unsubPts = onSnapshot(doc(db, 'config', 'puntos'),
    snapshot => {
      if (snapshot.exists()) {
        state.pts = { ...DEFAULT_PTS, ...snapshot.data() };
      }
      onDataChange('pts');
    },
    err => console.error('Error en pts:', err)
  );

  // 7) Control de eliminatoria (override manual del admin)
  const unsubElim = onSnapshot(doc(db, 'config', 'elim'),
    snapshot => {
      if (snapshot.exists()) {
        state.elimOverride = !!snapshot.data().override;
      } else {
        state.elimOverride = false;
      }
      onDataChange('elim-override');
    },
    err => console.error('Error en elim config:', err)
  );

  unsubscribers = [unsubP, unsubQ, unsubR, unsubE, unsubC, unsubPts, unsubElim];

  // Marcar conectado tras el primer snapshot
  setTimeout(() => {
    if (!isConnected) {
      isConnected = true;
      dataReady = true;
      setStatus('online','En vivo');
    }
  }, 800);
}

function onDataChange(source) {
  // Re-renderizar la página activa
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  const id = activePage.id.replace('page-','');
  if (id === 'tabla') renderLeaderboard();
  else if (id === 'resultados') renderResults();
  else if (id === 'quinielas') renderQuinielasPage();
  else if (id === 'participantes') renderParticipants();
  else if (id === 'eliminatoria') renderEliminatoria();
  else if (id === 'admin') renderAdmin();
  else if (id === 'mi-quiniela') renderMiQuiniela();
}

// ═══════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════
function calcScore(pid) {
  const q = state.quinielas[pid];
  if (!q) return { total: 0, detail: {} };
  let total = 0;
  const detail = {};

  // Grupos
  Object.keys(GROUPS).forEach(g => {
    GROUPS[g].forEach((match, i) => {
      const key = `G_${g}_${i}`;
      const real = state.results[key];
      const pred = q.groups && q.groups[key];
      if (!real || real.h === '' || real.a === '' || real.h === null || real.h === undefined) return;
      if (!pred || pred.h === '' || pred.a === '' || pred.h === null || pred.h === undefined) return;
      const rh = parseInt(real.h), ra = parseInt(real.a);
      const ph = parseInt(pred.h), pa = parseInt(pred.a);
      let pts = 0;
      if (rh === ph && ra === pa) { pts = state.pts.grupo_exacto; }
      else if (Math.sign(rh - ra) === Math.sign(ph - pa)) { pts = state.pts.grupo_ganador; }
      detail[key] = pts;
      total += pts;
    });
  });

  // Eliminatoria
  ELIM_ROUNDS.forEach(round => {
    for (let i = 0; i < round.matches; i++) {
      const key = `${round.id}_${i}`;
      const real = state.elimResults[key];
      const pred = q.elim && q.elim[key];
      if (!real) continue;
      if (!pred) continue;

      let pts = 0;
      const detailBreakdown = { enfrentamiento: 0, ganador: 0 };

      // 1) Enfrentamiento correcto: 1 pt si los 2 equipos coinciden (sin importar orden)
      const realTeams = [
        (real.home || '').toUpperCase(),
        (real.away || '').toUpperCase()
      ].filter(t => t).sort();
      const predTeams = [
        (pred.home || '').toUpperCase(),
        (pred.away || '').toUpperCase()
      ].filter(t => t).sort();
      const enfrentamientoCorrecto =
        realTeams.length === 2 &&
        predTeams.length === 2 &&
        realTeams[0] === predTeams[0] &&
        realTeams[1] === predTeams[1];
      if (enfrentamientoCorrecto) {
        const ptsEnf = state.pts.elim_enfrentamiento || DEFAULT_PTS.elim_enfrentamiento || 1;
        pts += ptsEnf;
        detailBreakdown.enfrentamiento = ptsEnf;
      }

      // 2) Ganador correcto: pts según ronda (solo si ambos tienen ganador definido y coinciden)
      if (real.winner && pred.winner &&
          real.winner.toUpperCase() === pred.winner.toUpperCase()) {
        const ptsGan = state.pts['elim_' + round.id] || DEFAULT_PTS['elim_' + round.id] || 0;
        pts += ptsGan;
        detailBreakdown.ganador = ptsGan;
      }

      if (pts > 0) {
        detail[key] = pts;
        detail[key + '_breakdown'] = detailBreakdown;
        total += pts;
      }
    }
  });

  return { total, detail };
}

// ═══════════════════════════════════════════
// AUTH UI
// ═══════════════════════════════════════════
function openLogin() {
  $('login-error-emp').style.display = 'none';
  $('login-error-adm').style.display = 'none';
  $('login-codigo').value = '';
  $('login-user').value = '';
  $('login-pass').value = '';
  $('login-modal').classList.add('open');
  setTimeout(() => $('login-codigo').focus(), 100);
}
function closeLoginModal() { $('login-modal').classList.remove('open'); }

function switchLoginTab(which, btn) {
  document.querySelectorAll('#login-modal .inner-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  $('login-tab-emp').style.display = which === 'emp' ? 'block' : 'none';
  $('login-tab-adm').style.display = which === 'adm' ? 'block' : 'none';
  setTimeout(() => {
    if (which === 'emp') $('login-codigo').focus();
    else $('login-user').focus();
  }, 50);
}

function doLoginAdmin() {
  const u = $('login-user').value.trim();
  const p = $('login-pass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    session = { type: 'admin', pid: null, nombre: 'Admin' };
    sessionStorage.setItem('quiniela_session', JSON.stringify(session));
    closeLoginModal();
    updateAuthUI();
    if (_pendingPage) { const pp = _pendingPage; _pendingPage = null; navigateTo(pp); }
  } else {
    $('login-error-adm').style.display = 'block';
    $('login-pass').value = '';
  }
}

function doLoginEmpleado() {
  const cod = $('login-codigo').value.trim().toUpperCase();
  if (!cod) {
    $('login-error-emp').textContent = 'Ingresa tu código';
    $('login-error-emp').style.display = 'block';
    return;
  }
  const p = state.participants.find(x => (x.codigo || '').toUpperCase() === cod);
  if (!p) {
    $('login-error-emp').textContent = 'Código incorrecto. Verifica con el admin.';
    $('login-error-emp').style.display = 'block';
    return;
  }
  session = { type: 'empleado', pid: p.id, nombre: p.nombre };
  sessionStorage.setItem('quiniela_session', JSON.stringify(session));
  closeLoginModal();
  updateAuthUI();
  navigateTo('mi-quiniela');
}

function logout() {
  if (!confirm('¿Cerrar sesión?')) return;
  session = { type: null, pid: null, nombre: null };
  sessionStorage.removeItem('quiniela_session');
  updateAuthUI();
  navigateTo('tabla');
}

function restoreSession() {
  try {
    const s = sessionStorage.getItem('quiniela_session');
    if (s) {
      const parsed = JSON.parse(s);
      // Validar que el participante aún exista
      if (parsed.type === 'empleado' && parsed.pid) {
        // Se valida después de que carguen los participantes
        session = parsed;
      } else if (parsed.type === 'admin') {
        session = parsed;
      }
    }
  } catch(e) {}
}

function updateAuthUI() {
  $('login-btn').style.display = session.type ? 'none' : 'flex';
  $('session-badge-admin').style.display = session.type === 'admin' ? 'flex' : 'none';
  $('session-badge-empleado').style.display = session.type === 'empleado' ? 'flex' : 'none';
  if (session.type === 'empleado') $('session-empleado-name').textContent = (session.nombre || '').split(' ')[0];
  $('tab-mi-quiniela').style.display = session.type === 'empleado' ? 'block' : 'none';

  const isAdmin = session.type === 'admin';
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('unlocked', isAdmin));
  ['results-readonly-banner','elim-readonly-banner'].forEach(id => {
    const el = $(id); if (el) el.style.display = isAdmin ? 'none' : 'flex';
  });
  ['results-edit-hint','elim-edit-hint'].forEach(id => {
    const el = $(id); if (el) el.style.display = isAdmin ? 'block' : 'none';
  });
  toggleEditableInputs();
}

function toggleEditableInputs() {
  const isAdmin = session.type === 'admin';
  document.querySelectorAll('#results-group-pages input').forEach(i => {
    i.disabled = !isAdmin;
    i.style.opacity = isAdmin ? '1' : '0.5';
    i.style.cursor = isAdmin ? '' : 'not-allowed';
  });
  document.querySelectorAll('#bracket-content input, #bracket-content select').forEach(i => {
    i.disabled = !isAdmin;
    i.style.opacity = isAdmin ? '1' : '0.5';
    i.style.cursor = isAdmin ? '' : 'not-allowed';
  });
}

// ═══════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════
function showPage(id, event) {
  if (ADMIN_PAGES.includes(id) && session.type !== 'admin') {
    _pendingPage = id;
    openLogin();
    return;
  }
  if (id === 'mi-quiniela' && session.type !== 'empleado') {
    openLogin();
    return;
  }
  navigateTo(id, event);
}

function navigateTo(id, event) {
  try {
    const target = $('page-' + id);
    if (!target) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    if (event && event.target && event.target.classList.contains('nav-tab')) {
      event.target.classList.add('active');
    } else if (id !== 'inicio') {
      const btn = document.querySelector(`[onclick*="'${id}'"]`);
      if (btn && btn.classList.contains('nav-tab')) btn.classList.add('active');
    }
    if (id === 'tabla') renderLeaderboard();
    if (id === 'resultados') { renderResults(); setTimeout(toggleEditableInputs, 50); }
    if (id === 'quinielas') renderQuinielasPage();
    if (id === 'participantes') renderParticipants();
    if (id === 'eliminatoria') { renderEliminatoria(); setTimeout(toggleEditableInputs, 50); }
    if (id === 'admin') renderAdmin();
    if (id === 'mi-quiniela') renderMiQuiniela();
    if (id === 'inicio') window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) { console.error(e); }
}

// ═══════════════════════════════════════════
// RENDER: LEADERBOARD
// ═══════════════════════════════════════════
function renderLeaderboard() {
  const paid = state.participants.filter(p => p.pago === 'pagado').length;
  const pozo = paid * state.config.cuota * state.config.mult;
  const playedGroups = Object.values(state.results).filter(r => r && r.h !== '' && r.h !== null && r.h !== undefined).length;
  const playedElim = Object.values(state.elimResults).filter(r => r && r.winner).length;
  const played = playedGroups + playedElim;
  const totalElim = ELIM_ROUNDS.reduce((s, r) => s + r.matches, 0);
  const total = 72 + totalElim; // 12 grupos x 6 = 72 partidos de grupos

  $('stat-participants').textContent = state.participants.length;
  $('stat-pozo').textContent = '$' + pozo.toLocaleString();
  $('stat-played').textContent = played;
  $('stat-pending').textContent = total - played;

  const scores = state.participants.map(p => ({ ...p, score: calcScore(p.id).total }));
  scores.sort((a, b) => b.score - a.score);

  if (!scores.length) {
    $('leaderboard-body').innerHTML = `<div class="empty-state"><div class="icon">🏆</div><p>Aún no hay participantes.</p></div>`;
    return;
  }

  let html = `<table class="leaderboard"><thead><tr>
    <th style="width:50px;">#</th><th>Participante</th><th>Área</th><th>Pago</th>
    <th style="text-align:right;">Puntos</th></tr></thead><tbody>`;

  scores.forEach((p, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
    html += `<tr class="${rankClass}">
      <td><span class="rank-num">${i + 1}</span></td>
      <td><strong>${escapeHtml(p.nombre)}</strong></td>
      <td><span style="color:var(--muted);font-size:13px;">${escapeHtml(p.area || '—')}</span></td>
      <td>${p.pago === 'pagado' ? '<span class="badge badge-green">✅ Pagado</span>' : '<span class="badge badge-red">⏳ Pendiente</span>'}</td>
      <td style="text-align:right;"><span class="pts-big">${p.score}</span></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  $('leaderboard-body').innerHTML = html;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ═══════════════════════════════════════════
// RENDER: RESULTADOS
// ═══════════════════════════════════════════
function renderResults() {
  const tabsEl = $('results-group-tabs');
  const pagesEl = $('results-group-pages');
  const gkeys = Object.keys(GROUPS);
  tabsEl.innerHTML = gkeys.map((g, i) => `<button class="inner-tab${i === 0 ? ' active' : ''}" onclick="switchInner('rg','rg-${g}',this)">Grupo ${g}</button>`).join('');
  pagesEl.innerHTML = gkeys.map((g, i) => `<div id="rg-${g}" class="inner-page${i === 0 ? ' active' : ''}">${renderGroupMatches(g)}</div>`).join('');
}

function renderGroupMatches(g) {
  const matches = GROUPS[g];
  let html = `<div class="group-card" style="margin-bottom:0;border-radius:12px;overflow:hidden;"><div class="group-header ${g}">⚽ GRUPO ${g}</div>`;
  matches.forEach((m, i) => {
    const key = `G_${g}_${i}`;
    const r = state.results[key] || { h: '', a: '' };
    html += `<div class="match-row">
      <div class="team-home">${getShortName(m[0])}</div>
      <div class="score-inputs">
        <input class="score-box" type="number" min="0" max="9" maxlength="1" value="${r.h !== null && r.h !== undefined ? r.h : ''}" placeholder="-" id="res_${key}_h" onchange="saveResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
        <span class="score-sep">:</span>
        <input class="score-box" type="number" min="0" max="9" maxlength="1" value="${r.a !== null && r.a !== undefined ? r.a : ''}" placeholder="-" id="res_${key}_a" onchange="saveResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
      </div>
      <div class="team-away">${getShortName(m[1])}</div>
    </div>`;
  });
  html += `</div>`;
  return html;
}

async function saveResult(key) {
  if (session.type !== 'admin') return;
  const hRaw = $('res_' + key + '_h').value;
  const aRaw = $('res_' + key + '_a').value;
  const h = hRaw === '' ? null : parseInt(hRaw);
  const a = aRaw === '' ? null : parseInt(aRaw);

  try {
    const ref = doc(db, 'results', 'all');
    if (h === null && a === null) {
      // Borrar este partido
      await setDoc(ref, { matches: { [key]: deleteField() } }, { merge: true });
    } else {
      await setDoc(ref, { matches: { [key]: { h, a } } }, { merge: true });
    }
    showToast('✅ Resultado guardado', 'success', 1500);
  } catch (err) {
    console.error(err);
    showToast('❌ Error al guardar: ' + err.message, 'error', 4000);
  }
}

// ═══════════════════════════════════════════
// RENDER: MI QUINIELA (empleado)
// ═══════════════════════════════════════════
function renderMiQuiniela() {
  if (session.type !== 'empleado') {
    $('mi-quiniela-content').innerHTML = `<div class="empty-state"><div class="icon">🔒</div><p>Inicia sesión con tu código de participante.</p></div>`;
    return;
  }
  const p = state.participants.find(x => x.id === session.pid);
  if (!p) {
    $('mi-quiniela-content').innerHTML = `<div class="empty-state"><div class="icon">❓</div><p>No se encontró tu registro. Contacta al admin.</p></div>`;
    return;
  }
  const score = calcScore(session.pid);
  $('mi-quiniela-sub').textContent = `Hola ${p.nombre} · Captura tus predicciones`;

  let html = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;background:var(--dark2);padding:16px 20px;border-radius:12px;">
    <div class="participant-avatar">${escapeHtml(p.nombre.charAt(0))}</div>
    <div>
      <div style="font-size:18px;font-weight:700;">${escapeHtml(p.nombre)}</div>
      <div style="color:var(--muted);font-size:13px;">${escapeHtml(p.area || '')}</div>
    </div>
    <div style="margin-left:auto;text-align:right;">
      <div style="font-family:'Bebas Neue';font-size:40px;color:var(--green);line-height:1;">${score.total}</div>
      <div style="font-size:11px;letter-spacing:1px;color:var(--muted);text-transform:uppercase;">Tus puntos</div>
    </div>
  </div>`;

  // Estado de la deadline
  const open = isQuinielaOpen();
  const now = new Date();
  let deadlineHtml = '';
  if (open) {
    const diff = QUINIELA_DEADLINE - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    deadlineHtml = `<div class="alert alert-warn" style="margin-bottom:16px;">⏰ <strong>Fecha límite:</strong> 10 de junio 2026, 15:00 hrs (hora México) · Quedan <strong>${days} días y ${hours} hrs</strong> para capturar.</div>`;
  } else {
    deadlineHtml = `<div class="alert alert-error" style="margin-bottom:16px;">🔒 <strong>Periodo cerrado.</strong> La fecha límite del 10 de junio 15:00 hrs ya pasó. Tu quiniela quedó congelada.</div>`;
  }

  html += deadlineHtml;

  html += `<div style="margin-bottom:20px;">
    <button class="btn btn-green" onclick="openEditMiQuiniela()" ${open ? '' : 'disabled style="opacity:.5;cursor:not-allowed;"'}>✏️ ${open ? 'Capturar / Editar mi quiniela' : 'Periodo cerrado'}</button>
  </div>`;

  // Render predicciones vs resultados
  html += renderQuinielaView(session.pid);
  $('mi-quiniela-content').innerHTML = html;
}

function renderQuinielaView(pid) {
  const q = state.quinielas[pid] || { groups: {}, elim: {} };
  const score = calcScore(pid);
  let html = `<div class="groups-grid">`;
  Object.keys(GROUPS).forEach(g => {
    html += `<div class="group-card"><div class="group-header ${g}">Grupo ${g}</div>`;
    // Encabezado de columnas: LOCAL - TU PRED - VISIT - REAL - PTS
    html += `<div style="display:grid;grid-template-columns:minmax(56px,1fr) 56px minmax(56px,1fr) 56px 32px;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);">
      <div style="font-family:'Barlow Condensed';font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;text-align:right;">Local</div>
      <div style="font-family:'Barlow Condensed';font-size:9px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;text-align:center;">Tu pred.</div>
      <div style="font-family:'Barlow Condensed';font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;text-align:left;">Visit.</div>
      <div style="font-family:'Barlow Condensed';font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;text-align:center;">Real</div>
      <div style="font-family:'Barlow Condensed';font-size:9px;color:var(--green);text-transform:uppercase;letter-spacing:1px;text-align:center;">Pts</div>
    </div>`;
    GROUPS[g].forEach((m, i) => {
      const key = `G_${g}_${i}`;
      const pred = q.groups && q.groups[key];
      const real = state.results[key];
      const pts = score.detail[key] || 0;
      const hasPred = pred && pred.h !== '' && pred.h !== null && pred.h !== undefined;
      const hasReal = real && real.h !== '' && real.h !== null && real.h !== undefined;
      const ph = hasPred ? pred.h : '–';
      const pa = hasPred && pred.a !== '' && pred.a !== null && pred.a !== undefined ? pred.a : '–';
      const rh = hasReal ? real.h : '–';
      const ra = hasReal && real.a !== '' && real.a !== null && real.a !== undefined ? real.a : '–';
      html += `<div style="display:grid;grid-template-columns:minmax(56px,1fr) 56px minmax(56px,1fr) 56px 32px;align-items:center;gap:6px;padding:7px 10px;border-bottom:1px solid rgba(255,255,255,.03);">
        <div style="font-size:12px;text-align:right;font-weight:500;">${getShortName(m[0])}</div>
        <div style="text-align:center;font-family:'Bebas Neue';font-size:16px;color:${hasPred?'var(--gold)':'var(--muted)'};letter-spacing:1px;">
          <span>${ph}</span><span style="opacity:.5;margin:0 2px;">·</span><span>${pa}</span>
        </div>
        <div style="font-size:12px;text-align:left;font-weight:500;">${getShortName(m[1])}</div>
        <div style="text-align:center;font-family:'Bebas Neue';font-size:16px;color:${hasReal?'var(--white)':'var(--muted)'};letter-spacing:1px;">
          <span>${rh}</span><span style="opacity:.5;margin:0 2px;">·</span><span>${ra}</span>
        </div>
        <div style="text-align:center;"><span class="pts-chip${pts === 0 ? ' zero' : ''}">${pts}</span></div>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;

  // === ELIMINATORIA: predicciones del empleado vs resultados reales ===
  const elimLabels = {'r32':'Dieciseisavos','r16':'Octavos','qf':'Cuartos','sf':'Semifinales','fin':'Final','3rd':'Tercer Lugar'};
  let hasAnyElimPred = false;
  ELIM_ROUNDS.forEach(round => {
    for (let i = 0; i < round.matches; i++) {
      if (q.elim && q.elim[`${round.id}_${i}`]) { hasAnyElimPred = true; break; }
    }
  });

  if (hasAnyElimPred) {
    html += `<div style="margin-top:32px;margin-bottom:14px;">
      <div style="font-family:'Bebas Neue';font-size:24px;color:var(--gold);letter-spacing:2px;">🔥 ELIMINATORIA — PREDICCIONES</div>
      <div style="color:var(--muted);font-size:12px;">Tus predicciones de partidos eliminatorios vs el resultado real</div>
    </div>`;

    ELIM_ROUNDS.forEach(round => {
      // Verificar si hay al menos una predicción en esta ronda
      let hasInRound = false;
      for (let i = 0; i < round.matches; i++) {
        if (q.elim && q.elim[`${round.id}_${i}`]) { hasInRound = true; break; }
      }
      if (!hasInRound) return;

      html += `<div class="group-card" style="margin-bottom:14px;border-color:rgba(245,197,24,.15);">
        <div class="group-header" style="background:rgba(245,197,24,.12);color:var(--gold);">🔥 ${elimLabels[round.id]} (${state.pts['elim_'+round.id]||0} pts c/u)</div>`;

      for (let i = 0; i < round.matches; i++) {
        const key = `${round.id}_${i}`;
        const pred = q.elim && q.elim[key];
        if (!pred) continue;
        const real = state.elimResults[key];
        const pts = score.detail[key] || 0;

        const predHome = pred.home || '—';
        const predAway = pred.away || '—';
        const predWinner = pred.winner || '—';
        const predScore = (pred.h !== '' && pred.h !== null && pred.h !== undefined && pred.a !== '' && pred.a !== null && pred.a !== undefined) ? `${pred.h} · ${pred.a}` : '—';

        const realHome = real && real.home ? real.home : '—';
        const realAway = real && real.away ? real.away : '—';
        const realScore = real && real.h !== '' && real.h !== null && real.h !== undefined && real.a !== '' && real.a !== null && real.a !== undefined ? `${real.h} · ${real.a}` : '—';
        const realWinner = real && real.winner ? real.winner : '—';

        // Helpers para mostrar con tooltip
        const showTeam = (code) => code === '—' ? '—' : `<span title="${escapeHtml(getTeamName(code))}" style="cursor:help;">${escapeHtml(code)}</span>`;

        const acierto = real && real.winner && pred.winner && real.winner === pred.winner;

        html += `<div style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);">
          <div style="font-family:'Barlow Condensed';font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:6px;">Partido ${i+1}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 60px;gap:10px;align-items:center;font-size:12px;">
            <div>
              <div style="color:var(--gold);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Tu predicción</div>
              <div>${showTeam(predHome)} <span style="color:var(--gold);font-family:'Bebas Neue';">${predScore}</span> ${showTeam(predAway)}</div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px;">🏆 ${showTeam(predWinner)}</div>
            </div>
            <div>
              <div style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Resultado real</div>
              <div>${showTeam(realHome)} <span style="color:var(--white);font-family:'Bebas Neue';">${realScore}</span> ${showTeam(realAway)}</div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px;">🏆 ${showTeam(realWinner)}</div>
            </div>
            <div style="text-align:center;">
              <span class="pts-chip${pts === 0 ? ' zero' : ''}" style="font-size:18px;padding:4px 12px;">${pts}</span>
              ${acierto ? '<div style="font-size:9px;color:var(--green);margin-top:4px;">✓ ACIERTO</div>' : ''}
            </div>
          </div>
        </div>`;
      }
      html += `</div>`;
    });
  }

  return html;
}

function openEditMiQuiniela() {
  if (session.type !== 'empleado') return;
  openEditQuiniela(session.pid);
}

// ═══════════════════════════════════════════
// RENDER: QUINIELAS (admin)
// ═══════════════════════════════════════════
let currentQuinielaPid = null;
let currentViewPid = null;

function renderQuinielasPage() {
  const sel = $('quiniela-select');
  const cur = sel.value;
  sel.innerHTML = `<option value="">— Selecciona un participante —</option>` +
    state.participants.map(p => `<option value="${p.id}"${p.id === cur ? ' selected' : ''}>${escapeHtml(p.nombre)}</option>`).join('');
  if (cur) showQuiniela(cur);
}

function showQuiniela(pid) {
  currentViewPid = pid;
  if (!pid) {
    $('quiniela-viewer').innerHTML = `<div class="empty-state"><div class="icon">📋</div><p>Selecciona un participante.</p></div>`;
    return;
  }
  const p = state.participants.find(x => x.id === pid);
  if (!p) return;
  const score = calcScore(pid);

  let html = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
    <div class="participant-avatar">${escapeHtml(p.nombre.charAt(0))}</div>
    <div>
      <div style="font-size:18px;font-weight:700;">${escapeHtml(p.nombre)}</div>
      <div style="color:var(--muted);font-size:13px;">${escapeHtml(p.area || '')}</div>
      ${p.codigo ? `<div style="margin-top:4px;"><span class="codigo-pill" onclick="navigator.clipboard.writeText('${p.codigo}');showToast('Código copiado','success',1500);">${escapeHtml(p.codigo)}</span></div>` : ''}
    </div>
    <div style="margin-left:auto;display:flex;gap:12px;align-items:center;">
      <div style="text-align:right;">
        <div style="font-family:'Bebas Neue';font-size:40px;color:var(--green);line-height:1;">${score.total}</div>
        <div style="font-size:11px;letter-spacing:1px;color:var(--muted);text-transform:uppercase;">Puntos</div>
      </div>
      <button class="btn btn-green btn-sm" onclick="openEditQuiniela('${pid}')">✏️ Editar</button>
    </div>
  </div>`;
  html += renderQuinielaView(pid);
  $('quiniela-viewer').innerHTML = html;
}

function openEditCurrentQuiniela() {
  if (!currentViewPid) {
    if (state.participants.length === 0) {
      showToast('Primero agrega participantes', 'warn');
      return;
    }
    showToast('Selecciona un participante del menú', 'warn');
    return;
  }
  openEditQuiniela(currentViewPid);
}

function openEditQuiniela(pid) {
  currentQuinielaPid = pid;
  const p = state.participants.find(x => x.id === pid);
  if (!p) return;

  // Verificar fecha límite (solo aplica a empleados, admin siempre puede editar)
  if (session.type === 'empleado' && !isQuinielaOpen()) {
    showToast('🔒 El periodo de captura cerró el 10 de junio 15:00 hrs. Solo el admin puede modificar.', 'warn', 5000);
    return;
  }

  $('qm-title').textContent = (p.nombre).toUpperCase() + ' · QUINIELA';
  $('qm-sub').textContent = 'Predicciones fase de grupos + eliminatoria · Guarda al final';
  const q = state.quinielas[pid] || { groups: {}, elim: {} };
  const gkeys = Object.keys(GROUPS);

  // Construir tabs: 12 grupos + 6 rondas eliminatorias
  let tabsHtml = gkeys.map((g, i) =>
    `<button class="inner-tab${i === 0 ? ' active' : ''}" onclick="switchInner('qmg','qmg-${g}',this)">Grupo ${g}</button>`
  ).join('');
  // Tabs de eliminatoria
  const elimRoundLabels = {
    'r32':'16vos', 'r16':'8vos', 'qf':'Cuartos', 'sf':'Semis', 'fin':'Final', '3rd':'3er Lugar'
  };
  ELIM_ROUNDS.forEach(round => {
    tabsHtml += `<button class="inner-tab" onclick="switchInner('qmg','qmg-elim-${round.id}',this)" style="border-color:rgba(245,197,24,.3);color:var(--gold);">🔥 ${elimRoundLabels[round.id]}</button>`;
  });
  $('qm-tabs').innerHTML = tabsHtml;

  // Construir contenido
  let content = '';

  // === FASE DE GRUPOS ===
  gkeys.forEach((g, i) => {
    content += `<div id="qmg-${g}" class="inner-page${i === 0 ? ' active' : ''}">
      <div class="group-card" style="border-radius:12px;overflow:hidden;">
        <div class="group-header ${g}">⚽ GRUPO ${g} — Predicciones</div>`;
    GROUPS[g].forEach((m, idx) => {
      const key = `G_${g}_${idx}`;
      const pred = (q.groups && q.groups[key]) || { h: '', a: '' };
      content += `<div class="match-predict">
        <div class="team-home">${getShortName(m[0])}</div>
        <div class="score-inputs">
          <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.h !== '' && pred.h !== null && pred.h !== undefined ? pred.h : ''}" placeholder="-" id="q_${key}_h" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
          <span class="score-sep">:</span>
          <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.a !== '' && pred.a !== null && pred.a !== undefined ? pred.a : ''}" placeholder="-" id="q_${key}_a" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
        </div>
        <div class="team-away">${getShortName(m[1])}</div>
      </div>`;
    });
    content += `</div></div>`;
  });

  // === FASE ELIMINATORIA ===
  // Construir opciones de equipos para los dropdowns (ordenados alfabéticamente por nombre)
  const teamCodes = Object.keys(TEAMS).sort((a, b) => {
    const na = TEAMS[a].split(' ').slice(1).join(' ');
    const nb = TEAMS[b].split(' ').slice(1).join(' ');
    return na.localeCompare(nb);
  });
  const teamOptions = '<option value="">— Selecciona equipo —</option>' +
    teamCodes.map(c => `<option value="${c}">${TEAMS[c]}</option>`).join('');

  ELIM_ROUNDS.forEach(round => {
    const ptsRound = state.pts['elim_' + round.id] || DEFAULT_PTS['elim_' + round.id] || 0;
    content += `<div id="qmg-elim-${round.id}" class="inner-page">
      <div class="group-card" style="border-radius:12px;overflow:hidden;border-color:rgba(245,197,24,.2);">
        <div class="group-header" style="background:rgba(245,197,24,.15);color:var(--gold);">🔥 ${elimRoundLabels[round.id]} — ${ptsRound} pts por acierto de ganador</div>
        <div style="padding:14px;color:var(--muted);font-size:12px;line-height:1.6;background:rgba(0,0,0,.15);">
          💡 Selecciona los equipos que crees que jugarán esta ronda, predice el marcador final y elige al ganador.
        </div>`;
    for (let i = 0; i < round.matches; i++) {
      const key = `${round.id}_${i}`;
      const pred = (q.elim && q.elim[key]) || { home: '', away: '', h: '', a: '', winner: '' };
      const selHome = (val) => val === pred.home ? ' selected' : '';
      const selAway = (val) => val === pred.away ? ' selected' : '';
      const homeOpts = teamOptions.replace(/value="([^"]+)"/g, (m, c) => `value="${c}"${selHome(c)}`);
      const awayOpts = teamOptions.replace(/value="([^"]+)"/g, (m, c) => `value="${c}"${selAway(c)}`);
      // Winner options (depende de home/away)
      let winnerOpts = '<option value="">— ¿Quién gana? —</option>';
      if (pred.home) winnerOpts += `<option value="${pred.home}"${pred.winner === pred.home ? ' selected' : ''}>🏆 ${TEAMS[pred.home] || pred.home}</option>`;
      if (pred.away && pred.away !== pred.home) winnerOpts += `<option value="${pred.away}"${pred.winner === pred.away ? ' selected' : ''}>🏆 ${TEAMS[pred.away] || pred.away}</option>`;
      if (pred.winner && pred.winner !== pred.home && pred.winner !== pred.away) {
        winnerOpts += `<option value="${pred.winner}" selected>🏆 ${TEAMS[pred.winner] || pred.winner}</option>`;
      }
      content += `<div style="padding:14px;border-bottom:1px solid rgba(255,255,255,.04);">
        <div style="font-family:'Barlow Condensed';font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Partido ${i + 1}</div>
        <div class="form-row" style="margin-bottom:10px;">
          <div class="form-group" style="margin:0;">
            <label style="font-size:10px;">Equipo local</label>
            <select id="qelim_${key}_home" onchange="updateElimWinnerSelect('${key}')">${homeOpts}</select>
          </div>
          <div class="form-group" style="margin:0;">
            <label style="font-size:10px;">Equipo visitante</label>
            <select id="qelim_${key}_away" onchange="updateElimWinnerSelect('${key}')">${awayOpts}</select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end;">
          <div>
            <label style="font-size:10px;">Marcador</label>
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
              <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.h !== '' && pred.h !== null && pred.h !== undefined ? pred.h : ''}" placeholder="-" id="qelim_${key}_h" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
              <span class="score-sep">:</span>
              <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.a !== '' && pred.a !== null && pred.a !== undefined ? pred.a : ''}" placeholder="-" id="qelim_${key}_a" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
            </div>
          </div>
          <div>
            <label style="font-size:10px;">🏆 Ganador (avanza)</label>
            <select id="qelim_${key}_winner">${winnerOpts}</select>
          </div>
        </div>
      </div>`;
    }
    content += `</div></div>`;
  });

  $('qm-content').innerHTML = content;
  openModal('modal-quiniela');
}

// Helper: cuando cambia el equipo local o visitante de elim, actualizar el select de ganador
function updateElimWinnerSelect(key) {
  const homeEl = $('qelim_' + key + '_home');
  const awayEl = $('qelim_' + key + '_away');
  const winnerEl = $('qelim_' + key + '_winner');
  if (!homeEl || !awayEl || !winnerEl) return;
  const home = homeEl.value;
  const away = awayEl.value;
  const currentWinner = winnerEl.value;
  let html = '<option value="">— ¿Quién gana? —</option>';
  if (home) html += `<option value="${home}"${currentWinner === home ? ' selected' : ''}>🏆 ${TEAMS[home] || home}</option>`;
  if (away && away !== home) html += `<option value="${away}"${currentWinner === away ? ' selected' : ''}>🏆 ${TEAMS[away] || away}</option>`;
  winnerEl.innerHTML = html;
}

async function saveQuiniela() {
  if (!currentQuinielaPid) return;

  // Permisos
  if (session.type !== 'admin' && !(session.type === 'empleado' && session.pid === currentQuinielaPid)) {
    showToast('No tienes permiso para editar esta quiniela', 'error');
    return;
  }

  // Verificar fecha límite (solo aplica a empleados)
  if (session.type === 'empleado' && !isQuinielaOpen()) {
    showToast('🔒 La fecha límite pasó. No puedes modificar tu quiniela.', 'warn', 5000);
    return;
  }

  // Recolectar grupos
  const groups = {};
  Object.keys(GROUPS).forEach(g => {
    GROUPS[g].forEach((m, i) => {
      const key = `G_${g}_${i}`;
      const hEl = $('q_' + key + '_h');
      const aEl = $('q_' + key + '_a');
      if (hEl && aEl) {
        const h = hEl.value === '' ? null : parseInt(hEl.value);
        const a = aEl.value === '' ? null : parseInt(aEl.value);
        if (h !== null || a !== null) {
          groups[key] = { h: h !== null ? h : '', a: a !== null ? a : '' };
        }
      }
    });
  });

  // Recolectar eliminatoria
  const elim = {};
  ELIM_ROUNDS.forEach(round => {
    for (let i = 0; i < round.matches; i++) {
      const key = `${round.id}_${i}`;
      const homeEl = $('qelim_' + key + '_home');
      const awayEl = $('qelim_' + key + '_away');
      const hEl = $('qelim_' + key + '_h');
      const aEl = $('qelim_' + key + '_a');
      const winnerEl = $('qelim_' + key + '_winner');
      if (homeEl && awayEl && winnerEl) {
        const home = homeEl.value || '';
        const away = awayEl.value || '';
        const h = hEl && hEl.value !== '' ? parseInt(hEl.value) : '';
        const a = aEl && aEl.value !== '' ? parseInt(aEl.value) : '';
        const winner = winnerEl.value || '';
        // Solo guardar si tiene al menos un campo
        if (home || away || h !== '' || a !== '' || winner) {
          elim[key] = { home, away, h, a, winner };
        }
      }
    }
  });

  try {
    const ref = doc(db, 'quinielas', currentQuinielaPid);
    await setDoc(ref, {
      groups,
      elim,
      actualizado: serverTimestamp()
    }, { merge: false });
    closeModal('modal-quiniela');
    showToast('✅ Quiniela guardada (grupos + eliminatoria)', 'success');
    flash();
  } catch (err) {
    console.error(err);
    showToast('❌ Error al guardar: ' + err.message, 'error', 5000);
  }
}

// ═══════════════════════════════════════════
// RENDER: PARTICIPANTES
// ═══════════════════════════════════════════
function renderParticipants() {
  const el = $('participants-list');
  if (!state.participants.length) {
    el.innerHTML = `<div class="empty-state"><div class="icon">👥</div><p>Aún no hay participantes registrados.<br>Haz clic en "+ Agregar participante" para empezar.</p></div>`;
    return;
  }
  el.innerHTML = state.participants.map(p => `
    <div class="participant-row">
      <div class="participant-avatar">${escapeHtml(p.nombre.charAt(0))}</div>
      <div style="flex:1;min-width:180px;">
        <div class="participant-name">${escapeHtml(p.nombre)}</div>
        <div class="participant-paid">${escapeHtml(p.area || '')}</div>
        ${p.codigo ? `<div style="margin-top:6px;"><span class="codigo-pill" onclick="navigator.clipboard.writeText('${p.codigo}');showToast('Código copiado','success',1500);" title="Click para copiar">${escapeHtml(p.codigo)}</span></div>` : ''}
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="badge ${p.pago === 'pagado' ? 'badge-green' : 'badge-red'}">${p.pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}</span>
        <button class="btn btn-sm btn-outline" onclick="togglePago('${p.id}')">Cambiar pago</button>
        <button class="btn btn-sm btn-danger" onclick="deleteParticipant('${p.id}')">✕</button>
      </div>
    </div>
  `).join('');
}

function openAddParticipant() {
  $('p-nombre').value = '';
  $('p-area').value = '';
  $('p-pago').value = 'pendiente';
  openModal('modal-participant');
  setTimeout(() => $('p-nombre').focus(), 100);
}

async function saveParticipant() {
  const nombre = $('p-nombre').value.trim();
  if (!nombre) { showToast('Escribe el nombre', 'warn'); return; }

  let codigo = genCodigo(nombre);
  // Asegurar unicidad
  let tries = 0;
  while (state.participants.some(p => p.codigo === codigo) && tries < 10) {
    codigo = genCodigo(nombre);
    tries++;
  }

  const newP = {
    nombre,
    area: $('p-area').value.trim(),
    pago: $('p-pago').value,
    codigo,
    creado: new Date().toISOString()
  };

  try {
    const id = 'p' + Date.now() + Math.random().toString(36).slice(2, 6);
    await setDoc(doc(db, 'participants', id), newP);
    closeModal('modal-participant');
    // Mostrar modal con el código
    $('codigo-modal-name').textContent = nombre;
    $('codigo-modal-val').textContent = codigo;
    $('codigo-modal-code-text').textContent = codigo;
    $('codigo-modal-url').textContent = window.location.href.split('?')[0].split('#')[0];
    openModal('modal-codigo');
  } catch (err) {
    showToast('❌ Error: ' + err.message, 'error');
  }
}

function copyCodigoModal() {
  const code = $('codigo-modal-val').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Código copiado', 'success', 1500);
  });
}

async function togglePago(pid) {
  const p = state.participants.find(x => x.id === pid);
  if (!p) return;
  const newPago = p.pago === 'pagado' ? 'pendiente' : 'pagado';
  try {
    await setDoc(doc(db, 'participants', pid), { pago: newPago }, { merge: true });
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function deleteParticipant(pid) {
  const p = state.participants.find(x => x.id === pid);
  if (!p) return;
  if (!confirm(`¿Eliminar a "${p.nombre}"?\n\nTambién se borrará su quiniela. Esta acción no se puede deshacer.`)) return;
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'participants', pid));
    batch.delete(doc(db, 'quinielas', pid));
    await batch.commit();
    showToast('Participante eliminado', 'success');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

function openPozoCalc() {
  const paid = state.participants.filter(p => p.pago === 'pagado').length;
  const total_p = state.participants.length;
  const cuota = state.config.cuota;
  const mult = state.config.mult;
  const emp = paid * cuota;
  const empresa = emp * (mult - 1);
  const pozo = emp + empresa;
  $('pozo-content').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center;">
      <div class="stat-pill"><div class="num">$${emp.toLocaleString()}</div><div class="lbl">Cuota empleados</div></div>
      <div style="font-family:'Bebas Neue';font-size:32px;color:var(--muted);">+</div>
      <div class="stat-pill"><div class="num" style="color:var(--gold);">$${empresa.toLocaleString()}</div><div class="lbl">Empresa ${mult}×</div></div>
      <div style="font-family:'Bebas Neue';font-size:32px;color:var(--gold);">=</div>
      <div class="stat-pill"><div class="num" style="color:var(--gold);">$${pozo.toLocaleString()}</div><div class="lbl">🏆 Premio total</div></div>
    </div>
    <p style="margin-top:16px;font-size:13px;color:var(--muted);text-align:center;">
      ${paid} de ${total_p} participantes han pagado · Cuota $${cuota} c/u · Multiplicador ${mult}×
    </p>`;
  openModal('modal-pozo');
}

// ═══════════════════════════════════════════
// ELIMINATORIA: LÓGICA DE BLOQUEO
// ═══════════════════════════════════════════
function isElimUnlocked() {
  // Desbloqueada si:
  // 1) El admin la abrió manualmente, O
  // 2) La fecha actual >= fecha de desbloqueo
  if (state.elimOverride === true) return true;
  return new Date() >= ELIM_UNLOCK_DATE;
}

function updateElimCountdown() {
  const now = new Date();
  const diff = ELIM_UNLOCK_DATE - now;
  if (diff <= 0) {
    // Ya pasó la fecha, re-render para mostrar el bracket
    if (elimCountdownInterval) { clearInterval(elimCountdownInterval); elimCountdownInterval = null; }
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-eliminatoria') renderEliminatoria();
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const dEl = $('cd-days'), hEl = $('cd-hours'), mEl = $('cd-mins');
  if (dEl) dEl.textContent = String(days).padStart(2,'0');
  if (hEl) hEl.textContent = String(hours).padStart(2,'0');
  if (mEl) mEl.textContent = String(mins).padStart(2,'0');
}

async function toggleElimLock(unlock) {
  if (session.type !== 'admin') return;
  try {
    await setDoc(doc(db, 'config', 'elim'), { override: unlock }, { merge: true });
    showToast(unlock ? '🔓 Eliminatoria desbloqueada manualmente' : '🔒 Eliminatoria en modo automático', 'success');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

// ═══════════════════════════════════════════
// RENDER: ELIMINATORIA
// ═══════════════════════════════════════════
function renderEliminatoria() {
  const lockedEl = $('elim-locked');
  const unlockedEl = $('elim-unlocked');
  const unlocked = isElimUnlocked();

  if (!unlocked) {
    // Mostrar bloqueo
    if (lockedEl) lockedEl.style.display = 'block';
    if (unlockedEl) unlockedEl.style.display = 'none';
    // Mostrar hint para admin si aplica
    const adminHint = $('elim-admin-hint');
    if (adminHint) adminHint.style.display = session.type === 'admin' ? 'block' : 'none';
    // Iniciar countdown si no estaba corriendo
    updateElimCountdown();
    if (!elimCountdownInterval) {
      elimCountdownInterval = setInterval(updateElimCountdown, 30000); // cada 30s
    }
    return;
  }

  // Desbloqueada: mostrar bracket
  if (lockedEl) lockedEl.style.display = 'none';
  if (unlockedEl) unlockedEl.style.display = 'block';
  if (elimCountdownInterval) { clearInterval(elimCountdownInterval); elimCountdownInterval = null; }

  // Actualizar UI del toggle
  const currentView = getElimView();
  const btnB = $('elim-view-bracket-btn');
  const btnL = $('elim-view-list-btn');
  if (btnB && btnL) {
    if (currentView === 'bracket') {
      btnB.style.background = 'var(--green)'; btnB.style.color = '#fff';
      btnL.style.background = 'transparent'; btnL.style.color = 'var(--muted)';
    } else {
      btnB.style.background = 'transparent'; btnB.style.color = 'var(--muted)';
      btnL.style.background = 'var(--green)'; btnL.style.color = '#fff';
    }
  }

  if (currentView === 'bracket') {
    renderElimBracket();
  } else {
    renderElimList();
  }

  // ★ IMPORTANTE: aplicar permisos después de renderizar
  // Sin esto, los selects/inputs recién creados quedarían editables para empleados
  toggleEditableInputs();
}

// ---------- Vista LISTA (la que ya teníamos) ----------
function renderElimList() {
  let html = '';
  ELIM_ROUNDS.forEach(round => {
    html += `<div class="bracket-section">
      <div class="bracket-round-title">🔥 ${round.label} (${state.pts['elim_' + round.id] || 0} pts c/u)</div>
      <div class="bracket-matches">`;
    for (let i = 0; i < round.matches; i++) {
      const key = `${round.id}_${i}`;
      const r = state.elimResults[key] || { home: '', away: '', h: '', a: '', winner: '' };
      const homeVal = r.home || '';
      const awayVal = r.away || '';
      // Opciones del select de ganador (solo home y away)
      let winnerOpts = '<option value="">— Sin definir —</option>';
      if (homeVal) winnerOpts += `<option value="${escapeHtml(homeVal)}"${r.winner === homeVal ? ' selected' : ''}>🏆 ${escapeHtml(TEAMS[homeVal] || homeVal)}</option>`;
      if (awayVal && awayVal !== homeVal) winnerOpts += `<option value="${escapeHtml(awayVal)}"${r.winner === awayVal ? ' selected' : ''}>🏆 ${escapeHtml(TEAMS[awayVal] || awayVal)}</option>`;
      if (r.winner && r.winner !== homeVal && r.winner !== awayVal) {
        winnerOpts += `<option value="${escapeHtml(r.winner)}" selected>🏆 ${escapeHtml(TEAMS[r.winner] || r.winner)}</option>`;
      }
      html += `<div class="bracket-match">
        <div class="bracket-match-num">Partido ${i + 1}</div>
        <div class="bracket-teams-row" style="grid-template-columns:1fr;gap:8px;">
          <select class="bracket-team-input" id="em_${key}_home" onchange="onElimTeamChange('${key}')" style="text-align:center;">${getTeamOptions(homeVal, '— Equipo local —')}</select>
          <div style="text-align:center;color:var(--muted);font-size:11px;font-weight:600;letter-spacing:2px;">VS</div>
          <select class="bracket-team-input" id="em_${key}_away" onchange="onElimTeamChange('${key}')" style="text-align:center;">${getTeamOptions(awayVal, '— Equipo visitante —')}</select>
        </div>
        <div class="bracket-scores-row">
          <input class="bracket-score-box" type="number" min="0" max="9" placeholder="-" value="${r.h !== '' && r.h !== null && r.h !== undefined ? r.h : ''}" id="em_${key}_h" onchange="saveElimResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
          <span class="score-sep">:</span>
          <input class="bracket-score-box" type="number" min="0" max="9" placeholder="-" value="${r.a !== '' && r.a !== null && r.a !== undefined ? r.a : ''}" id="em_${key}_a" onchange="saveElimResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
        </div>
        <div class="bracket-winner-row">
          <label style="margin-bottom:0;font-size:10px;">Ganador:</label>
          <select class="bracket-winner-select" id="em_${key}_winner" onchange="saveElimResult('${key}')">${winnerOpts}</select>
        </div>
      </div>`;
    }
    html += `</div></div>`;
  });
  $('bracket-content').innerHTML = html;
}

// ---------- Vista BRACKET (estilo FIFA) ----------
function getElimView() {
  try {
    const v = localStorage.getItem('quiniela_elim_view');
    return v === 'list' ? 'list' : 'bracket'; // default: bracket
  } catch(e) { return 'bracket'; }
}

function setElimView(view) {
  try { localStorage.setItem('quiniela_elim_view', view); } catch(e){}
  renderEliminatoria();
}

function renderElimBracket() {
  // Helper para renderizar una "mini-card" de un partido de cualquier ronda
  // El bracket FIFA tiene 16 partidos de 16vos: 8 en cada lado.
  // Dividimos por mitades: izquierda = partidos 0-7, derecha = partidos 8-15
  function miniMatch(roundId, idx, side) {
    const key = `${roundId}_${idx}`;
    const r = state.elimResults[key] || { home: '', away: '', h: '', a: '', winner: '' };
    const homeVal = r.home || '';
    const awayVal = r.away || '';
    const hasScore = (r.h !== '' && r.h !== null && r.h !== undefined && r.a !== '' && r.a !== null && r.a !== undefined);
    const winnerClass = r.winner ? ' has-winner' : '';
    const homeWinner = r.winner && r.winner === homeVal ? ' winner' : '';
    const awayWinner = r.winner && r.winner === awayVal ? ' winner' : '';
    const scoreStr = hasScore ? `${r.h}<span style="opacity:.5;margin:0 3px;">·</span>${r.a}` : '<span class="empty">vs</span>';
    const homeDisplay = homeVal ? `<span class="name" title="${escapeHtml(getTeamName(homeVal))}">${escapeHtml(homeVal)}</span>` : `<span class="empty">—</span>`;
    const awayDisplay = awayVal ? `<span class="name" title="${escapeHtml(getTeamName(awayVal))}">${escapeHtml(awayVal)}</span>` : `<span class="empty">—</span>`;
    return `<div class="bracket-mini-match${winnerClass}" onclick="openElimEditor('${roundId}',${idx})" title="Click para editar" style="cursor:${session.type==='admin' ? 'pointer' : 'default'};">
      <div class="bracket-mini-team${homeWinner}">${homeDisplay}</div>
      <div class="bracket-mini-score${hasScore?'':' empty'}">${scoreStr}</div>
      <div class="bracket-mini-team right${awayWinner}">${awayDisplay}</div>
    </div>`;
  }

  // Renderiza una ronda completa para un lado dado (left / right)
  function renderRoundSide(roundId, label, side) {
    const round = ELIM_ROUNDS.find(r => r.id === roundId);
    if (!round) return '';
    const totalMatches = round.matches;
    const halfMatches = Math.floor(totalMatches / 2);
    let startIdx, endIdx;
    if (totalMatches === 1) {
      // Final o 3er lugar: una sola, va al centro pero aquí dejamos vacío en lados
      return '';
    }
    if (side === 'left') { startIdx = 0; endIdx = halfMatches; }
    else { startIdx = halfMatches; endIdx = totalMatches; }
    let html = `<div class="bracket-round-block">
      <div class="bracket-round-title-fifa">${label} (${state.pts['elim_'+roundId]||0} pts)</div>
      <div class="bracket-r16-list">`;
    for (let i = startIdx; i < endIdx; i++) {
      html += miniMatch(roundId, i, side);
    }
    html += `</div></div>`;
    return html;
  }

  // Renderiza Final + 3er lugar en el centro
  function renderCenterMatches() {
    const finRound = ELIM_ROUNDS.find(r => r.id === 'fin');
    const thirdRound = ELIM_ROUNDS.find(r => r.id === '3rd');
    let html = '';
    if (finRound) {
      html += `<div class="bracket-round-block" style="width:100%;max-width:240px;">
        <div class="bracket-round-title-fifa" style="color:var(--gold);">🏆 FINAL (${state.pts['elim_fin']||0} pts)</div>`;
      html += miniMatch('fin', 0, 'center');
      html += `</div>`;
    }
    if (thirdRound) {
      html += `<div class="bracket-round-block" style="width:100%;max-width:240px;margin-top:20px;">
        <div class="bracket-round-title-fifa" style="color:#cd7f32;">🥉 TERCER LUGAR (${state.pts['elim_3rd']||0} pts)</div>`;
      html += miniMatch('3rd', 0, 'center');
      html += `</div>`;
    }
    return html;
  }

  // Construir layout principal
  let html = `<div class="bracket-layout">

    <!-- LADO IZQUIERDO -->
    <div class="bracket-side">
      ${renderRoundSide('r32', 'Dieciseisavos', 'left')}
      ${renderRoundSide('r16', 'Octavos', 'left')}
      ${renderRoundSide('qf', 'Cuartos', 'left')}
      ${renderRoundSide('sf', 'Semifinal', 'left')}
    </div>

    <!-- CENTRO -->
    <div class="bracket-center">
      <div class="bracket-trophy">🏆</div>
      <div class="bracket-center-title">WORLD CHAMPIONS</div>
      ${renderCenterMatches()}
      <div class="bracket-trophy" style="opacity:.2;">🥉</div>
    </div>

    <!-- LADO DERECHO -->
    <div class="bracket-side">
      ${renderRoundSide('r32', 'Dieciseisavos', 'right')}
      ${renderRoundSide('r16', 'Octavos', 'right')}
      ${renderRoundSide('qf', 'Cuartos', 'right')}
      ${renderRoundSide('sf', 'Semifinal', 'right')}
    </div>

  </div>`;

  // Si admin, mostrar instrucción
  if (session.type === 'admin') {
    html = `<div class="alert alert-info" style="margin-bottom:16px;">💡 Haz click en cualquier partido del bracket para editarlo en un modal. O cambia a vista <strong>Lista</strong> para ver todos los inputs juntos.</div>` + html;
  }

  $('bracket-content').innerHTML = html;
}

// ---------- Editor modal para vista bracket ----------
let currentElimEdit = null;

function openElimEditor(roundId, idx) {
  if (session.type !== 'admin') return;
  if (!isElimUnlocked()) {
    showToast('🔒 La eliminatoria está bloqueada', 'warn');
    return;
  }
  currentElimEdit = { roundId, idx };
  const key = `${roundId}_${idx}`;
  const r = state.elimResults[key] || { home: '', away: '', h: '', a: '', winner: '' };
  const round = ELIM_ROUNDS.find(rr => rr.id === roundId);
  const roundLabel = round ? round.label : '';
  const pts = state.pts['elim_' + roundId] || 0;

  $('elim-edit-title').textContent = `${roundLabel} · Partido ${idx + 1}`;
  $('elim-edit-sub').textContent = `Vale ${pts} puntos al ganador`;

  // Poblar selects de equipos
  $('elim-edit-home').innerHTML = getTeamOptions(r.home || '', '— Equipo local —');
  $('elim-edit-away').innerHTML = getTeamOptions(r.away || '', '— Equipo visitante —');
  $('elim-edit-h').value = r.h !== '' && r.h !== null && r.h !== undefined ? r.h : '';
  $('elim-edit-a').value = r.a !== '' && r.a !== null && r.a !== undefined ? r.a : '';

  // Refrescar opciones del select de ganador
  rebuildElimEditWinnerOptions();

  openModal('modal-elim-edit');
}

function rebuildElimEditWinnerOptions() {
  const home = $('elim-edit-home').value.trim();
  const away = $('elim-edit-away').value.trim();
  if (!currentElimEdit) return;
  const key = `${currentElimEdit.roundId}_${currentElimEdit.idx}`;
  const r = state.elimResults[key] || {};
  const currentWinner = $('elim-edit-winner').value || r.winner || '';
  let options = '<option value="">— Sin definir —</option>';
  if (home) options += `<option value="${escapeHtml(home)}"${currentWinner === home ? ' selected' : ''}>🏆 ${escapeHtml(TEAMS[home] || home)}</option>`;
  if (away && away !== home) options += `<option value="${escapeHtml(away)}"${currentWinner === away ? ' selected' : ''}>🏆 ${escapeHtml(TEAMS[away] || away)}</option>`;
  if (currentWinner && currentWinner !== home && currentWinner !== away) {
    options += `<option value="${escapeHtml(currentWinner)}" selected>🏆 ${escapeHtml(TEAMS[currentWinner] || currentWinner)}</option>`;
  }
  $('elim-edit-winner').innerHTML = options;
}

async function saveElimEditor() {
  if (!currentElimEdit) return;
  if (session.type !== 'admin') return;
  if (!isElimUnlocked()) { showToast('🔒 Bloqueada', 'warn'); return; }
  const key = `${currentElimEdit.roundId}_${currentElimEdit.idx}`;
  const home = $('elim-edit-home').value.trim();
  const away = $('elim-edit-away').value.trim();
  const hRaw = $('elim-edit-h').value;
  const aRaw = $('elim-edit-a').value;
  const winner = $('elim-edit-winner').value.trim();
  const h = hRaw === '' ? '' : parseInt(hRaw);
  const a = aRaw === '' ? '' : parseInt(aRaw);

  try {
    const ref = doc(db, 'elimResults', 'all');
    if (!home && !away && h === '' && a === '' && !winner) {
      await setDoc(ref, { matches: { [key]: deleteField() } }, { merge: true });
    } else {
      await setDoc(ref, { matches: { [key]: { home, away, h, a, winner } } }, { merge: true });
    }
    closeModal('modal-elim-edit');
    showToast('✅ Guardado', 'success');
    flash();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

// Cuando cambia un equipo en vista lista de elim, refresca el select de ganador y guarda
function onElimTeamChange(key) {
  const homeEl = $('em_' + key + '_home');
  const awayEl = $('em_' + key + '_away');
  const winnerEl = $('em_' + key + '_winner');
  if (homeEl && awayEl && winnerEl) {
    const home = homeEl.value;
    const away = awayEl.value;
    const currentWinner = winnerEl.value;
    let opts = '<option value="">— Sin definir —</option>';
    if (home) opts += `<option value="${home}"${currentWinner === home ? ' selected' : ''}>🏆 ${TEAMS[home] || home}</option>`;
    if (away && away !== home) opts += `<option value="${away}"${currentWinner === away ? ' selected' : ''}>🏆 ${TEAMS[away] || away}</option>`;
    winnerEl.innerHTML = opts;
  }
  // Guardar después de actualizar opciones
  saveElimResult(key);
}

async function saveElimResult(key) {
  if (session.type !== 'admin') return;
  if (!isElimUnlocked()) {
    showToast('🔒 La eliminatoria está bloqueada. Desbloquéala en Admin.', 'warn', 4000);
    return;
  }
  const home = $('em_' + key + '_home').value.trim();
  const away = $('em_' + key + '_away').value.trim();
  const hRaw = $('em_' + key + '_h').value;
  const aRaw = $('em_' + key + '_a').value;
  const winner = $('em_' + key + '_winner').value.trim();
  const h = hRaw === '' ? '' : parseInt(hRaw);
  const a = aRaw === '' ? '' : parseInt(aRaw);

  try {
    const ref = doc(db, 'elimResults', 'all');
    if (!home && !away && h === '' && a === '' && !winner) {
      await setDoc(ref, { matches: { [key]: deleteField() } }, { merge: true });
    } else {
      await setDoc(ref, { matches: { [key]: { home, away, h, a, winner } } }, { merge: true });
    }
    showToast('✅ Guardado', 'success', 1200);
    // Re-renderizar para actualizar las opciones del selector
    setTimeout(() => {
      const target = $('em_' + key + '_winner');
      if (target && document.activeElement !== target) renderEliminatoria();
    }, 100);
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

// ═══════════════════════════════════════════
// RENDER: ADMIN
// ═══════════════════════════════════════════
function renderAdmin() {
  $('cfg-cuota').value = state.config.cuota;
  $('cfg-mult').value = state.config.mult;
  $('cfg-nombre').value = state.config.nombre;
  $('cfg-empresa').value = state.config.empresa;

  $('pts-config').innerHTML = Object.keys(PTS_LABELS).map(k => `
    <div class="form-group" style="margin:0;">
      <label>${PTS_LABELS[k]}</label>
      <input type="number" min="0" max="20" id="pts_${k}" value="${state.pts[k] != null ? state.pts[k] : DEFAULT_PTS[k]}">
    </div>`).join('');

  const fbStatus = $('firebase-status');
  if (fbStatus) {
    fbStatus.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:10px;">
        <span class="badge ${isConnected ? 'badge-green' : 'badge-red'}">${isConnected ? '🟢 Conectado' : '🔴 Sin conexión'}</span>
        <span class="badge badge-muted">📊 ${state.participants.length} participantes</span>
        <span class="badge badge-muted">📝 ${Object.keys(state.quinielas).length} quinielas</span>
        <span class="badge badge-muted">⚽ ${Object.keys(state.results).length} resultados</span>
      </div>`;
  }

  // Estado del control de eliminatoria
  const elimCtrl = $('elim-control-status');
  if (elimCtrl) {
    const dateReached = new Date() >= ELIM_UNLOCK_DATE;
    const isOverride = state.elimOverride === true;
    const unlocked = isElimUnlocked();
    let statusBadge, statusDetail;
    if (isOverride) {
      statusBadge = '<span class="badge badge-gold">🔓 DESBLOQUEADA MANUALMENTE</span>';
      statusDetail = 'Tú activaste el modo manual. La pestaña Eliminatoria está abierta para todos.';
    } else if (dateReached) {
      statusBadge = '<span class="badge badge-green">🔓 DESBLOQUEADA (auto)</span>';
      statusDetail = 'La fecha del 28 de junio ya pasó. La eliminatoria está abierta automáticamente.';
    } else {
      statusBadge = '<span class="badge badge-muted">🔒 BLOQUEADA (auto)</span>';
      const diff = ELIM_UNLOCK_DATE - new Date();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      statusDetail = `Faltan ~${days} días para el desbloqueo automático (28 de junio 2026).`;
    }
    elimCtrl.innerHTML = `<div style="margin-bottom:8px;">${statusBadge}</div><p style="color:var(--muted);">${statusDetail}</p>`;

    // Habilitar/deshabilitar botones
    const btnUnlock = $('btn-elim-unlock');
    const btnRelock = $('btn-elim-relock');
    if (btnUnlock) btnUnlock.disabled = isOverride;
    if (btnRelock) btnRelock.disabled = !isOverride;
  }
}

async function saveConfig() {
  const c = {
    cuota: parseInt($('cfg-cuota').value) || 150,
    mult: parseFloat($('cfg-mult').value) || 2,
    nombre: $('cfg-nombre').value || 'Quiniela Modumex',
    empresa: $('cfg-empresa').value || 'Grupo Modumex'
  };
  try {
    await setDoc(doc(db, 'config', 'general'), c);
    showToast('✅ Configuración guardada', 'success');
    flash();
  } catch (err) { showToast('❌ ' + err.message, 'error'); }
}

async function savePts() {
  const newPts = {};
  Object.keys(PTS_LABELS).forEach(k => {
    const el = $('pts_' + k);
    if (el) newPts[k] = parseInt(el.value) || 0;
  });
  try {
    await setDoc(doc(db, 'config', 'puntos'), newPts);
    showToast('✅ Puntos guardados', 'success');
    flash();
  } catch (err) { showToast('❌ ' + err.message, 'error'); }
}

async function resetAll() {
  if (!confirm('¿BORRAR TODA LA BASE DE DATOS?\n\nSe eliminarán todos los participantes, quinielas y resultados.')) return;
  if (!confirm('⚠️ ÚLTIMA CONFIRMACIÓN ⚠️\n\nEsta acción NO se puede deshacer.\n\n¿Estás 100% seguro?')) return;
  try {
    const batch = writeBatch(db);
    state.participants.forEach(p => batch.delete(doc(db, 'participants', p.id)));
    Object.keys(state.quinielas).forEach(pid => batch.delete(doc(db, 'quinielas', pid)));
    batch.delete(doc(db, 'results', 'all'));
    batch.delete(doc(db, 'elimResults', 'all'));
    batch.delete(doc(db, 'config', 'general'));
    batch.delete(doc(db, 'config', 'puntos'));
    await batch.commit();
    showToast('Base de datos reiniciada', 'success');
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

// ═══════════════════════════════════════════
// MODAL & TABS HELPERS
// ═══════════════════════════════════════════
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

function switchInner(prefix, activeId, btn) {
  const tabsEl = btn.closest('.inner-tabs');
  if (tabsEl) tabsEl.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  let pages = tabsEl ? tabsEl.nextElementSibling : null;
  if (!pages || !$(activeId)) {
    const target = $(activeId);
    if (target) {
      document.querySelectorAll('.inner-page').forEach(p => {
        if (p.id && p.id.startsWith(prefix)) p.classList.remove('active');
      });
      target.classList.add('active');
    }
    return;
  }
  pages.querySelectorAll('.inner-page').forEach(p => p.classList.remove('active'));
  const target = pages.querySelector('#' + activeId) || $(activeId);
  if (target) target.classList.add('active');
}

// ═══════════════════════════════════════════
// EXPONER FUNCIONES GLOBALMENTE (para onclick="" en HTML)
// ═══════════════════════════════════════════
window.showPage = showPage;
window.navigateTo = navigateTo;
window.openLogin = openLogin;
window.closeLoginModal = closeLoginModal;
window.switchLoginTab = switchLoginTab;
window.doLoginAdmin = doLoginAdmin;
window.doLoginEmpleado = doLoginEmpleado;
window.logout = logout;
window.saveResult = saveResult;
window.showQuiniela = showQuiniela;
window.openEditQuiniela = openEditQuiniela;
window.openEditCurrentQuiniela = openEditCurrentQuiniela;
window.openEditMiQuiniela = openEditMiQuiniela;
window.saveQuiniela = saveQuiniela;
window.updateElimWinnerSelect = updateElimWinnerSelect;
window.openAddParticipant = openAddParticipant;
window.saveParticipant = saveParticipant;
window.togglePago = togglePago;
window.deleteParticipant = deleteParticipant;
window.openPozoCalc = openPozoCalc;
window.copyCodigoModal = copyCodigoModal;
window.saveElimResult = saveElimResult;
window.onElimTeamChange = onElimTeamChange;
window.toggleElimLock = toggleElimLock;
window.setElimView = setElimView;
window.openElimEditor = openElimEditor;
window.saveElimEditor = saveElimEditor;
window.rebuildElimEditWinnerOptions = rebuildElimEditWinnerOptions;
window.saveConfig = saveConfig;
window.savePts = savePts;
window.resetAll = resetAll;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchInner = switchInner;
window.showToast = showToast;

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  restoreSession();
  updateAuthUI();

  // Mostrar inicio por default
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $('page-inicio').classList.add('active');

  // Cerrar modales clickeando el fondo
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => {
      if (e.target === o) o.classList.remove('open');
    });
  });

  const loginModal = $('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', e => {
      if (e.target === loginModal) closeLoginModal();
    });
  }

  // Conectar a Firestore
  setStatus('loading','Conectando...');
  attachListeners();
});
