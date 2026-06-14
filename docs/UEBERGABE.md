# Übergabedokument — KI-Konzept-Werkstatt

Stand: 13. Juni 2026. Dieses Dokument fasst alles zusammen, was für die Weiterarbeit nötig ist. Es ersetzt das erneute Erkunden des Projekts.

---

## 1. Was das Projekt ist

Clientseitige Web-App, mit der Schulen (Steuergruppen, Schulleitungen) ihr KI-Konzept entwickeln: Selbstdiagnose in 7 Dimensionen → Auswertung mit Hebel-Empfehlungen → Maßnahmenplaner → Konzept-Builder mit DOCX/MD-Export. Plus Materialbibliothek, Prozessbegleitung und projektfreies Stöbern.

- **Live:** https://joschafalck.github.io/ki-konzept-werkstatt/
- **Repo:** https://github.com/JoschaFalck/ki-konzept-werkstatt (Branch `main`)
- **Lokaler Pfad:** `/Users/joschafalck/Desktop/Claude/KI-Konzept-Builder für Schulen`
- **Datenschutz by design:** kein Backend, keine API-Calls, kein Tracking, keine externen CDNs (auch keine Fonts). Alles bleibt im Browser (localStorage), Weitergabe per JSON-Datei.

## 2. Stack & verbindliche Architektur

React 19 + TypeScript + Vite + Tailwind + zustand + zod + docx. **HashRouter** (Pages-Pflicht). Vite `base: '/ki-konzept-werkstatt/'` — Repo-Name muss exakt so heißen.

Maßgebliche Dokumente (in dieser Rangfolge):
1. `docs/SPEZIFIKATION_umsetzung.md` — verbindliche technische/inhaltliche Festlegungen (laufend fortgeschrieben; Design Abschnitt 6 = Fassung „Aurora")
2. `CLAUDE.md` — Arbeitsvereinbarung (harte Regeln: keine CDNs, keine personenbezogenen Daten, Geschäftslogik nur in `/lib`, alle UI-Strings in `content/ui-strings.ts`, nichts erfinden)
3. Dieses Dokument

**Schichten:** `/src/lib` = pure Logik (kein React-Import, getestet mit Vitest). `/src/modules` = Screens. `/src/components` = wiederverwendbare UI. `/content` = Fachinhalte (JSON/MD/TS).

## 3. Verzeichnisse (Kurzkarte)

- `content/` — alle Fachinhalte: `diagnose-items.json` (d1–d7), `textgerueste.json` (Builder-Kapitel), `hebel-texte.json`, `links.json` (Materialbibliothek), `prozess/karten.json` + `prozess/materialien.json`, `referenzrahmen/d1..d7.md`, `hinweise.md`, `herleitung.md`, `impressum.md`, `datenschutz.md`, `ui-strings.ts`
- `src/lib/` — `auswertung.ts` (Hebel-Logik 5.2), `persistence.ts`, `migrations.ts`, `importValidation.ts`, `exportGate.ts`, `content.ts` (lädt+validiert content beim Start), `radarSvg.ts`, `bilder.ts`, `assets.ts`, `markdown.ts`, `export/` (conceptModel, docx, markdown, chartToPng)
- `src/modules/` — `start`, `projekt` (Dashboard), `diagnose` (Übersicht/Dimension/Auswertung/Workshop), `referenz`, `builder`, `massnahmen`, `prozess`, `materialien`, `statisch` (Hinweise/Herleitung/Impressum/Datenschutz)
- `public/materialien/` — optimierte Grafiken/PDFs (eingebunden via `links.json` + Referenzrahmen-Bilder)
- `src/assets/bilder/` — Hero + Modul-Illustrationen (JPEG, via `lib/bilder.ts`)
- **Lokale Eingangsordner (gitignored, mit führendem `/`!):** `/Materialien/`, `/Bilder-Eingang/` — hier legt Joscha Quellmaterial ab; optimierte Fassungen kommen nach `public/` bzw. `src/assets/`

## 4. Workflow (Befehle)

```bash
npm run dev               # lokal
npm run build             # tsc -b && vite build
npm run test              # Vitest (40 Tests, alle in /src/lib)
npm run lint              # ESLint + Prettier-Check
npm run format            # Prettier --write
npm run validate:content  # zod-Prüfung aller content-Dateien
npx tsx scripts/check-links.ts   # Linkcheck (nur url-Einträge; PISA-Link gibt 403 = Bot-Schutz, ok)
```

**Vor jedem Commit:** `npm run format && npm run lint && npm run validate:content && npm run test && npm run build` müssen grün sein.

**Deployment:** Push auf `main` → GitHub Action (`.github/workflows/deploy.yml`) baut + veröffentlicht auf Pages. CI führt lint/test/validate/build aus (NICHT check-links). Nach Push den Lauf überwachen (Monitor/API), bis `completed success`; dann Live-URL prüfen.

**Push-Zugang:** Fine-grained PAT „claude-push" (Scopes: Contents + Workflows, nur dieses Repo) liegt im macOS-Schlüsselbund. **WICHTIG: läuft ~18.06.2026 ab** — danach neues Token nach gleichem Muster nötig (github.com/settings/personal-access-tokens, Repository permissions: Contents=R/W, Workflows=R/W, nur dieses Repo).

## 5. Preview-Eigenheit (Verifikation)

Der Claude-Preview-Runner darf nicht auf den Desktop zugreifen (macOS TCC) und kann `npm` nicht starten. Workaround: statisch bauen, nach `/tmp/kkw-serve/ki-konzept-werkstatt` kopieren, via `/tmp/serve_kkw.py` (Python, Port 8350) servieren. Eintrag liegt in `Desktop/Claude/.claude/launch.json` (Name `ki-konzept-werkstatt`). Ablauf:
```bash
npm run build && rm -rf /tmp/kkw-serve/ki-konzept-werkstatt && cp -R dist /tmp/kkw-serve/ki-konzept-werkstatt
```
Dann `preview_start` (Name `ki-konzept-werkstatt`), per `preview_eval` zu `http://localhost:8350/ki-konzept-werkstatt/#/...` navigieren. localStorage-Keys: `kkw:index` (Array) + `kkw:project:<id>`.

## 6. Fertig & funktionsfähig

Alle 12+1 Screens, 40 Vitest-Tests grün. Design „Aurora" (Verlaufs-Hero, schwebende Karten, animiertes Verlaufs-Radar, zählende Mittelwerte; respektiert prefers-reduced-motion; Druck/Workshop animationsfrei). Inhaltsbreite 1200 px (`max-w-werkstatt`). 8 Illustrationen integriert.

Funktional umgesetzt: Selbstdiagnose + Workshop-Modus, Auswertung mit Hebel-Regeln + Material-Vorschlägen, Maßnahmenplaner mit 2×2-Matrix + De-Implementierungs-Pflicht, Konzept-Builder mit Export-Gate + **Gesamt- und kapitelweisem** DOCX/MD-Export, JSON Import/Export, Materialbibliothek (filterbar, kontextbezogen), projektfreies Stöbern (`/referenz`, `/prozess`, `/materialien`), Startseite mit Onboarding + Hero-„Projekt fortsetzen", Footer (Impressum/Datenschutz/Kaffeekasse) + Header-Nav.

**Eingebundene Modelle/Materialien:** Architektur der KI-Didaktik, KI-Kompetenzmodell (d4 daran ausgerichtet), OECD AI Literacy Framework + PISA 2029, Leitfaden Prüfen & Bewerten, Bewertungsraster (Link + ZIP), AKTIV-Framework (Manuel Flick), PRISMA (Felix Urban).

## 7. OFFENE PUNKTE (nächste Schritte)

1. **Fachliche Durchsicht der ENTWURF-Inhalte** (größter Punkt). Als ENTWURF markiert: Diagnose-Items d2–d7 (d1 ist Joschas Referenz), alle Builder-Gerüste, `hebel-texte.json`, Referenzrahmen d2–d7, Prozess-Materialien (inkl. AKTIV- und PRISMA-Texte). d1 + Kapitel sec-pruefen stammen aus Joschas Beispieldateien (`content-beispiele/`). Beim Ändern: pro Baustein Korrektur einpflegen, `$comment`-ENTWURF-Vermerk ggf. entfernen, `contentVersion` in `diagnose-items.json` + `textgerueste.json` müssen übereinstimmen (Validator prüft das).
2. **Formelle Okays** einholen: Manuel Flick (AKTIV) und Felix Urban (PRISMA) — beide sind korrekt als ihre Arbeit ausgewiesen und verlinkt, aber nur formlos eingebunden.
3. **Rechtstexte prüfen:** Impressum/Datenschutz wurden vom KI-Raster-Builder übernommen; Datenschutz inhaltlich an diese App angepasst (localStorage statt „kein localStorage", kein jsDelivr-CDN). Lizenz im Footer jetzt CC BY 4.0.
4. **GitHub-Token erneuern** (siehe 4) vor Ablauf.
5. **`docs/IDEEN.md`** enthält weitere Notizen/Platzhalter (z. B. fehlendes `docs/KONZEPT.md`).

## 8. Stolperfallen (aus Erfahrung)

- **`.gitignore` für lokale Ordner mit führendem Slash** (`/Materialien/`) — ohne Slash wurde case-insensitiv `src/modules/materialien` mit-ignoriert → CI-Build brach.
- **Neue Module/Assets:** prüfen, dass sie nicht versehentlich gitignored sind (`git status` vor Commit).
- **Raster-Builder-URL:** `joschafalck.github.io/ki-raster-builder/` (NICHT `ki-bewertungsraster`). Begleitartikel: `joschafalck.de/ki-bewertungsraster/`. Quellordner lokal: `Desktop/Claude/KI-Raster-Builder`.
- **OECD-PISA-Link** gibt curl/WebFetch 403 (Bot-Schutz), funktioniert im Browser → bewusst aus Linkcheck-CI ausgenommen (check-links überspringt, läuft eh nur manuell).
- **Bilder optimieren** vor Commit (sips: ~1600px, JPEG q82–85) — Roh-PNGs aus ChatGPT sind 1–2 MB.
- **Commit-Messages:** deutsche ASCII-Messages verwenden (Sonderzeichen wie „" in `-m` haben die Shell mehrfach gebrochen). Co-Author-Zeile am Ende.

## 9. Tonalität & Microcopy

Anrede „Sie", Buttons imperativisch-neutral, sachlich-zugewandt, keine Emojis im UI. Keine kommerziellen Tool-Namen in normativen Texten (nur „z. B."). Verantwortung = Funktionsbezeichnung, keine Namen.
