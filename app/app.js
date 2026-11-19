// Leonida Legend — GTA VI trophy guide & tracker (main logic).
// Vanilla JS, no libraries. Loads data/trophies.json from the same origin only.
var TROPHIES = [];
var TROPHY_BY_ID = {};
var STORAGE_KEY = "leonida-legend-progress-v1";
var earnedIds = {};
var spoilerOn = true;
var selectedId = 40; // Maximum Withdrawal — featured guide on first load.
var filterGrade = "";
var filterKind = "";
var filterEarned = "";
var searchText = "";

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s && typeof s === "object") {
        if (s.earned && typeof s.earned === "object") earnedIds = s.earned;
        if (typeof s.spoiler === "boolean") spoilerOn = s.spoiler;
      }
    }
  } catch (e) { /* fresh start on bad storage */ }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: earnedIds, spoiler: spoilerOn }));
  } catch (e) { /* storage unavailable — tracker still works in memory */ }
}

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function isStoryHidden(t) {
  return spoilerOn && t.kind.indexOf("story") !== -1 && !earnedIds[t.id];
}

function renderStatsBar() {
  var host = document.getElementById("statsBar");
  var total = TROPHIES.length;
  var counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  TROPHIES.forEach(function (t) { counts[t.grade]++; });
  host.innerHTML = "";
  var items = [
    "<b>" + total + "</b> trophies",
    "<b>" + counts.platinum + "</b> platinum · <b>" + counts.gold + "</b> gold · <b>" + counts.silver + "</b> silver · <b>" + counts.bronze + "</b> bronze",
    "<b>28</b> hidden on PlayStation",
    "Difficulty <b>4/10</b>",
    "<b>~200 hours</b> to platinum",
    "<b>55</b> offline · <b>0</b> online",
    "<b>1</b> playthrough",
    "<b>1</b> potentially missable"
  ];
  items.forEach(function (html) {
    var s = document.createElement("span");
    s.className = "stat";
    s.innerHTML = html;
    host.appendChild(s);
  });
}

function renderProgress() {
  var earned = TROPHIES.filter(function (t) { return earnedIds[t.id]; }).length;
  var total = TROPHIES.length || 55;
  var pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById("progressText").textContent = earned + " / " + total + " earned";
  document.getElementById("progressPct").textContent = pct + "%";
  document.getElementById("progressFill").style.width = pct + "%";
  var counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  TROPHIES.forEach(function (t) {
    counts[t.grade][1]++;
    if (earnedIds[t.id]) counts[t.grade][0]++;
  });
  var gc = document.getElementById("gradeCounts");
  gc.innerHTML = "";
  ["platinum", "gold", "silver", "bronze"].forEach(function (g) {
    var b = document.createElement("b");
    b.textContent = gradeLabel(g) + " " + counts[g][0] + "/" + counts[g][1];
    gc.appendChild(b);
    gc.appendChild(document.createTextNode(" "));
  });
}

function trophyMatches(t) {
  if (filterGrade && t.grade !== filterGrade) return false;
  if (filterKind && t.kind.indexOf(filterKind) === -1) return false;
  if (filterEarned === "yes" && !earnedIds[t.id]) return false;
  if (filterEarned === "no" && earnedIds[t.id]) return false;
  if (searchText) {
    var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    if (hay.indexOf(searchText) === -1) return false;
  }
  return true;
}

function renderTrophyRows() {
  var list = document.getElementById("trophyList");
  list.innerHTML = "";
  var shown = 0;
  TROPHIES.forEach(function (t) {
    if (!trophyMatches(t)) return;
    shown++;
    var li = document.createElement("li");
    li.className = "trophy-row" + (earnedIds[t.id] ? " earned" : "") + (t.id === selectedId ? " selected" : "");
    li.dataset.trophyId = t.id;
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!earnedIds[t.id];
    cb.setAttribute("aria-label", "Mark " + t.name + " as earned");
    cb.addEventListener("click", function (ev) { ev.stopPropagation(); });
    cb.addEventListener("change", function () {
      if (cb.checked) earnedIds[t.id] = true; else delete earnedIds[t.id];
      saveState();
      renderProgress();
      renderTrophyRows();
      renderTrophyDetail();
    });
    li.appendChild(cb);
    var mid = document.createElement("div");
    var nameEl = document.createElement("div");
    nameEl.className = "t-name";
    var descEl = document.createElement("div");
    descEl.className = "t-desc";
    if (isStoryHidden(t)) {
      nameEl.textContent = "Hidden story trophy — earn it to reveal";
      descEl.textContent = "Spoiler mode is on. Check the box once you have earned it in-game.";
    } else {
      nameEl.textContent = t.name;
      descEl.textContent = t.description;
    }
    mid.appendChild(nameEl);
    mid.appendChild(descEl);
    var meta = document.createElement("div");
    meta.className = "t-meta";
    t.kind.forEach(function (k) {
      var tag = document.createElement("span");
      tag.className = "tag" + (k === "missable" ? " missable" : "");
      tag.textContent = k === "missable" ? "Potentially missable" : k;
      meta.appendChild(tag);
    });
    if (t.count) {
      var ct = document.createElement("span");
      ct.className = "tag";
      ct.textContent = "Target: " + t.count;
      meta.appendChild(ct);
    }
    if (t.guide && t.guide.indexOf("NOT YET CONFIRMED") !== -1) {
      var un = document.createElement("span");
      un.className = "tag unknown";
      un.textContent = "Method not yet confirmed";
      meta.appendChild(un);
    }
    mid.appendChild(meta);
    li.appendChild(mid);
    var right = document.createElement("div");
    var chip = document.createElement("span");
    chip.className = "grade-chip grade-" + t.grade;
    chip.textContent = t.grade;
    right.appendChild(chip);
    var rate = document.createElement("div");
    rate.className = "t-rate";
    rate.textContent = "Early unlock " + (typeof t.early_rate === "number" ? t.early_rate + "%" : "—");
    right.appendChild(rate);
    li.appendChild(right);
    li.addEventListener("click", function () { selectTrophy(t.id, true); });
    list.appendChild(li);
  });
  document.getElementById("resultCount").textContent =
    shown + " of " + TROPHIES.length + " trophies shown" +
    (spoilerOn ? " · spoiler mode on (story trophies hidden until earned)" : " · spoiler mode off");
}

function renderTrophyDetail() {
  var host = document.getElementById("detailPanel");
  var t = TROPHY_BY_ID[selectedId];
  host.innerHTML = "";
  if (!t) {
    var p = document.createElement("p");
    p.className = "detail-empty";
    p.textContent = "Select a trophy on the left to see its full guide, steps and sources.";
    host.appendChild(p);
    return;
  }
  var h = document.createElement("h2");
  h.textContent = isStoryHidden(t) ? "Hidden story trophy" : t.name;
  host.appendChild(h);
  var chip = document.createElement("span");
  chip.className = "grade-chip grade-" + t.grade;
  chip.textContent = t.grade;
  host.appendChild(chip);
  var d = document.createElement("p");
  d.className = "t-desc";
  d.textContent = isStoryHidden(t) ? "Spoiler mode is on. Earn this story trophy in-game, then check its box to reveal the guide." : t.description;
  host.appendChild(d);
  if (t.missable) {
    var mc = document.createElement("div");
    mc.className = "missable-callout";
    mc.innerHTML = "<b>Potentially missable — the only one.</b> Do the Chapter 1 balcony meditation when it appears (after Down to Earth, follow Lucia and choose Accept). Keep a save from that point.";
    host.appendChild(mc);
  }
  if (!isStoryHidden(t)) {
    var g = document.createElement("div");
    g.className = "detail-guide";
    var gp = document.createElement("p");
    gp.textContent = t.guide;
    g.appendChild(gp);
    host.appendChild(g);
    if (t.guide && t.guide.indexOf("NOT YET CONFIRMED") !== -1) {
      var uc = document.createElement("div");
      uc.className = "unknown-callout";
      uc.textContent = "This method is not yet confirmed as of 19 Nov 2026. The guide above gives the best unverified lead only — check the sources for updates.";
      host.appendChild(uc);
    }
    if (t.steps && t.steps.length) {
      var sh = document.createElement("p");
      sh.innerHTML = "<b>Steps</b>";
      host.appendChild(sh);
      var ol = document.createElement("ol");
      ol.className = "detail-steps";
      t.steps.forEach(function (s) {
        var li = document.createElement("li");
        li.textContent = s;
        ol.appendChild(li);
      });
      host.appendChild(ol);
    }
    if (t.sources && t.sources.length) {
      var src = document.createElement("div");
      src.className = "detail-sources";
      var st = document.createElement("b");
      st.textContent = "Sources";
      src.appendChild(st);
      t.sources.forEach(function (s) {
        var a = document.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.name;
        src.appendChild(a);
      });
      host.appendChild(src);
    }
    var rate = document.createElement("p");
    rate.className = "t-desc";
    rate.textContent = "Early unlock rate, 19 Nov 2026 (Exophase): " +
      (typeof t.early_rate === "number" ? t.early_rate + "%" : "—") + ". Day-1 data, small sample — not a final rarity.";
    host.appendChild(rate);
  }
}

function selectTrophy(id, pushHash) {
  selectedId = id;
  if (pushHash) {
    try { history.replaceState(null, "", "#/trophy/" + id); } catch (e) { /* ignore */ }
  }
  renderTrophyRows();
  renderTrophyDetail();
}

function applySpoilerMode() {
  document.getElementById("spoilerToggle").checked = spoilerOn;
  renderTrophyRows();
  renderTrophyDetail();
}

function exportProgress() {
  var data = {
    game: "Grand Theft Auto VI",
    guide: "Leonida Legend",
    exported_at: new Date().toISOString(),
    earned: Object.keys(earnedIds).map(function (k) { return Number(k); }).sort(function (a, b) { return a - b; }),
    spoiler: spoilerOn
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-legend-progress.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function importProgress(file) {
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      var ids = data.earned || data;
      if (Array.isArray(ids)) {
        earnedIds = {};
        ids.forEach(function (id) { if (TROPHY_BY_ID[id]) earnedIds[id] = true; });
        if (typeof data.spoiler === "boolean") spoilerOn = data.spoiler;
        saveState();
        applySpoilerMode();
        renderProgress();
        alert("Imported " + Object.keys(earnedIds).length + " earned trophies.");
      } else {
        alert("That file does not look like a Leonida Legend export.");
      }
    } catch (e) {
      alert("Could not read that file — it is not valid JSON.");
    }
  };
  reader.readAsText(file);
}

function readQueryFilters() {
  try {
    var q = new URLSearchParams(window.location.search);
    if (q.get("grade")) filterGrade = q.get("grade");
    if (q.get("kind")) filterKind = q.get("kind");
    if (q.get("earned")) filterEarned = q.get("earned");
    if (q.get("spoiler") === "off") spoilerOn = false;
    if (q.get("spoiler") === "on") spoilerOn = true;
    if (q.get("trophy")) {
      var id = Number(q.get("trophy"));
      if (TROPHY_BY_ID[id]) selectedId = id;
    }
  } catch (e) { /* ignore bad query */ }
}

function syncFilterButtons() {
  function sync(groupId, attr, value) {
    document.querySelectorAll("#" + groupId + " .chip").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute(attr) === value);
    });
  }
  sync("gradeFilters", "data-grade", filterGrade);
  sync("kindFilters", "data-kind", filterKind);
  sync("earnedFilters", "data-earned", filterEarned);
}

function routeFromHash() {
  var hash = window.location.hash || "#/";
  var roadmap = document.getElementById("viewRoadmap");
  var checklist = document.getElementById("viewChecklist");
  var tabR = document.getElementById("tabRoadmap");
  var tabC = document.getElementById("tabChecklist");
  if (hash.indexOf("#/roadmap") === 0) {
    roadmap.classList.remove("hidden");
    checklist.classList.add("hidden");
    tabR.classList.add("active");
    tabC.classList.remove("active");
    renderRoadmapStages();
  } else {
    roadmap.classList.add("hidden");
    checklist.classList.remove("hidden");
    tabC.classList.add("active");
    tabR.classList.remove("active");
    var m = hash.match(/^#\/trophy\/(\d+)/);
    if (m) {
      var id = Number(m[1]);
      if (TROPHY_BY_ID[id]) selectedId = id;
    }
    renderTrophyRows();
    renderTrophyDetail();
  }
}

function bindControls() {
  document.getElementById("searchInput").addEventListener("input", function (e) {
    searchText = e.target.value.trim().toLowerCase();
    renderTrophyRows();
  });
  document.querySelectorAll("#gradeFilters .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      filterGrade = b.getAttribute("data-grade");
      syncFilterButtons();
      renderTrophyRows();
    });
  });
  document.querySelectorAll("#kindFilters .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      filterKind = b.getAttribute("data-kind");
      syncFilterButtons();
      renderTrophyRows();
    });
  });
  document.querySelectorAll("#earnedFilters .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      filterEarned = b.getAttribute("data-earned");
      syncFilterButtons();
      renderTrophyRows();
    });
  });
  document.getElementById("spoilerToggle").addEventListener("change", function (e) {
    spoilerOn = e.target.checked;
    saveState();
    applySpoilerMode();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", function (e) {
    importProgress(e.target.files && e.target.files[0]);
    e.target.value = "";
  });
  window.addEventListener("hashchange", routeFromHash);
}

function loadTrophies() {
  return fetch("data/trophies.json")
    .then(function (r) { if (!r.ok) throw new Error("trophies.json " + r.status); return r.json(); })
    .then(function (data) {
      TROPHIES = data.trophies || data;
      TROPHIES.forEach(function (t) { TROPHY_BY_ID[t.id] = t; });
    });
}

loadState();
loadTrophies().then(function () {
  readQueryFilters();
  bindControls();
  renderStatsBar();
  renderProgress();
  syncFilterButtons();
  applySpoilerMode();
  routeFromHash();
}).catch(function (err) {
  document.getElementById("trophyList").innerHTML =
    "<li class='trophy-row'><div>Could not load data/trophies.json (" + err.message + "). Serve the app/ folder over HTTP.</div></li>";
});
