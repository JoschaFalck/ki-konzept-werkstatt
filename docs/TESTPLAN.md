# Manuelle Test-Checkliste (vor jedem Release)

Spezifikation Abschnitt 9. Alle Punkte müssen grün sein.

## Kompletter Durchlauf

- [ ] Neues Projekt anlegen (Titel mit Umlauten, z. B. „KI-Konzept Müller-Schule")
- [ ] Diagnose vollständig durchspielen (alle 7 Dimensionen)
- [ ] Auswertung: Radar korrekt, Hebel-Regel plausibel, Druckansicht auf A4 geprüft
- [ ] 3 Maßnahmen anlegen (mind. eine mit Entlastungs-Waiver), Matrix befüllen
- [ ] Builder: alle Kapitel mit Gerüst, mind. ein Feld „offen" markiert
- [ ] DOCX exportieren → öffnet fehlerfrei in **Word** UND **LibreOffice**, Radar-PNG enthalten, offene Felder sichtbar markiert, Umlaute korrekt (Inhalt + Dateiname)
- [ ] Markdown-Export: gleiche Gliederung

## Import/Export

- [ ] JSON-Export → Import auf anderem Browser/Gerät → identischer Stand (Roundtrip)
- [ ] Import derselben Datei bei vorhandenem Projekt → Kopie „… (importiert)"
- [ ] Defekte Datei, fremde JSON-Datei, Datei mit höherer schemaVersion → drei unterscheidbare Meldungen

## Randfälle

- [ ] Safari privater Modus: roter Banner, App bleibt bedienbar, Export funktioniert
- [ ] Reload erhält den Zustand (localStorage)
- [ ] Tastatur-only-Durchlauf der Diagnose (Tab/Pfeile/Leertaste) inkl. Workshop-Modus (←/→, 0–3)
- [ ] Druckansichten: Auswertung, Maßnahmenliste, Diskussionskarten (2×3 pro A4 mit Schnittlinien)

## Deployment

- [ ] GitHub-Pages-URL erreichbar
- [ ] Deeplink auf S4 (z. B. `…/#/p/<id>/diagnose/d1`) funktioniert nach Reload auf Pages
- [ ] Lighthouse Accessibility ≥ 95
- [ ] `npx tsx scripts/check-links.ts` grün
