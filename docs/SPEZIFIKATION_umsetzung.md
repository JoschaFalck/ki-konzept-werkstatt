# Umsetzungsspezifikation: KI-Konzept-Werkstatt

**Ergänzung zum Konzeptdokument** · Zweck: Diese Datei schließt alle Lücken, die das Konzeptdokument einem ausführenden Modell (Claude Code) zur freien Interpretation lassen würde. Bei Widersprüchen gilt diese Spezifikation vor dem Konzeptdokument.

**Leseanweisung für Claude Code:** Nichts erfinden, was hier oder im Konzept geregelt ist. Wenn eine Entscheidung fehlt, im Chat nachfragen statt eine Annahme zu treffen. Abschnitt 12 (Bekannte Stolperfallen) vor jedem Meilenstein erneut lesen.

---

## 1. Verbindliche Architekturentscheidungen

| Entscheidung | Festlegung | Begründung / Verbot |
|---|---|---|
| Routing | **HashRouter** (react-router-dom) | GitHub Pages liefert bei BrowserRouter-Deeplinks 404. Kein 404.html-Hack verwenden. |
| Vite-Base | `base: '/<repo-name>/'` in vite.config.ts | Sonst brechen Asset-Pfade auf Pages. Repo-Name als Konstante dokumentieren. |
| State | **Zustand** (ein Store, `useAppStore`), Slices pro Modul | Kein Context-Geflecht, kein Redux, kein Prop-Drilling über mehr als 2 Ebenen. |
| Persistenz | Eigene Persistenz-Schicht in `/lib/persistence.ts`, **nicht** zustand/persist-Middleware | Wir brauchen explizite Kontrolle über Migrationen, Validierung und Fehlerfälle. |
| Validierung | **zod**. Alle Schemas in `/types/schemas.ts`, TS-Typen via `z.infer` | Eine Quelle der Wahrheit für Datenmodell UND Importvalidierung. |
| Diagramm | **Hand-gerolltes SVG** (eigene Komponente `RadarChart.tsx`), keine Chart-Bibliothek | Muss für DOCX-Export rasterisiert werden (siehe 12.3); Bibliotheks-SVGs sind dafür unzuverlässig. |
| DOCX | `docx` (npm) clientseitig, gekapselt in `/lib/export/docx.ts` | UI ruft nur `exportConcept(project): Promise<Blob>` auf. |
| Drag & Drop | **Kein** Drag & Drop in v1. 2×2-Matrix wird per Klick befüllt (siehe 5.4) | DnD ist die häufigste Quelle für Accessibility- und Bug-Probleme; Klick-Interaktion ist gleichwertig. |
| Styling | Tailwind, Design-Tokens aus Abschnitt 6 in `tailwind.config` | Keine Inline-Hexwerte im Code; ausschließlich Token-Klassen. |
| Schrift | Systemschrift-Stack (`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`) | Keine Font-CDNs (Datenschutz), kein Font-Hosting nötig. |
| Tests | **Vitest** für alles unter `/lib`. UI-Komponenten: kein Test-Zwang in v1 | Die Logik (Auswertung, Migration, Export, Validierung) ist testpflichtig, die Oberfläche nicht. |
| Browser-Ziel | Aktuelle Chrome/Edge/Firefox/Safari, **keine** IE/Legacy-Rücksicht | Schul-Realität 2026. |
| i18n | Keine. Alle Strings deutsch, zentral in `/content/ui-strings.ts` | Sammeldatei verhindert verstreute Hardcodes und erleichtert Tonalitäts-Pflege. |

**Schichtenregel:** `/lib` enthält ausschließlich pure Funktionen ohne React-Import. `/modules` enthält Screens, `/components` wiederverwendbare UI. Niemals Geschäftslogik (Auswertung, Validierung, Exportstruktur) in Komponenten schreiben.

---

## 2. Screen-Inventar (vollständig)

Jeder Screen mit Route, Zweck und Kernelementen. Es gibt keine weiteren Screens; neue Screens nur nach Rückfrage.

| # | Route | Screen | Kernelemente |
|---|---|---|---|
| S1 | `/#/` | **Projektliste / Start** | Tool-Claim (1 Satz), Projektkarten (Titel, zuletzt geändert, Fortschritts-Mini-Anzeige), Buttons: Neues Projekt, JSON importieren. Footer: Tool-Familie, Lizenz, Versionsstand. |
| S2 | `/#/p/:id` | **Projekt-Dashboard** | 5 Modulkarten mit Status (nicht begonnen / in Arbeit / abgeschlossen), prominenter Button „Arbeitsstand sichern (JSON)", dezenter Hinweis auf Gerätebindung von localStorage. |
| S3 | `/#/p/:id/diagnose` | **Diagnose-Übersicht** | 7 Dimensionskarten mit Bearbeitungsstand (x/y Items), Button zur Auswertung (aktiv ab 100 % einer Dimension, voll ab 100 % gesamt). |
| S4 | `/#/p/:id/diagnose/:dim` | **Item-Bearbeitung** | Ein Item pro Bildschirmabschnitt: Itemtext, 4 Stufenkarten (Stufe 0–3 mit voller Beschreibung, Einfachauswahl), Evidenz-Freitext, Vor/Zurück, Fortschrittsbalken. |
| S5 | `/#/p/:id/diagnose/auswertung` | **Auswertung** | RadarChart, Hebel-Box (Regeln aus 5.2), Stärken/Entwicklungsfelder-Listen, ggf. Irritationshinweis, Buttons: Weiter zum Maßnahmenplaner / Konzept-Builder, Druckansicht. |
| S6 | `/#/p/:id/diagnose/workshop` | **Workshop-Modus** | Vollbild, ein Item groß, Stufen als große Karten, Tastatursteuerung (←/→ Item, 0–3 Stufe), dezenter Beenden-Link. Kein sonstiges Chrome. |
| S7 | `/#/p/:id/referenz` und `/:dim` | **Referenzrahmen** | Dimensionsnavigation links (mobil: Akkordeon), Markdown-Inhalt rechts, Vertiefungslinks als gekennzeichnete Linkkarten. |
| S8 | `/#/p/:id/builder` und `/:section` | **Konzept-Builder** | Kapitelnavigation mit Status (Entwurf / offen markiert / fertig), pro Kapitel: Leitfragen, Gerüst-Auswahl, Felder (siehe 5.3), Gremien-Hinweis. Export-Button mit Validierungs-Gate. |
| S9 | `/#/p/:id/massnahmen` | **Maßnahmenplaner** | Maßnahmenliste, Formular (Modal oder Inline), 2×2-Matrix-Ansicht (Tab), Warnbanner ab 8 Maßnahmen, Druckansicht. |
| S10 | `/#/p/:id/prozess` | **Prozessbegleitung** | Karten für die vier Materialtypen, jeweils Ansicht + Drucken-Button. |
| S11 | `/#/hinweise` | **„Wie arbeiten wir im Team damit?"** | Statische Seite: Datei-Weitergabe-Modell, localStorage-Grenzen, Datenschutz-Selbsterklärung (keine Übertragung, keine Cookies außer localStorage). |
| S12 | `/#/herleitung` | **Kriterien-Herleitung** | Statische Markdown-Seite (Quellen, Methode, Versionshistorie des Referenzrahmens). |
| S13 | `/#/materialien` | **Materialbibliothek** (ergänzt Juni 2026 nach Rückfrage) | Alle Einträge aus links.json, filterbar nach Typ (Artikel/Werkzeuge/Downloads/Grafiken); dieselben Einträge erscheinen kontextbezogen in Referenzrahmen, Builder-Kapiteln, Auswertung und Prozessbegleitung. Verlinkt aus Footer und Dashboard. |

**Leere Zustände (Pflicht):** S1 ohne Projekte → einladende Erklärung + großer Start-Button. S5 ohne abgeschlossene Diagnose → Erklärung statt leerem Chart. S9 ohne Maßnahmen → Hinweis mit Verweis auf Hebel aus der Auswertung.

---

## 3. Datenmodell (verbindlich, zod)

```ts
// /types/schemas.ts — maßgebliche Fassung, Konzeptdokument-Skizze ist hiermit ersetzt

export const SCHEMA_VERSION = 1;

const LevelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

export const DiagnosisItemStateSchema = z.object({
  level: LevelSchema.nullable(),        // null = noch nicht eingeschätzt
  evidence: z.string().max(2000).default(""),
});

export const BuilderFieldStateSchema = z.object({
  value: z.string().max(8000).default(""),
  markedOpen: z.boolean().default(false), // „offen – wird im Kollegium geklärt"
});

export const SectionStateSchema = z.object({
  templateId: z.string().nullable(),     // gewähltes Gerüst, null = noch keins gewählt
  fields: z.record(z.string(), BuilderFieldStateSchema).default({}),
});

export const MeasureSchema = z.object({
  id: z.string(),                        // crypto.randomUUID()
  title: z.string().min(1).max(200),
  dimensionId: z.string(),               // "d1".."d7"
  description: z.string().max(4000).default(""),
  role: z.string().max(200).default(""), // UI-Hinweis: Funktionsbezeichnung, keine Namen
  horizon: z.enum(["short", "mid", "long"]),
  impact: z.union([z.literal(1), z.literal(2)]).nullable(),  // 1 = gering, 2 = hoch
  effort: z.union([z.literal(1), z.literal(2)]).nullable(),
  deimplementation: z.string().max(2000).default(""),
  deimplementationWaived: z.boolean().default(false),
  linkedItemIds: z.array(z.string()).default([]),  // optionale Verknüpfung zu Diagnose-Items
});

export const ProjectSchema = z.object({
  schemaVersion: z.number(),
  contentVersion: z.string(),            // z. B. "1.0" — Stand des Referenzrahmens bei Erstellung
  id: z.string(),
  title: z.string().min(1).max(200),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  diagnosis: z.object({
    items: z.record(z.string(), DiagnosisItemStateSchema).default({}),
    completedAt: z.string().datetime().nullable().default(null),
  }),
  concept: z.object({
    sections: z.record(z.string(), SectionStateSchema).default({}),
  }),
  measures: z.array(MeasureSchema).default([]),
});
```

**Regeln:**
- IDs aus Content-Dateien (`d1`, `d1-i3`, `sec-pruefen`, `tpl-pruefen-a`) sind **stabil und werden nie wiederverwendet**. Entfällt ein Item, bekommt es in der Content-Datei `"deprecated": true` statt gelöscht zu werden; die App ignoriert deprecated-Items beim Rendern, behält gespeicherte Antworten aber beim Import.
- `impact`/`effort` sind bewusst binär (2×2-Matrix, keine Scheingenauigkeit).
- Migrationen: `/lib/migrations.ts` exportiert `migrate(raw: unknown): Project`. Array von Migrationsfunktionen `v1→v2→…`, jede mit eigenem Vitest-Test und einem eingefrorenen Beispiel-JSON der Altversion unter `/lib/__fixtures__/`.

---

## 4. Persistenz-Verhalten (exakt)

- **Storage-Keys:** `kkw:index` (Array von Projekt-IDs + Metadaten für S1) und `kkw:project:<id>` (vollständiges Projekt). Präfix `kkw:` ist fix.
- **Autosave:** debounced 800 ms nach letzter Änderung; zusätzlich sofort bei Routenwechsel. Dezenter „Gespeichert"-Indikator im Header (kein Toast-Gewitter).
- **Quota/Fehler:** Jeder Schreibvorgang in try/catch. Bei `QuotaExceededError` oder deaktiviertem localStorage (Safari privat!): persistenter roter Banner „Automatisches Speichern nicht möglich — bitte regelmäßig als Datei sichern", App bleibt voll bedienbar (State im Speicher).
- **Export:** Dateiname `ki-konzept-werkstatt_<slug(title)>_<YYYY-MM-DD>.json`. Slug: Kleinbuchstaben, Umlaute transliterieren (ä→ae …), Nicht-Alphanumerisches → `-`.
- **Import:** Datei lesen → `JSON.parse` (try/catch) → `migrate()` → `ProjectSchema.safeParse`. Fehlerfälle mit je eigener, verständlicher Meldung: (a) keine gültige JSON-Datei, (b) keine Werkstatt-Datei, (c) Datei aus neuerer App-Version (schemaVersion > aktuell) → Import ablehnen mit Hinweis auf Aktualisierung der Seite. Bei ID-Kollision: als Kopie importieren (`id` neu, Titel-Suffix „(importiert)"), niemals stillschweigend überschreiben.
- **Beforeunload:** Warnung nur, wenn ungesicherte Änderungen seit letztem JSON-Export UND localStorage nicht verfügbar.

---

## 5. Logik-Spezifikationen (die Stellen, an denen sonst improvisiert würde)

### 5.1 Fortschritts- und Statusberechnung
- Dimension „abgeschlossen" = alle nicht-deprecated Items haben `level !== null`.
- Diagnose „abgeschlossen" = alle 7 Dimensionen abgeschlossen → `completedAt` setzen (und bei nachträglicher Änderung wieder auf null? **Nein:** bleibt gesetzt, aber Auswertung zeigt Stand-Hinweis „zuletzt vollständig am …" wenn danach geändert wurde).
- Modulstatus auf S2: Diagnose s. o.; Builder „in Arbeit" sobald ein Feld nicht leer; „abgeschlossen" wenn Export-Gate (5.3) erfüllt; Maßnahmen „in Arbeit" ab 1 Maßnahme.

### 5.2 Hebel-Logik (vollständiger Regelsatz, keine weiteren Regeln erfinden)
Reihenfolge = Priorität; die erste zutreffende Regel liefert die Haupt-Empfehlung, weitere zutreffende werden als Zusatzhinweise gelistet.

1. **Fundament-Regel:** Mittelwert d1 (Haltung & Regeln) < 1,5 → „Beginnt beim Fundament" + Begründungstext + Link Architektur-Artikel.
2. **Prüfungs-Regel:** Mittelwert d3 < 1,0 bei gleichzeitigem d2 ≥ 1,5 → Hinweis auf Inkonsistenz (Unterricht integriert KI, Prüfungskultur ignoriert sie) + Link Bewertungsraster-Builder.
3. **Governance-Regel:** d6 < 1,0 → Hinweis, dass ohne Steuerungsstruktur Maßnahmen versanden; Empfehlung Steuergruppe vor inhaltlichen Maßnahmen.
4. **Spreizungs-Regel:** Differenz zwischen höchster und niedrigster Dimension ≥ 1,5 → Hinweis auf Ungleichzeitigkeit, Empfehlung: niedrigste Dimension als Maßnahmenschwerpunkt.
5. **Default:** keine Regel ausgelöst → die zwei niedrigsten Dimensionen als Entwicklungsfelder benennen.

**Irritationshinweis:** alle 7 Mittelwerte ≥ 2,5 → freundlicher Hinweis mit Frage nach Evidenz und Empfehlung, die Einschätzung mit einer zweiten Gruppe (z. B. erweiterte Steuergruppe) zu validieren. Items ohne Evidenz-Notiz dabei beziffern („21 von 32 Einschätzungen ohne Evidenz-Notiz").

Alle Texte dieser Regeln stehen in `/content/hebel-texte.json`, nicht im Code.

### 5.3 Leerstellen-Mechanik des Builders (kein String-Parsing!)
Gerüste sind **strukturierte Segmente**, niemals Fließtext mit `[___]`-Magie:

```json
{
  "id": "tpl-pruefen-a",
  "sectionId": "sec-pruefen",
  "label": "Variante A: Prüfungsformate differenzieren",
  "segments": [
    { "type": "text", "value": "Leistungsnachweise werden an unserer Schule danach unterschieden, ob sie " },
    { "type": "field", "id": "f1", "label": "Differenzierungskriterium", "placeholder": "z. B. mit oder ohne KI-Unterstützung bearbeitet werden", "required": true, "multiline": false },
    { "type": "text", "value": ". Für KI-gestützte Formate gilt: " },
    { "type": "field", "id": "f2", "label": "Regelung für KI-gestützte Formate", "placeholder": "Welche Offenlegung, welche Eigenleistung wird verlangt?", "required": true, "multiline": true },
    { "type": "hint", "value": "Beteiligung: Beschluss der Lehrerkonferenz empfohlen; Information des Schulforums." }
  ]
}
```

- Rendering: text-Segmente als Prosa, field-Segmente als beschriftete Inputs/Textareas im Lesefluss (Formular-im-Text-Optik), hint-Segmente als dezente Randnotiz (erscheinen **nicht** im Export).
- **Export-Gate:** Export (DOCX/MD) nur möglich, wenn jedes `required`-Feld entweder gefüllt ist oder `markedOpen === true`. markedOpen-Felder erscheinen im Export sichtbar als „❮ offen – wird im Kollegium geklärt ❯". Die Gate-Prüfung listet blockierende Felder mit Sprunglink auf.
- Gerüstwechsel bei vorhandenen Eingaben: Bestätigungsdialog; Feldwerte gehen verloren (Feld-IDs sind gerüstgebunden — bewusst einfach gehalten).

### 5.4 2×2-Matrix ohne Drag & Drop
- Tab-Ansicht „Matrix": vier Quadranten (Wirkung hoch/gering × Aufwand gering/hoch) als Grid; nicht eingeordnete Maßnahmen in einer „Noch einordnen"-Leiste darunter.
- Interaktion: Klick auf Maßnahmenkarte → Karte „aktiv" → Klick auf Zielquadrant. Alternativ Dropdowns auf der Karte. Vollständig tastaturbedienbar.
- Quadrant „hohe Wirkung / geringer Aufwand" erhält dezente Hervorhebung + Label „Hier zuerst".

### 5.5 DOCX-Aufbau (verbindliche Gliederung)
1. Deckblatt: Konzepttitel (= Projekttitel), „Arbeitsstand", Datum, Zeile „Erstellt mit der KI-Konzept-Werkstatt · Referenzrahmen v<contentVersion>".
2. Hinweisseite: Arbeitsstand-Charakter, offene Felder sind markiert.
3. Kapitel 1–9 gem. Konzeptdokument; Kapitel „Ausgangslage" enthält Radar-Grafik (PNG, siehe 12.3) + tabellarische Mittelwerte + Hebel-Texte.
4. Maßnahmenplan als Tabelle (Spalten: Maßnahme, Dimension, Verantwortung, Horizont, Wirkung/Aufwand, **Entlastung**); `deimplementationWaived` erscheint als „keine – zusätzliche Belastung bewusst in Kauf genommen".
5. Formatierung: Überschriften Heading 1/2, 11-pt-Grundschrift, keine Farben außer Grautönen (druckerfreundlich). Markdown-Export spiegelt dieselbe Gliederung.
6. **Kapitelweiser Export (ergänzt Juni 2026):** Jedes Builder-Kapitel kann einzeln als DOCX/MD exportiert werden (`exportSection` / `exportSectionMarkdown`), mit eigenem Export-Gate nur für dieses Kapitel — ohne Deckblatt-Maßnahmenplan und ohne Ausgangslage. Für Teilkonzepte und die Weitergabe einzelner Kapitel an Fachschaften.

---

## 6. Design-System (Tokens und Charakter) — Fassung „Aurora" (Juni 2026)

**Charakter (vom Autor überarbeitet; ersetzt die ursprüngliche nüchterne Fassung):** modern und sichtbar gestaltet, ohne die Seriosität für Gremien zu verlieren. Dunkler Verlaufs-Hero (Petrol → Blau) auf der Startseite, schwebende Karten mit weichen Schatten, Verläufe in Diagrammen und Fortschrittsbalken, dezente Bewegung (Einschweben, Hover-Lift, zählende Zahlen). Innenseiten bleiben hell und ruhig; Workshop-Modus und Druckansichten bleiben hell, kontrastreich und animationsfrei. Keine Emojis im UI.

**Tokens (in tailwind.config hinterlegen):**
- Grundfläche `#FAFAF7` (warmes Off-White), Karten `#FFFFFF`, Text `#1F2933`, Sekundärtext `#52606D`.
- Primärfarbe (Aktionen, aktive Stufe): tiefes Petrol `#0F6B6B`; Hover `#0C5757`.
- Aurora-Töne: Tinte `#04342C` (dunkle Flächen, Footer, Hero-Basis), Himmel `#378ADD` (Verlaufs-Endpunkt für Balken/Diagramme), Aurora-Blau `#185FA5` (Hero-Verlauf), Bernstein-Hell `#FAC775` (CTA auf dunklen Flächen, Textfarbe dazu `#412402`).
- Verlauf „Aurora": `linear-gradient(120deg, #04342C 0%, #0F6B6B 55%, #185FA5 100%)` für Hero und dunkle Akzentflächen; Balken-/Diagrammverlauf Petrol → Himmel.
- Akzent: Bernstein `#B7791F` für Hinweise/Irritation; Fehler `#B3261E`; Erfolg dezent `#2F6B3F`.
- Dimensionsfarben (Marker/Chips): d1 `#0F6B6B`, d2 `#3B5BA5`, d3 `#7B4FA3`, d4 `#A04668`, d5 `#B7791F`, d6 `#4E7A4E`, d7 `#5C6B73`.
- Radien 8 px, Karten 16 px, Buttons als Pillen (`rounded-full`); Schatten: `schwebend` (0 6px 18px rgba(4,52,44,0.10)), Hover `schwebend-lg` (0 14px 36px rgba(4,52,44,0.16)).
- Typo-Skala: 15 px Grundgröße, Überschriften 1.25-Faktor, max. Zeilenlänge Prosa ~70 Zeichen (`max-w-prose`).

**Bewegung (verbindlich):** Einschweben von Abschnitten beim Laden (Opazität + 12 px Translation, ~0,5 s, gestaffelt), Hover-Lift auf interaktiven Karten, Radar zeichnet sich beim Öffnen, Mittelwerte zählen hoch. Alle Animationen respektieren `prefers-reduced-motion: reduce` (dann sofortige Endzustände). Keine Animationen in Druckansichten und im Workshop-Modus.

**Bilder:** Illustrationen (flacher Editorial-Stil, Palette wie oben, keine Schrift im Bild) liegen unter `/src/assets/bilder/` und werden über `lib/bilder.ts` (import.meta.glob) eingebunden; fehlt eine Datei, rendert die Komponente einen gestalteten Fallback — nie ein Broken-Image. Dekorative Bilder erhalten leeres `alt`.

**Komponenteninventar (genau diese bauen, Varianten nur nach Rückfrage):** Button (primary/secondary/ghost/danger), Card, StufenKarte (Radio-Card mit ausführlicher Beschreibung), ProgressBar, Banner (info/warn/error, schließbar wo sinnvoll), Modal (Bestätigungen), TextField/TextArea (mit Zeichenzähler ab 80 % des Limits), Select, Tabs, LinkCard („Vertiefung"), EmptyState, PrintButton, SaveIndicator.

**Print-CSS:** eigene `@media print`-Regeln für S5 (Auswertung), S9 (Maßnahmenübersicht) und alle S10-Materialien: Navigation/Buttons ausblenden, Seitenumbrüche vor Hauptüberschriften (`break-before`), Diskussionskarten als 2×3-Raster pro A4-Seite mit Schnittlinien.

**Microcopy-Regeln:** Anredeform **„Sie"** in erklärender UI; Buttons imperativisch-neutral („Arbeitsstand sichern", „Auswertung anzeigen"). Ton: sachlich, zugewandt, nie belehrend. Fehlermeldungen benennen immer (a) was passiert ist, (b) was die Nutzerin tun kann. Alle UI-Strings in `/content/ui-strings.ts`.

---

## 7. Barrierefreiheit (konkretes Mindestmaß)

- Alle Interaktionen tastaturerreichbar; sichtbarer Fokus-Ring (Token-Farbe, 2 px, nie `outline: none` ohne Ersatz).
- StufenKarten als echte Radio-Group (`fieldset`/`legend`/`input type=radio`), nicht als klickbare Divs.
- RadarChart: `role="img"` + `aria-label` mit den 7 Mittelwerten als Text; zusätzlich immer die tabellarische Ansicht daneben (hilft auch im Workshop).
- Kontrast: alle Token-Kombinationen ≥ 4,5:1 (beim Bauen mit Kontrast-Checker verifizieren).
- Workshop-Modus-Tastaturkürzel auf dem Screen sichtbar dokumentiert.

---

## 8. Fehler- und Randfall-Matrix

| Fall | Verhalten |
|---|---|
| localStorage nicht verfügbar (Safari privat, Schul-Policy) | Roter Dauer-Banner, In-Memory-Betrieb, Export-Button gepulst hervorgehoben |
| Quota überschritten | wie oben + Hinweis, alte Projekte zu exportieren und zu löschen |
| Import: defekte/fremde/neuere Datei | drei unterscheidbare Meldungen (siehe 4) |
| Import: ID-Kollision | Kopie anlegen, nie überschreiben |
| Export-Gate verletzt | Modal mit Liste blockierender Felder + Sprunglinks |
| DOCX-Generierung wirft Fehler | Fehlermeldung + Angebot Markdown-Export als Fallback |
| Diagnose unvollständig, Auswertung aufgerufen | Teil-Auswertung nur vollständiger Dimensionen, unvollständige ausgegraut mit Hinweis |
| Projekt löschen | Bestätigungsmodal mit Projekttitel-Nennung; Hinweis auf vorherigen Export |
| Sehr langer Projekttitel / Feldinhalt | Zeichenlimits aus Schema, Zähler ab 80 %, kein stilles Abschneiden |
| JavaScript-Fehler zur Laufzeit | React ErrorBoundary pro Modul: Modul zeigt Fehlerkarte, Rest der App bleibt nutzbar, Daten bleiben erhalten |

---

## 9. Teststrategie

**Vitest-Pflichttests (in dieser Reihenfolge anlegen):**
1. `auswertung.test.ts`: Mittelwerte (inkl. deprecated-Items ignorieren), alle 5 Hebel-Regeln einzeln + Prioritätsreihenfolge + Irritationsfall.
2. `persistence.test.ts`: save/load-Roundtrip, Quota-Fehlerpfad (Mock), Slug-Funktion (Umlaute!).
3. `migrations.test.ts`: jede Migration gegen eingefrorene Fixture.
4. `importValidation.test.ts`: die drei Fehlerklassen + Kollisionsfall.
5. `exportGate.test.ts`: required/markedOpen-Kombinatorik.
6. `docx.test.ts`: Smoke-Test — Export eines Beispielprojekts liefert Blob > 10 KB ohne Exception.

**Manuelle Checkliste (in `/docs/TESTPLAN.md` pflegen, vor jedem Release durchgehen):** Kompletter Durchlauf Neues Projekt → Diagnose → Auswertung → 3 Maßnahmen → Builder → DOCX öffnen in Word UND LibreOffice; Import/Export-Roundtrip; Safari privat; Druckansichten auf A4; Tastatur-only-Durchlauf der Diagnose; Pages-Deployment mit Deeplink auf S4.

---

## 10. Content-Dateien: Verträge und Beispiele

Alle Content-Dateien werden beim Build durch ein Script (`npm run validate:content`, zod) geprüft; CI bricht bei Verstoß ab. Vollständige Beispieldateien liegen bei:

- `content-beispiele/diagnose-items.example.json` — Dimension 1 komplett ausgearbeitet (5 Items × 4 Stufenbeschreibungen) als **Mustervorlage für Formulierungsqualität**: verhaltensnah, beobachtbar, diskutierbar. Die übrigen Dimensionen müssen diesem Standard folgen.
- `content-beispiele/textgerueste.example.json` — Kapitel „Prüfen & Bewerten" mit zwei Gerüstvarianten in der Segment-Struktur aus 5.3.

Weitere Content-Dateien (Strukturen analog anzulegen): `referenzrahmen/d1.md … d7.md` (mit Frontmatter: title, leitfrage, version; Markdown unterstützt Bild-Blöcke `![alt](pfad)` mit Pfaden unter /public), `hebel-texte.json`, `links.json` (Materialbibliothek, erweitert Juni 2026: `{ id, label, type: "artikel"|"tool"|"material"|"download"|"grafik", url? , datei?, beschreibung?, lizenz?, contexts: ["d3", "sec-pruefen", "hebel-2", "prozess", …] }` — url ODER datei verpflichtend; datei-Pfade unter /public/materialien), `prozess/karten.json` (Diskussionskarten: `{ id, these, hinweis? }`), `prozess/materialien.json` (min. 1 Markdown-Material), `ui-strings.ts`.

**Redaktionsregel für alle Inhalte:** keine Tool-Namen kommerzieller Anbieter in normativen Texten (Veralterung + Neutralität); Werkzeuge nur exemplarisch in Beispielen mit „z. B.".

---

## 11. Meilenstein-Abnahmekriterien (Definition of Done, prüfbar)

**M0:** Deployte Pages-URL erreichbar; Projekt anlegen, umbenennen, löschen, exportieren, importieren funktioniert; Reload erhält Zustand; HashRouter-Deeplink auf S2 funktioniert auf Pages; CI: lint + test + validate:content grün.

**M1:** Diagnose mit Beispiel-Content vollständig durchspielbar; Auswertung zeigt Radar + korrekt ausgelöste Hebel-Regel (mit Testdaten je Regel verifiziert); Workshop-Modus tastaturbedienbar; alle Pflichttests 1–4 grün.

**M3:** Export-Gate nachweislich wirksam (Test 5); DOCX öffnet fehlerfrei in Word und LibreOffice, enthält Radar-PNG und markierte offene Felder; Umlaute korrekt in Inhalt und Dateiname.

**M4:** Maßnahme ohne ausgefüllte De-Implementierungs-Frage (oder Waiver) kann nicht gespeichert werden; Matrix tastaturbedienbar; Warnung ab 8 Maßnahmen.

**M5/M6:** Jeder Link aus links.json erreichbar (Linkcheck-Script); Druckausgaben der Diskussionskarten passen auf A4 mit Schnittlinien.

**M7:** Manuelle Checkliste vollständig grün; Lighthouse Accessibility ≥ 95; README mit 3 Screenshots und Lizenzangaben.

---

## 12. Bekannte Stolperfallen (vor jedem Meilenstein erneut lesen)

1. **GitHub Pages + Vite:** Ohne `base`-Option laden Assets nicht. Ohne HashRouter brechen Deeplinks. Beides ist in Abschnitt 1 entschieden — nicht „verbessern".
2. **docx kann kein SVG einbetten.** Das Radar muss rasterisiert werden: SVG-String → `Image` → `canvas.drawImage` → `canvas.toBlob('image/png')` → `ImageRun`. Diese Pipeline in `/lib/export/chartToPng.ts` kapseln und mit festen Pixelmaßen (1200×1200, weißer Hintergrund) rendern, sonst transparenter/abgeschnittener Export.
3. **Safari privater Modus** wirft bei localStorage-Zugriff Exceptions — Feature-Detection beim App-Start (`try { setItem/removeItem }`), nicht erst beim ersten Speichern.
4. **zustand + Persistenz:** Store-Änderungen nie direkt im Render speichern; Subscription mit Debounce in einem einzigen `persistenceMiddleware`-Modul.
5. **Zeichencodierung im Dateinamen:** `Müller-Schule` → `mueller-schule`; niemals rohe Umlaute in den Download-Dateinamen (Windows-Altsysteme).
6. **Tailwind-Klassen niemals dynamisch zusammensetzen** (`bg-${color}` wird gepurged); Dimensionsfarben über eine statische Lookup-Map vollständiger Klassennamen.
7. **Keine Erfindung zusätzlicher Features:** kein Dark Mode, keine Mehrsprachigkeit, kein PDF-Direkt-Export, keine Cloud-Sync-„Ideen". Solche Vorschläge gehören in `/docs/IDEEN.md`, nicht in den Code.
8. **Beim Bauen der UI die Frontend-Design-Skill konsultieren**, aber Tokens aus Abschnitt 6 haben Vorrang vor generischen Skill-Empfehlungen.
