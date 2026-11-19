// Leonida Legend — entrypoint: hands the trophy-guide app in.
// Copies app/ and screenshots/ beside this file into the output directory,
// then writes /output/dossier.json with buildDossier from the kit's vendor
// library. Node 22 standard library only; no install, no network.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function copyEntryTree() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

function writeDossier() {
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
  return dossier.length;
}

copyEntryTree();
const bytes = writeDossier();
console.log("dossier.json written: " + bytes + " bytes -> " + join(outDir, "dossier.json"));
