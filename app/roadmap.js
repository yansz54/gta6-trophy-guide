// Leonida Legend — roadmap stages and the 100% checklist (brief §7).
// Data is written for this entry from the researched roadmap; no copied text.
var ROADMAP_STAGES = [
  {
    n: 0,
    title: "Before you start",
    body: "Know the rules first — cheats disable trophies AND saving, there is no mission replay and no New Game+. You get 15 manual save slots plus 1 autosave: keep a save at the start and end of each chapter. Difficulty is 4/10, about 200 hours in total, a single playthrough, and all 55 trophies are offline.",
    bullets: [
      "Cheats disable trophies and saving — do not use them.",
      "No mission replay, no New Game+ — keep chapter saves.",
      "15 manual save slots + 1 autosave."
    ]
  },
  {
    n: 1,
    title: "Story, Chapters 1–5 (60–80 hours)",
    body: "Play the story and do every Optional Mission as it appears (purple icons; main missions are pink icons with black letters). Along the way, scan every new vehicle with the WAiNK app (hold Up, then R1), study every new animal with binoculars (hold L1 for the weapon wheel, zoom with Up, hold R1 to study), and do stunts you pass. This earns the 12 story trophies and builds progress toward A Long Road.",
    bullets: [
      "Do every Optional Mission as it appears.",
      "Scan new vehicles and study new animals as you go.",
      "Earns the 12 story trophies (Chapters 1–5)."
    ]
  },
  {
    n: 2,
    title: "The one missable (Chapter 1 — do it when it appears)",
    body: "Positive Mental Attitude is the only potentially missable trophy. After the Chapter 1 mission Down to Earth, Lucia talks about meditating in the morning and goes to the balcony: follow her and choose Accept. That raises the counter by 1 but is not marked as a Meditation Spot, so whether it is required is still unconfirmed — do it to be safe and keep a save from that point.",
    bullets: [
      "After Down to Earth, follow Lucia to the balcony and choose Accept.",
      "Unconfirmed whether it is required — do it to be safe.",
      "Every other trophy is doable after the story in free-roam."
    ]
  },
  {
    n: 3,
    title: "Side characters & strangers (after Chapter 2, Coffee Break)",
    body: "Once both characters are playable, clear the side strands: Andy (Lucia, Chapter 3), Kenton (Chapter 1, returns in Chapters 2–3), Billy (Chapter 2), Randy (Chapter 3), Tyrone (Jason, Chapter 3), Bret (Jason, Chapter 2+), plus the 8 counting stranger strands — Kirk, Kyle, Yago and Pilot Pete.",
    bullets: [
      "Andy, Kenton, Billy, Randy, Tyrone, Bret — finish each final mission.",
      "Strangers & Freaks needs 8 counting strands (Kirk, Kyle, Yago, Pilot Pete).",
      "Moses, Tyrone, Yasmani, Andy, Billy and Eddie do NOT count as strangers."
    ]
  },
  {
    n: 4,
    title: "Activities & challenges",
    body: "Clear the activity trophies: 12 Shooting Ranges with 42 gold medals, 14 Top Fun locations with 42 drone races, 20 different race wins out of 40 locations, Cal's fishing questline, all levels of one of the 4 arcade games, the 18 meditation spots (10 locations, both characters count +2 each), and 50 challenges.",
    bullets: [
      "The Shootist: gold in all 42 Shooting Range challenges.",
      "Top Fun: win a drone race at all 14 locations.",
      "50 challenges (70 are needed for 100%)."
    ]
  },
  {
    n: 5,
    title: "Collectibles & money",
    body: "Sweep the collectibles and money goals: 250 stunts (300 for 100%), 100 vehicles discovered (200 scanned for 100%), 3 card sets, 1 gang operation per gang (all 39 for 100%), 5 bank vaults (all 8 for 100%), 8 garages for $160,000, 10 Scooter Bros registrations, $250,000 laundered in marked bills, and $100,000 spent in shops.",
    bullets: [
      "Cunning Stunts: 250 of 397 stunts; Whip It Good: 100 vehicles.",
      "Maximum Withdrawal: any 5 bank vaults; Little Boxes: 8 garages.",
      "Dime on the Dollar: $250,000 laundered; Treat Yo Self: $100,000 spent."
    ]
  },
  {
    n: 6,
    title: "Clean-up & 100%",
    body: "Finish the 100% checklist below to earn A Long Road, and the platinum — Vice Got a Price! — pops right after. Everything is doable after the story in free-roam, and nothing else is missable.",
    bullets: [
      "Finish the 100% checklist (A Long Road).",
      "Vice Got a Price! (platinum) unlocks automatically."
    ]
  }
];

var HUNDRED_CHECKLIST = [
  "<b>100 Optional Missions</b> — far more than 100 exist (easily 200–300+). Moses' and Randy's vehicle deliveries count too.",
  "<b>200 of 277 Base Model Vehicles</b> scanned (WAiNK app; also scan boats and aircraft).",
  "<b>100 of 255 Animals</b> studied via binoculars (every breed of dog and cat counts separately; no hunting or skinning needed, unlike RDR2).",
  "<b>70 of 80 Challenges</b>.",
  "<b>300 stunts</b> — 397 total (130 Stunt Jumps, 202 Under the Bridges, 40 Knife Flights, 25 Base Jumps). The trophy needs 250.",
  "<b>All Robberies</b>, all Underwater Discoveries, all Shooting Ranges, all Drone Races, all of Bret's Quests.",
  "<b>15 Target Decks</b>.",
  "<b>15 of 18 Meditations</b> — each spot done with both Jason and Lucia counts +2.",
  "The checklist is closer to <b>60% true completion</b> — most collectible types and side quests are NOT required at all."
];

function renderRoadmapStages() {
  var host = document.getElementById("roadmapStages");
  if (!host) return;
  host.innerHTML = "";
  ROADMAP_STAGES.forEach(function (st) {
    var div = document.createElement("div");
    div.className = "stage";
    var h = document.createElement("h3");
    var num = document.createElement("span");
    num.className = "stage-num";
    num.textContent = "Stage " + st.n;
    h.appendChild(num);
    h.appendChild(document.createTextNode(st.title));
    div.appendChild(h);
    var p = document.createElement("p");
    p.textContent = st.body;
    div.appendChild(p);
    var ul = document.createElement("ul");
    st.bullets.forEach(function (b) {
      var li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    host.appendChild(div);
  });
  var hl = document.getElementById("hundredList");
  if (hl) {
    hl.innerHTML = "";
    HUNDRED_CHECKLIST.forEach(function (item) {
      var li = document.createElement("li");
      li.innerHTML = item;
      hl.appendChild(li);
    });
  }
}
