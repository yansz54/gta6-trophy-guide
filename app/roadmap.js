// Roadmap to the platinum for Leonida Legend: the 7 stages in order, built from the
// official trophy descriptions, plus the 100% checklist. All wording is this entry's
// own, written from the cited guides (PowerPyx, Exophase). No Rockstar assets.
export const ROADMAP_STAGES = [
  {
    n: 0,
    title: 'Before you start',
    time: 'Read first',
    summary: 'Rules first: cheats disable trophies AND saving. No mission replay, no New Game+. 15 manual saves + 1 autosave — keep a save at the start and end of each chapter. Difficulty 4/10, ~200 h, one playthrough, all 55 offline.',
    trophies: [],
    missable: false
  },
  {
    n: 1,
    title: 'Story — Chapters 1–5',
    time: '60–80 h',
    summary: 'Play Chapters 1–5. Do every optional mission as it appears (purple icons). Scan new vehicles with WAiNK (Up, R1), study animals with binoculars, do stunts you pass. Earns the 12 story trophies.',
    trophies: [],
    missable: false
  },
  {
    n: 2,
    title: 'The one missable — do it in Chapter 1',
    time: 'Do it when it appears',
    summary: 'Positive Mental Attitude — the only possibly missable trophy. After Chapter 1 "Down to Earth", follow Lucia to the balcony and choose "Accept". Unconfirmed whether required — do it to be safe.',
    trophies: [],
    missable: true
  },
  {
    n: 3,
    title: 'Side characters & strangers',
    time: 'After Chapter 2 “Coffee Break”',
    summary: 'After Chapter 2 "Coffee Break": Andy (Lucia, Ch 3), Kenton (Ch 1, Ch 2–3), Billy (Ch 2), Randy (Ch 3), Tyrone (Jason, Ch 3), Bret (Jason, Ch 2+), plus 8 stranger strands.',
    trophies: [],
    missable: false
  },
  {
    n: 4,
    title: 'Activities & challenges',
    time: 'Across the playthrough',
    summary: '12 shooting ranges / 42 gold medals; 14 Top Fun locations / 42 drone races; 20 race wins (40 locations); Cal’s fishing questline; 4 arcade games (finish all levels of one); 18 meditation spots; 50 challenges.',
    trophies: [],
    missable: false
  },
  {
    n: 5,
    title: 'Collectibles & money',
    time: 'Free-roam grind',
    summary: '250 stunts (300 for 100%); 100 vehicles discovered (200 scanned); 3 card sets; 1 gang operation per gang (39 for 100%); 5 bank vaults (8 for 100%); 8 garages ($160,000); 10 Scooter Bros; $250,000 laundered; $100,000 spent.',
    trophies: [],
    missable: false
  },
  {
    n: 6,
    title: 'Clean-up & 100%',
    time: 'After the story',
    summary: 'Finish the 100% checklist below → A Long Road → the platinum. Everything is doable after the story in free-roam; nothing else is missable. The 5 unknown trophies have no confirmed method yet.',
    trophies: [],
    missable: false
  }
];

// The 100% checklist, as the cited guide lists it (Progress > Stats > 100% Completion,
// visible only after the story; progress made during the story already counts).
export const CHECKLIST_100 = [
  '100 optional missions (vehicle deliveries count too)',
  'Scan 200 of 277 vehicles (WAiNK; boats & aircraft too)',
  'Study 100 of 255 animals via binoculars',
  '70 of 80 challenges',
  '300 stunts (130 jumps, 202 bridges, 40 knife flights, 25 base jumps)',
  'All robberies, underwater finds, shooting ranges, drone races, Bret’s quests',
  '15 target decks',
  '15 of 18 meditations (both characters = +2 per spot)',
  'Closer to 60% true completion — most collectibles & side quests NOT required'
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

// Render the roadmap into `container`. `trophies` is the full trophy array;
// `earned` is a Set of earned trophy ids; `onSelect` opens a trophy's guide.
export function renderRoadmap(container, trophies, earned, onSelect) {
  container.innerHTML = '';
  const back = el('a', 'back-link', '← Back to the guide');
  back.href = '#/';
  container.appendChild(back);
  const intro = el('div', 'roadmap-intro');
  intro.appendChild(el('h2', null, 'Roadmap to the platinum'));
  intro.appendChild(el('p', null, 'Seven stages, in order — story first, the one missable the moment it appears, then side characters, activities, collectibles and money, and the 100% clean-up.'));
  container.appendChild(intro);

  const grid = el('div', 'roadmap-grid');
  for (const stage of ROADMAP_STAGES) {
    const card = el('div', 'stage-card' + (stage.n === 0 ? ' wide' : ''));
    const h = el('h3', null, 'Stage ' + stage.n + ' — ' + stage.title + ' ');
    const time = el('span', 'stage-time', '· ' + stage.time);
    h.appendChild(time);
    card.appendChild(h);
    if (stage.missable) {
      card.appendChild(el('p', 'stage-flag', 'MISSABLE — Contains the only potentially missable trophy. Do it in Chapter 1.'));
    }
    card.appendChild(el('p', null, stage.summary));
    const stageTrophies = trophies.filter(function (t) { return t.stage === stage.n; });
    if (stageTrophies.length > 0) {
      const names = el('p', 'stage-names');
      stageTrophies.forEach(function (t, i) {
        if (i > 0) names.appendChild(document.createTextNode(' · '));
        const btn = el('button', 'stage-name' + (earned.has(t.id) ? ' earned' : ''), t.name);
        btn.type = 'button';
        btn.title = gradeLabel(t.grade) + ' — ' + t.name;
        btn.addEventListener('click', function () { onSelect(t.id); });
        names.appendChild(btn);
      });
      card.appendChild(names);
    }
    grid.appendChild(card);
  }

  const check = el('div', 'checklist-card');
  check.appendChild(el('h3', null, '100% checklist — A Long Road (Progress > Stats > 100% Completion)'));
  const ul = el('ul', null);
  for (const item of CHECKLIST_100) {
    ul.appendChild(el('li', null, item));
  }
  check.appendChild(ul);
  grid.appendChild(check);
  container.appendChild(grid);
}
