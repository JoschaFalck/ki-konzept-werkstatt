# KI-Konzept-Werkstatt

Eine rein clientseitige Entwicklungsumgebung für Schul-KI-Konzepte: Selbstdiagnose in sieben Dimensionen, Hebel-Empfehlungen, Maßnahmenplaner mit Wirkung-Aufwand-Matrix und ein Konzept-Builder mit Textgerüsten und DOCX-Export.

**Datenschutz by design:** kein Backend, keine API-Calls, kein Tracking, keine Cookies, keine externen CDNs. Alle Daten bleiben im Browser (localStorage) und werden als JSON-Datei im Team weitergegeben.

> Screenshots: PLATZHALTER — werden nach dem ersten Deployment ergänzt (M7).

## Module

| Modul | Zweck |
|---|---|
| Selbstdiagnose | 29 verhaltensnahe Items in 7 Dimensionen, Stufen 0–3, Workshop-Modus für den Beamer |
| Auswertung | Spinnennetz-Diagramm, regelbasierte Hebel-Empfehlungen, Stärken/Entwicklungsfelder |
| Referenzrahmen | Fachliche Grundlage der Dimensionen mit Vertiefungslinks |
| Konzept-Builder | Kapitelweise Textgerüste mit erzwungenen schulspezifischen Entscheidungen, Export-Gate, DOCX/Markdown-Export |
| Maßnahmenplaner | 2×2-Matrix (klickbasiert), De-Implementierungs-Pflichtfrage |
| Prozessbegleitung | Diskussionskarten, Ablauf für den pädagogischen Tag, Beschlussvorlage, Elterninformation — alles druckbar |

## Entwicklung

```bash
npm install
npm run dev               # lokale Entwicklung
npm run test              # Vitest (Logik unter /src/lib)
npm run lint              # ESLint + Prettier
npm run validate:content  # zod-Prüfung aller /content-Dateien
npm run build             # Produktions-Build
npx tsx scripts/check-links.ts  # Linkcheck (M5)
```

## Deployment (GitHub Pages)

1. Repository **`ki-konzept-werkstatt`** anlegen (der Name muss zur `base`-Option in `vite.config.ts` passen).
2. Push auf `main` — die GitHub Action (`.github/workflows/deploy.yml`) führt Lint, Tests und Content-Validierung aus und deployt nach GitHub Pages.
3. In den Repo-Einstellungen unter *Pages* die Quelle **GitHub Actions** wählen.

## Inhalte und Lizenz

Fachinhalte unter `/content` (Diagnose-Items, Referenzrahmen, Textgerüste, Hebel-Texte, Diskussionskarten) pflegt der Autor; Dateien mit dem Vermerk **ENTWURF** sind noch nicht fachlich freigegeben. Quellcode und Inhalte: CC BY-SA 4.0 (PLATZHALTER: Lizenz durch den Autor bestätigen).

Ein Werkzeug aus der Familie der KI-Werkstätten von [Joscha Falck](https://joschafalck.de).
