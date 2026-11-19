# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yansz54/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yansz54/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend — the complete GTA VI trophy guide & tracker: all 55 PlayStation trophies with their official names, descriptions and grades, a localStorage tracker with export and import, filters and a spoiler setting, a 7-stage roadmap to the platinum, and a cited guide — written in this entry's own words, with its sources shown beside every trophy — for each trophy.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The guide is plain static files under `app/` and works with the network off.

## What it does

- **Tracker** — check trophies off as you earn them; progress is saved in the browser (localStorage), with a progress bar and per-grade counts, plus export to a file and import back.
- **Filters & search** — by grade, by kind (story, missable, collectibles, activities), by earned state, and free-text search across names, descriptions and guides.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap** — 7 stages to the platinum, naming the story chapters and missions, the collectibles and their counts, and the order to do them in, plus the 100% checklist. The only potentially missable trophy (Positive Mental Attitude) is flagged everywhere it appears.
- **Cited guides** — every trophy's guide is written in this entry's own words and carries its source citation (PowerPyx, Exophase) visibly next to the steps. The 5 trophies whose methods are not yet confirmed are labelled unknown, honestly, with no invented method.

## Sources

- [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- [Exophase — GTA VI Trophies (PS5)](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)

---

<sub>Entered on [make.fun](https://make.fun/?ref=djwcs0np&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
