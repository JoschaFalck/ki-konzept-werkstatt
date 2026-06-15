# Ideen und Auffälligkeiten (nicht umgesetzt)

Hier werden Feature-Ideen und Auffälligkeiten notiert, die nicht zum aktuellen Auftrag gehören (CLAUDE.md: nichts erfinden).

## Offene Punkte aus dem Erstaufbau (Juni 2026)

- **`/docs/KONZEPT.md` fehlt im Repository.** Die Spezifikation verweist darauf (Kapitelgliederung 1–9, fachliche Begründungen). Der Builder nutzt einstweilen acht Kapitel-Entwürfe plus automatisch erzeugte „Ausgangslage“ — bitte gegen das Konzeptdokument prüfen.
- **Fachinhalte d2–d7, Textgerüste (außer sec-pruefen), Hebel-Texte, Referenzrahmen-Texte, Diskussionskarten und Prozessmaterialien sind ENTWÜRFE von Claude** (in den Dateien als solche gekennzeichnet) — fachliche Prüfung und Überarbeitung durch den Autor erforderlich.
- **links.json enthält Platzhalter-URLs** (joschafalck.de als Stamm-URL; Raster-Builder-URL unbestätigt). Vor M5 bestätigen und `npx tsx scripts/check-links.ts` laufen lassen.
- **Lizenzangabe im Footer** (CC BY-SA 4.0) ist eine Annahme analog zur Tool-Familie — bitte bestätigen.
- Workshop-Modus zeigt aktuell kein Evidenz-Feld (bewusst reduziert für den Beamer-Einsatz); falls gewünscht, ergänzen.

## Ideen

### Begleithilfen-Paket (Juni 2026)

Aus der Überlegung „Was brauchen Schulen, die die Plattform nutzen?" entstanden. Umgesetzt als statische Markdown-Seiten unter einem Hilfe-Hub (`/hilfe`):

- **Beispielkonzepte** zweier fiktiver Schulen (schlankes Grundsatzpapier + vollständiges Rahmenkonzept) — `beispiel-grundschule.md`, `beispiel-weiterfuehrend.md`
- **Häufige Einwände + Antworten** — `faq.md`
- **Glossar** — `glossar.md`
- **Moderationsleitfaden** für die erste Sitzung — `moderation.md`
- **Kommunikationsvorlagen** (Elternbrief, Schüler-Merkblatt, Regeln-Aushang) — `vorlagen.md`

Alle Texte sind ENTWÜRFE von Claude (`version: 0.1-entwurf`), fachliche Prüfung durch den Autor erforderlich.

### Verlaufsvergleich (geplant — eigener Meilenstein, NICHT umgesetzt)

Diagnose nach Wiederholung mit einem früheren Stand vergleichen (Radar-Überlagerung, Differenz je Dimension). Macht das „lebende Dokument" erlebbar und ist das stärkste Argument für die jährliche Fortschreibung.

Aufwand/Risiko: berührt das Datenmodell (Snapshots der Diagnose je Zeitpunkt) und damit `persistence.ts` + `migrations.ts` + Schemas → gehört in einen eigenen, getesteten Meilenstein, nicht in einen Content-Push. Offene Fragen: Snapshot manuell oder automatisch? Wie viele Stände vorhalten? Darstellung in Auswertung oder eigener Ansicht?

### Optionale Erweiterung der Beispielkonzepte

Statt nur statischer Lese-Seiten könnte ein **importierbares Demo-Projekt** (JSON) angeboten werden, das im Builder lädt und „geforkt" werden kann. Risiko: Nutzer reichen das Beispiel als eigenes ein → mit „(Beispiel)" im Titel entschärfen. Erst nach Freigabe der statischen Beispiele angehen.
