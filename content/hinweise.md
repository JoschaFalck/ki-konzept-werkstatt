---
title: Wie arbeiten wir im Team damit?
version: 0.1-entwurf
---

> ENTWURF — redaktionelle Prüfung durch den Autor erforderlich.

## Ein Werkzeug, viele Hände

Die KI-Konzept-Werkstatt ist für die Arbeit in einer Steuergruppe oder einem Schulleitungsteam gedacht. Sie hat bewusst keine Benutzerkonten und keinen Server — die Zusammenarbeit läuft über eine gemeinsame Datei.

## Das Datei-Weitergabe-Modell

- **Eine Person führt das Projekt.** Sie arbeitet in der Werkstatt und sichert den Arbeitsstand über „Arbeitsstand sichern (JSON)“ als Datei.
- **Die Datei wandert.** Per E-Mail, Schulcloud oder USB-Stick geht sie an die nächste Person, die sie über „JSON-Datei importieren“ einliest, weiterarbeitet und erneut sichert.
- **Es gibt immer genau einen aktuellen Stand.** Vereinbaren Sie, wer die Datei gerade „hat“ — wie bei einem Staffelstab. Parallele Bearbeitung führt zu zwei verschiedenen Ständen, die die Werkstatt nicht zusammenführen kann.
- **Beim Import einer Datei, deren Projekt bereits existiert,** legt die Werkstatt eine Kopie an („… (importiert)“). Es wird nie etwas stillschweigend überschrieben.

## Was der Browser speichert — und was nicht

Die Werkstatt speichert Ihren Arbeitsstand automatisch im lokalen Speicher Ihres Browsers (localStorage). Das bedeutet:

- Der Stand ist **an dieses Gerät und diesen Browser gebunden**. Auf einem anderen Rechner oder in einem anderen Browser ist er nicht vorhanden.
- Wer Browserdaten löscht („Cache und Websitedaten leeren“), **löscht auch den Arbeitsstand**. Die JSON-Datei ist deshalb Ihre Sicherung — exportieren Sie regelmäßig.
- Im **privaten Modus** (insbesondere Safari) ist lokales Speichern oft nicht möglich. Die Werkstatt zeigt dann einen dauerhaften Hinweis und funktioniert weiter; sichern Sie in diesem Fall vor dem Schließen als Datei.

## Datenschutz-Selbsterklärung

- Diese Anwendung **überträgt keine Daten**. Es gibt keinen Server, keine Konten, kein Tracking, keine Cookies; gespeichert wird ausschließlich lokal in Ihrem Browser (localStorage).
- Alle Inhalte, Schriften und Skripte werden mit der Seite ausgeliefert; es werden **keine externen Dienste** nachgeladen. Nach dem ersten Laden funktioniert die Werkstatt auch ohne Internetverbindung.
- Die Werkstatt ist so gestaltet, dass **keine personenbezogenen Daten** anfallen: Verantwortlichkeiten werden als Funktionsbezeichnungen erfasst, nicht als Namen. Bitte halten Sie das auch in Freitextfeldern so.

## Empfehlung für den Arbeitsprozess

1. Diagnose gemeinsam in der Steuergruppe durchführen (gern im Workshop-Modus am Beamer).
2. Auswertung diskutieren, Hebel-Empfehlung prüfen, zwei bis drei Maßnahmen planen.
3. Konzept-Builder kapitelweise füllen — Offenes ehrlich als offen markieren.
4. Arbeitsstand exportieren, Konzept als Word-Datei in die Gremien geben.
5. Nach einem Jahr: Diagnose wiederholen und vergleichen.
