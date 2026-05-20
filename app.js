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
  elim_r32: 2, elim_r16: 4, elim_qf: 5, elim_sf: 6, elim_fin: 8, elim_3rd: 4
};

const PTS_LABELS = {
  grupo_exacto: 'Marcador exacto (grupos)',
  grupo_ganador: 'Ganador/empate (grupos)',
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

let session = { type: null, pid: null, nombre: null }; // type: 'admin' | 'empleado' | null
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

function getFlag(code) {
  const t = TEAMS[code] || '';
  return t.split(' ')[0] || '🏳';
}

function getShortName(code) { return code; }

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
      if (!real || !real.winner) continue;
      if (!pred || !pred.winner) continue;
      if (real.winner.toUpperCase() === pred.winner.toUpperCase()) {
        const pts = state.pts['elim_' + round.id] || DEFAULT_PTS['elim_' + round.id] || 0;
        detail[key] = pts;
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
      <div class="team-home"><span class="team-flag">${getFlag(m[0])}</span> ${getShortName(m[0])}</div>
      <div class="score-inputs">
        <input class="score-box" type="number" min="0" max="9" maxlength="1" value="${r.h !== null && r.h !== undefined ? r.h : ''}" placeholder="-" id="res_${key}_h" onchange="saveResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
        <span class="score-sep">:</span>
        <input class="score-box" type="number" min="0" max="9" maxlength="1" value="${r.a !== null && r.a !== undefined ? r.a : ''}" placeholder="-" id="res_${key}_a" onchange="saveResult('${key}')" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
      </div>
      <div class="team-away">${getShortName(m[1])} <span class="team-flag">${getFlag(m[1])}</span></div>
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

  html += `<div style="margin-bottom:20px;">
    <button class="btn btn-green" onclick="openEditMiQuiniela()">✏️ Capturar / Editar mi quiniela</button>
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
        <div style="font-size:12px;text-align:right;font-weight:500;">${getFlag(m[0])} ${getShortName(m[0])}</div>
        <div style="text-align:center;font-family:'Bebas Neue';font-size:16px;color:${hasPred?'var(--gold)':'var(--muted)'};letter-spacing:1px;">
          <span>${ph}</span><span style="opacity:.5;margin:0 2px;">·</span><span>${pa}</span>
        </div>
        <div style="font-size:12px;text-align:left;font-weight:500;">${getShortName(m[1])} ${getFlag(m[1])}</div>
        <div style="text-align:center;font-family:'Bebas Neue';font-size:16px;color:${hasReal?'var(--white)':'var(--muted)'};letter-spacing:1px;">
          <span>${rh}</span><span style="opacity:.5;margin:0 2px;">·</span><span>${ra}</span>
        </div>
        <div style="text-align:center;"><span class="pts-chip${pts === 0 ? ' zero' : ''}">${pts}</span></div>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
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
  $('qm-title').textContent = (p.nombre).toUpperCase() + ' · QUINIELA';
  $('qm-sub').textContent = 'Predicciones fase de grupos · Tus cambios se guardan al hacer clic en Guardar';
  const q = state.quinielas[pid] || { groups: {}, elim: {} };
  const gkeys = Object.keys(GROUPS);
  $('qm-tabs').innerHTML = gkeys.map((g, i) =>
    `<button class="inner-tab${i === 0 ? ' active' : ''}" onclick="switchInner('qmg','qmg-${g}',this)">Grupo ${g}</button>`
  ).join('');

  let content = '';
  gkeys.forEach((g, i) => {
    content += `<div id="qmg-${g}" class="inner-page${i === 0 ? ' active' : ''}">
      <div class="group-card" style="border-radius:12px;overflow:hidden;">
        <div class="group-header ${g}">⚽ GRUPO ${g} — Predicciones</div>`;
    GROUPS[g].forEach((m, idx) => {
      const key = `G_${g}_${idx}`;
      const pred = (q.groups && q.groups[key]) || { h: '', a: '' };
      content += `<div class="match-predict">
        <div class="team-home"><span>${getFlag(m[0])}</span> ${getShortName(m[0])}</div>
        <div class="score-inputs">
          <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.h !== '' && pred.h !== null && pred.h !== undefined ? pred.h : ''}" placeholder="-" id="q_${key}_h" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
          <span class="score-sep">:</span>
          <input class="predict-input" type="number" min="0" max="9" maxlength="1" value="${pred.a !== '' && pred.a !== null && pred.a !== undefined ? pred.a : ''}" placeholder="-" id="q_${key}_a" oninput="if(this.value.length>1)this.value=this.value.slice(-1);" onfocus="this.select()">
        </div>
        <div class="team-away">${getShortName(m[1])} <span>${getFlag(m[1])}</span></div>
      </div>`;
    });
    content += `</div></div>`;
  });
  $('qm-content').innerHTML = content;
  openModal('modal-quiniela');
}

async function saveQuiniela() {
  if (!currentQuinielaPid) return;

  // Permisos: admin puede editar cualquiera; empleado solo la suya
  if (session.type !== 'admin' && !(session.type === 'empleado' && session.pid === currentQuinielaPid)) {
    showToast('No tienes permiso para editar esta quiniela', 'error');
    return;
  }

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

  try {
    const ref = doc(db, 'quinielas', currentQuinielaPid);
    // Preserva elim si ya existía
    const existing = state.quinielas[currentQuinielaPid] || {};
    await setDoc(ref, {
      groups,
      elim: existing.elim || {},
      actualizado: serverTimestamp()
    }, { merge: false });
    closeModal('modal-quiniela');
    showToast('✅ Quiniela guardada', 'success');
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
      // Opciones para el select de ganador
      let options = '<option value="">— Sin definir —</option>';
      if (homeVal) options += `<option value="${escapeHtml(homeVal)}"${r.winner === homeVal ? ' selected' : ''}>🏆 ${escapeHtml(homeVal)}</option>`;
      if (awayVal && awayVal !== homeVal) options += `<option value="${escapeHtml(awayVal)}"${r.winner === awayVal ? ' selected' : ''}>🏆 ${escapeHtml(awayVal)}</option>`;
      // Si el winner está pero no coincide con home/away (caso raro), incluirlo
      if (r.winner && r.winner !== homeVal && r.winner !== awayVal) {
        options += `<option value="${escapeHtml(r.winner)}" selected>🏆 ${escapeHtml(r.winner)}</option>`;
      }
      html += `<div class="bracket-match">
        <div class="bracket-match-num">Partido ${i + 1}</div>
        <div class="bracket-teams-row">
          <input class="bracket-team-input" placeholder="Equipo A" value="${escapeHtml(homeVal)}" id="em_${key}_home" onchange="saveElimResult('${key}')">
          <div style="text-align:center;color:var(--muted);font-size:12px;">vs</div>
          <input class="bracket-team-input" placeholder="Equipo B" value="${escapeHtml(awayVal)}" id="em_${key}_away" onchange="saveElimResult('${key}')">
        </div>
        <div class="bracket-scores-row">
          <input class="bracket-score-box" type="number" min="0" placeholder="-" value="${r.h !== '' && r.h !== null && r.h !== undefined ? r.h : ''}" id="em_${key}_h" onchange="saveElimResult('${key}')">
          <span class="score-sep">:</span>
          <input class="bracket-score-box" type="number" min="0" placeholder="-" value="${r.a !== '' && r.a !== null && r.a !== undefined ? r.a : ''}" id="em_${key}_a" onchange="saveElimResult('${key}')">
        </div>
        <div class="bracket-winner-row">
          <label style="margin-bottom:0;font-size:10px;">Ganador:</label>
          <select class="bracket-winner-select" id="em_${key}_winner" onchange="saveElimResult('${key}')">${options}</select>
        </div>
      </div>`;
    }
    html += `</div></div>`;
  });
  $('bracket-content').innerHTML = html;
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
window.openAddParticipant = openAddParticipant;
window.saveParticipant = saveParticipant;
window.togglePago = togglePago;
window.deleteParticipant = deleteParticipant;
window.openPozoCalc = openPozoCalc;
window.copyCodigoModal = copyCodigoModal;
window.saveElimResult = saveElimResult;
window.toggleElimLock = toggleElimLock;
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
