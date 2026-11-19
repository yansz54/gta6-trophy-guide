// Leonida Legend — GTA VI Trophy Guide & Tracker.
// Vanilla JS, no libraries, no network at run time except the same-origin
// fetch of data/trophies.json. Progress lives in localStorage only.
import { ROADMAP_STAGES, CHECKLIST_100, renderRoadmap } from './roadmap.js';

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-legend-v2';
const DEFAULT_SELECTED_ID = 'cunning-stunts';

let trophyData = null;
let earnedTrophies = new Set();
let spoilerOn = true;
let selectedTrophyId = DEFAULT_SELECTED_ID;
let requestedSelectedId = null; // from ?selected= — applied once the data loads.
let currentFilters = { q: '', grade: 'all', kind: 'all', earned: 'all' };

const $ = function (id) { return document.getElementById(id); };

function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    earnedTrophies = new Set(Array.isArray(saved.earned) ? saved.earned : []);
    spoilerOn = saved.spoilerOn !== false;
  } catch (err) {
    earnedTrophies = new Set();
    spoilerOn = true;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: Array.from(earnedTrophies), spoilerOn: spoilerOn }));
  } catch (err) {
    // Storage unavailable (private mode): the tracker still works in memory.
  }
}

function trophyById(id) {
  return trophyData.trophies.find(function (t) { return t.id === id; }) || null;
}

function isSpoilerHidden(trophy) {
  return spoilerOn && trophy.kind.indexOf('story') !== -1 && !earnedTrophies.has(trophy.id);
}

function trophyMatchesFilters(trophy) {
  const f = currentFilters;
  if (f.grade !== 'all' && trophy.grade !== f.grade) return false;
  if (f.kind !== 'all' && trophy.kind.indexOf(f.kind) === -1) return false;
  if (f.earned === 'earned' && !earnedTrophies.has(trophy.id)) return false;
  if (f.earned === 'not-earned' && earnedTrophies.has(trophy.id)) return false;
  if (f.q) {
    const hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide + ' ' + trophy.steps.join(' ')).toLowerCase();
    if (hay.indexOf(f.q) === -1) return false;
  }
  return true;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  if (kind === 'story') return 'Story';
  if (kind === 'missable') return 'Missable';
  if (kind === 'collectibles') return 'Collectible';
  if (kind === 'activities') return 'Activity';
  if (kind === 'platinum') return 'Platinum';
  return kind;
}

function formatCount(trophy) {
  if (typeof trophy.count !== 'number') return null;
  return 'Target: ' + trophy.count.toLocaleString('en-US');
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function renderProgressBar() {
  const total = trophyData.trophies.length;
  const done = earnedTrophies.size;
  $('progressCount').textContent = done + ' / ' + total + ' earned';
  $('progressFill').style.width = (total === 0 ? 0 : Math.round((done / total) * 100)) + '%';
  const perGrade = {};
  for (const t of trophyData.trophies) {
    perGrade[t.grade] = perGrade[t.grade] || { done: 0, total: 0 };
    perGrade[t.grade].total += 1;
    if (earnedTrophies.has(t.id)) perGrade[t.grade].done += 1;
  }
  $('progressGrades').textContent =
    'P ' + perGrade.platinum.done + '/' + perGrade.platinum.total +
    ' · G ' + perGrade.gold.done + '/' + perGrade.gold.total +
    ' · S ' + perGrade.silver.done + '/' + perGrade.silver.total +
    ' · B ' + perGrade.bronze.done + '/' + perGrade.bronze.total;
}

function renderTrophyList() {
  const list = $('trophyList');
  list.innerHTML = '';
  const visible = trophyData.trophies.filter(trophyMatchesFilters);
  $('listEmpty').hidden = visible.length !== 0;
  for (const trophy of visible) {
    const hidden = isSpoilerHidden(trophy);
    const row = el('li', 'trophy-row' + (earnedTrophies.has(trophy.id) ? ' earned' : '') + (trophy.id === selectedTrophyId ? ' selected' : ''));
    row.dataset.id = trophy.id;

    const check = el('input', null);
    check.type = 'checkbox';
    check.checked = earnedTrophies.has(trophy.id);
    check.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
    check.addEventListener('click', function (ev) {
      ev.stopPropagation();
    });
    check.addEventListener('change', function (ev) {
      ev.stopPropagation();
      toggleTrophyEarned(trophy.id, check.checked);
    });
    row.appendChild(check);

    row.appendChild(el('span', 'grade-chip grade-' + trophy.grade, gradeLabel(trophy.grade)));

    const body = el('div', null);
    body.appendChild(el('p', 'trophy-name', hidden ? 'Hidden story trophy' : trophy.name));
    body.appendChild(el('p', 'trophy-desc', hidden ? 'Earn it to reveal this story trophy.' : trophy.description));
    const tags = el('div', 'trophy-tags');
    for (const kind of trophy.kind) {
      tags.appendChild(el('span', 'tag', kindLabel(kind)));
    }
    if (trophy.missable) tags.appendChild(el('span', 'tag missable', 'Missable'));
    if (!trophy.method_confirmed) tags.appendChild(el('span', 'tag unknown', 'Method unknown'));
    body.appendChild(tags);
    row.appendChild(body);

    const rate = el('div', 'trophy-rate');
    const target = formatCount(trophy);
    if (target) rate.appendChild(el('div', null, target));
    const rateLine = el('div', null);
    rateLine.appendChild(el('b', null, 'Day-1 ' + trophy.early_rate + '%'));
    rateLine.appendChild(document.createTextNode(' (Exophase)'));
    rate.appendChild(rateLine);
    row.appendChild(rate);

    row.addEventListener('click', function () { selectTrophy(trophy.id); });
    list.appendChild(row);
  }
}

function buildSourceBox(trophy) {
  const box = el('div', 'source-box');
  box.appendChild(el('h3', null, 'Sources — where each fact comes from'));
  const ul = el('ul', null);
  for (const key of trophy.source_keys) {
    const src = trophyData.sources[key];
    if (!src) continue;
    const li = el('li', null);
    const a = el('a', null, src.name);
    a.href = src.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.appendChild(a);
    ul.appendChild(li);
  }
  box.appendChild(ul);
  return box;
}

function buildTrophyDetailContent(trophy) {
  const wrap = el('div', null);
  const hidden = isSpoilerHidden(trophy);
  wrap.appendChild(el('span', 'grade-chip grade-' + trophy.grade, gradeLabel(trophy.grade)));
  if (hidden) {
    wrap.appendChild(el('h2', null, 'Hidden story trophy'));
    wrap.appendChild(el('p', 'official-desc', 'This story trophy is hidden while the spoiler setting is on.'));
    const callout = el('div', 'callout safe', 'Earn it in the game, check it off in the tracker, and its name, description and guide will appear here.');
    wrap.appendChild(callout);
    return wrap;
  }
  wrap.appendChild(el('h2', null, trophy.name));
  wrap.appendChild(el('p', 'official-desc', '“' + trophy.description + '” — official PlayStation description.'));

  const meta = el('div', 'detail-meta');
  for (const kind of trophy.kind) {
    meta.appendChild(el('span', 'tag', kindLabel(kind)));
  }
  if (trophy.missable) meta.appendChild(el('span', 'tag missable', 'Missable'));
  if (!trophy.method_confirmed) meta.appendChild(el('span', 'tag unknown', 'Method not yet confirmed'));
  if (trophy.kind.indexOf('story') !== -1) meta.appendChild(el('span', 'tag', 'Automatic — cannot be missed'));
  else if (!trophy.missable && trophy.method_confirmed) meta.appendChild(el('span', 'tag', 'Not missable — doable in free-roam'));
  const target = formatCount(trophy);
  if (target) meta.appendChild(el('span', 'tag', target));
  meta.appendChild(el('span', 'tag', 'Day-1 ' + trophy.early_rate + '% · Exophase'));
  wrap.appendChild(meta);

  wrap.appendChild(el('h3', null, 'Guide — in this entry’s own words'));
  wrap.appendChild(el('p', null, trophy.guide));

  wrap.appendChild(el('h3', null, 'Steps'));
  const steps = el('ol', 'detail-steps');
  for (const step of trophy.steps) {
    steps.appendChild(el('li', null, step));
  }
  wrap.appendChild(steps);

  wrap.appendChild(el('h3', null, 'Difficulty & time'));
  wrap.appendChild(el('p', null, trophy.difficulty + ' · ' + trophy.time));

  if (trophy.missable) {
    wrap.appendChild(el('div', 'callout missable', 'MISSABLE — the only trophy in the game that may be missable. Do the Chapter 1 balcony step (see the steps above) when it appears; whether it is required is still unconfirmed, so don’t risk the platinum.'));
  }
  if (!trophy.method_confirmed) {
    wrap.appendChild(el('div', 'callout unknown', 'METHOD NOT YET CONFIRMED (as of 19 Nov 2026). No reliable guide has published how this trophy unlocks. Check the cited source below for updates — do not trust an unverified method.'));
  }

  wrap.appendChild(buildSourceBox(trophy));
  return wrap;
}

function renderTrophyDetail() {
  const panel = $('detailPanel');
  panel.innerHTML = '';
  const trophy = trophyById(selectedTrophyId) || trophyData.trophies[0];
  if (!trophy) return;
  panel.appendChild(buildTrophyDetailContent(trophy));
  const link = el('a', 'full-guide-link', 'Open the full guide →');
  link.href = '#/trophy/' + trophy.id;
  panel.appendChild(link);
}

function renderFullTrophyDetail(trophyId) {
  const view = $('fullDetailView');
  view.innerHTML = '';
  const trophy = trophyById(trophyId);
  if (!trophy) {
    view.appendChild(el('p', null, 'Trophy not found.'));
    return;
  }
  const back = el('a', 'back-link', '← Back to the trophy list');
  back.href = '#/';
  view.appendChild(back);
  const card = el('div', 'full-detail');
  card.appendChild(buildTrophyDetailContent(trophy));
  view.appendChild(card);
}

function renderRoadmapView() {
  renderRoadmap($('roadmapView'), trophyData.trophies, earnedTrophies, function (id) {
    location.hash = '#/trophy/' + id;
  });
}

function showView(view, trophyId) {
  document.body.classList.toggle('view-detail', view === 'detail');
  document.body.classList.toggle('view-roadmap', view === 'roadmap');
  $('guideView').hidden = view !== 'guide';
  $('roadmapView').hidden = view !== 'roadmap';
  $('fullDetailView').hidden = view !== 'detail';
  document.querySelectorAll('.view-tabs .tab').forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.view === view || (view === 'detail' && tab.dataset.view === 'guide'));
  });
  if (view === 'roadmap') renderRoadmapView();
  if (view === 'detail') renderFullTrophyDetail(trophyId);
  if (view === 'guide') {
    renderTrophyList();
    renderTrophyDetail();
  }
  renderProgressBar();
}

function routeFromHash() {
  const hash = location.hash || '#/';
  if (hash === '#/roadmap' || hash === '#roadmap') {
    showView('roadmap');
    return;
  }
  const match = hash.match(/^#\/trophy\/([a-z0-9-]+)/);
  if (match && trophyById(match[1])) {
    selectedTrophyId = match[1];
    showView('detail', match[1]);
    return;
  }
  showView('guide');
}

function selectTrophy(id) {
  selectedTrophyId = id;
  renderTrophyList();
  renderTrophyDetail();
}

function toggleTrophyEarned(id, isEarned) {
  if (isEarned) earnedTrophies.add(id);
  else earnedTrophies.delete(id);
  saveProgress();
  renderProgressBar();
  renderTrophyList();
  renderTrophyDetail();
}

function exportProgress() {
  const payload = { app: 'leonida-legend', version: 2, earned: Array.from(earnedTrophies).sort(), spoilerOn: spoilerOn };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : [];
      const known = new Set(trophyData.trophies.map(function (t) { return t.id; }));
      earnedTrophies = new Set(ids.filter(function (id) { return known.has(id); }));
      if (typeof data.spoilerOn === 'boolean') spoilerOn = data.spoilerOn;
      $('spoilerToggle').checked = spoilerOn;
      saveProgress();
      renderProgressBar();
      renderTrophyList();
      renderTrophyDetail();
    } catch (err) {
      window.alert('That file is not a Leonida Legend progress export.');
    }
  };
  reader.readAsText(file);
}

function applyFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const kind = params.get('kind');
  if (kind && ['story', 'missable', 'collectibles', 'activities'].indexOf(kind) !== -1) {
    currentFilters.kind = kind;
  }
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].indexOf(grade) !== -1) {
    currentFilters.grade = grade;
  }
  // Deep-link a selected trophy in the detail panel (e.g. ?selected=you-wainker).
  // Stored here and applied after the data loads; the list stays at the top.
  requestedSelectedId = params.get('selected');
}

function syncFilterControls() {
  $('searchInput').value = currentFilters.q;
  $('gradeFilter').value = currentFilters.grade;
  $('earnedFilter').value = currentFilters.earned;
  document.querySelectorAll('#kindChips .chip').forEach(function (chip) {
    chip.classList.toggle('active', chip.dataset.kind === currentFilters.kind);
  });
  $('spoilerToggle').checked = spoilerOn;
}

function bindControls() {
  $('searchInput').addEventListener('input', function (ev) {
    currentFilters.q = ev.target.value.trim().toLowerCase();
    renderTrophyList();
  });
  $('gradeFilter').addEventListener('change', function (ev) {
    currentFilters.grade = ev.target.value;
    renderTrophyList();
  });
  $('earnedFilter').addEventListener('change', function (ev) {
    currentFilters.earned = ev.target.value;
    renderTrophyList();
  });
  document.querySelectorAll('#kindChips .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      currentFilters.kind = chip.dataset.kind;
      syncFilterControls();
      renderTrophyList();
    });
  });
  $('spoilerToggle').addEventListener('change', function (ev) {
    spoilerOn = ev.target.checked;
    saveProgress();
    renderTrophyList();
    renderTrophyDetail();
  });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function (ev) {
    if (ev.target.files && ev.target.files[0]) importProgressFile(ev.target.files[0]);
    ev.target.value = '';
  });
  document.querySelectorAll('.view-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      location.hash = tab.dataset.view === 'roadmap' ? '#/roadmap' : '#/';
    });
  });
  window.addEventListener('hashchange', routeFromHash);
}

function fetchTrophyData() {
  return fetch(DATA_URL).then(function (res) {
    if (!res.ok) throw new Error('Could not load ' + DATA_URL);
    return res.json();
  });
}

function initGuide() {
  loadSavedProgress();
  applyFiltersFromUrl();
  bindControls();
  syncFilterControls();
  fetchTrophyData().then(function (data) {
    trophyData = data;
    if (requestedSelectedId && trophyById(requestedSelectedId)) selectedTrophyId = requestedSelectedId;
    if (!trophyById(selectedTrophyId)) selectedTrophyId = trophyData.trophies[0].id;
    routeFromHash();
  }).catch(function (err) {
    $('trophyList').innerHTML = '<li class="list-empty">Could not load the trophy data. Open this guide from its own folder so data/trophies.json loads.</li>';
  });
}

initGuide();
