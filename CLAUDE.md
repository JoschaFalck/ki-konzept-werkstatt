# CLAUDE.md — Arbeitsvereinbarung für dieses Repository

Du arbeitest am Projekt **KI-Konzept-Werkstatt**, einer rein clientseitigen Entwicklungsumgebung für Schul-KI-Konzepte (React + TypeScript + Vite, Deployment auf GitHub Pages).

## Maßgebliche Dokumente (in dieser Rangfolge)
1. `/docs/SPEZIFIKATION_umsetzung.md` — verbindliche technische und inhaltliche Festlegungen
2. `/docs/KONZEPT.md` — fachliches Konzept und Begründungen
3. Diese Datei — Arbeitsweise

Lies vor jedem Meilenstein Abschnitt 12 der Spezifikation (Stolperfallen) erneut.

## Harte Regeln
- **Keine API-Calls, kein Backend, kein Tracking, keine Cookies, keine externen CDNs (auch keine Fonts).** Die App ist vollständig statisch und offlinefähig nach erstem Laden.
- **Keine personenbezogenen Daten by design.** UI-Texte weisen an den relevanten Stellen darauf hin (Verantwortung als Funktionsbezeichnung, keine Namen).
- **Nichts erfinden.** Fehlt eine Festlegung: nachfragen. Feature-Ideen in `/docs/IDEEN.md` notieren, nicht umsetzen.
- **Keine neuen Abhängigkeiten** ohne Rückfrage. Freigegeben sind: react, react-dom, react-router-dom, zustand, zod, docx, tailwindcss (+ dev-Tooling: vite, typescript, vitest, eslint, prettier).
- **Geschäftslogik nur in `/lib`** (pure Funktionen, kein React-Import), getestet mit Vitest. Komponenten bleiben dünn.
- **Alle UI-Strings** in `/content/ui-strings.ts`, **alle Fachinhalte** in `/content/` — niemals Texte in Komponenten hartkodieren.
- **Design-Tokens** aus Spezifikation Abschnitt 6 sind verbindlich; keine Inline-Farben, keine dynamisch zusammengesetzten Tailwind-Klassen.
- Anrede „Sie", Buttons imperativisch-neutral, Ton sachlich-zugewandt. Keine Emojis im UI.

## Arbeitsweise
- **Ein Meilenstein pro Arbeitssitzung** (M0–M7, siehe Spezifikation Abschnitt 11). Erst Abnahmekriterien des Meilensteins lesen, dann bauen, dann selbst gegen die Kriterien prüfen und das Ergebnis berichten.
- **Kleine Commits** mit deutschen, beschreibenden Messages (`M1: Hebel-Regeln 1–5 mit Tests`).
- **Kein opportunistisches Refactoring** über den aktuellen Meilenstein hinaus. Auffälligkeiten in `/docs/IDEEN.md` notieren.
- Nach jedem Meilenstein: `npm run lint && npm run test && npm run validate:content && npm run build` müssen grün sein, bevor du den Meilenstein als erledigt meldest.
- Bei UI-Arbeit die Frontend-Design-Skill heranziehen; bei Konflikt gewinnen die Projekt-Tokens.

## Befehle
```bash
npm run dev               # lokale Entwicklung
npm run build             # Produktions-Build (prüft TS)
npm run test              # Vitest
npm run lint              # ESLint + Prettier-Check
npm run validate:content  # zod-Prüfung aller /content-Dateien
npm run deploy            # Build + Push auf gh-pages (bzw. via GitHub Action)
```

## Projektstruktur (nicht eigenmächtig ändern)
```
/src/modules      Screens (diagnose, referenz, builder, massnahmen, prozess, projekt)
/src/components   wiederverwendbare UI (Inventar in Spezifikation Abschnitt 6)
/src/lib          pure Logik: persistence, migrations, auswertung, export/, validation
/src/types        zod-Schemas + abgeleitete Typen
/content          Fachinhalte (JSON/MD) — Inhalte werden vom Autor gepflegt
/docs             Konzept, Spezifikation, Testplan, Ideen
```

## Inhalte
Fachinhalte (Diagnose-Items, Referenzrahmen, Textgerüste, Hebel-Texte, Diskussionskarten) verfasst der Autor. Du legst Strukturen und Beispiel-Platzhalter an (deutlich als `PLATZHALTER:` markiert), formulierst aber keine fachlich-normativen Inhalte ohne ausdrücklichen Auftrag. Die Qualitätsreferenz für Item-Formulierungen ist `content-beispiele/diagnose-items.example.json`.
