/**
 * Alle UI-Strings der App (Spezifikation Abschnitt 1: i18n / Abschnitt 6: Microcopy).
 * Anrede „Sie", Buttons imperativisch-neutral, Ton sachlich-zugewandt. Keine Emojis.
 */
export const ui = {
  app: {
    titel: 'KI-Konzept-Werkstatt',
    claim:
      'Entwickeln Sie das KI-Konzept Ihrer Schule — strukturiert, im Team, ohne Datenübertragung.',
    footerFamilie: 'Ein Werkzeug aus der Familie der KI-Werkstätten von Joscha Falck',
    footerLizenz: 'Lizenz: CC BY-SA 4.0',
    footerVersion: 'Version',
    gespeichert: 'Gespeichert',
    speichert: 'Speichert …',
    zurueck: 'Zurück',
    weiter: 'Weiter',
    abbrechen: 'Abbrechen',
    schliessen: 'Schließen',
    drucken: 'Druckansicht öffnen',
    laden: 'Wird geladen …',
  },
  fehler: {
    moduleTitel: 'In diesem Modul ist ein Fehler aufgetreten',
    moduleText:
      'Ihre Daten sind davon nicht betroffen und bleiben gespeichert. Sie können die Seite neu laden oder in einem anderen Modul weiterarbeiten.',
    neuLaden: 'Seite neu laden',
  },
  storage: {
    bannerTitel: 'Automatisches Speichern nicht möglich',
    bannerText:
      'Ihr Browser erlaubt kein lokales Speichern (z. B. im privaten Modus). Sie können weiterarbeiten — sichern Sie Ihren Arbeitsstand aber regelmäßig als Datei, sonst geht er beim Schließen verloren.',
    quotaText:
      'Der lokale Speicher ist voll. Exportieren Sie nicht mehr benötigte Projekte als Datei und löschen Sie sie anschließend in der Projektliste.',
    beforeUnload:
      'Es gibt ungesicherte Änderungen, die nicht automatisch gespeichert werden konnten. Seite wirklich verlassen?',
  },
  start: {
    neuesProjekt: 'Neues Projekt anlegen',
    importieren: 'JSON-Datei importieren',
    leerTitel: 'Willkommen in der KI-Konzept-Werkstatt',
    leerText:
      'Hier entwickeln Sie Schritt für Schritt das KI-Konzept Ihrer Schule: vom ehrlichen Blick auf den Ist-Stand über priorisierte Maßnahmen bis zum exportierbaren Konzeptdokument. Alle Daten bleiben auf diesem Gerät — nichts wird übertragen. Legen Sie ein Projekt an, um zu beginnen.',
    zuletztGeaendert: 'Zuletzt geändert',
    projektOeffnen: 'Projekt öffnen',
    projektLoeschen: 'Projekt löschen',
    loeschenTitel: 'Projekt löschen?',
    loeschenText:
      'Das Projekt „{titel}“ wird endgültig von diesem Gerät gelöscht. Falls Sie es behalten möchten, sichern Sie es vorher als JSON-Datei.',
    loeschenBestaetigen: 'Endgültig löschen',
    titelLabel: 'Projekttitel',
    titelPlaceholder: 'z. B. KI-Konzept Mittelschule Musterort',
    anlegen: 'Projekt anlegen',
    umbenennen: 'Umbenennen',
    importFehlerJson:
      'Diese Datei ist keine gültige JSON-Datei. Prüfen Sie, ob Sie die richtige Datei gewählt haben — sie wurde möglicherweise beschädigt oder ist kein Export der Werkstatt.',
    importFehlerFremd:
      'Diese Datei ist keine Datei der KI-Konzept-Werkstatt. Wählen Sie eine Datei, die zuvor mit „Arbeitsstand sichern (JSON)“ erstellt wurde.',
    importFehlerNeuer:
      'Diese Datei stammt aus einer neueren Version der Werkstatt. Laden Sie die Seite neu (ggf. Cache leeren), um die aktuelle Version zu erhalten, und versuchen Sie den Import erneut.',
    importKopieHinweis:
      'Die Datei wurde als Kopie importiert, ein gleichnamiges Projekt existierte bereits.',
    importErfolg: 'Projekt erfolgreich importiert.',
  },
  dashboard: {
    sichern: 'Arbeitsstand sichern (JSON)',
    geraetebindung:
      'Ihr Arbeitsstand wird nur auf diesem Gerät und in diesem Browser gespeichert. Für die Weitergabe im Team und als Sicherung nutzen Sie die JSON-Datei.',
    statusNichtBegonnen: 'Nicht begonnen',
    statusInArbeit: 'In Arbeit',
    statusAbgeschlossen: 'Abgeschlossen',
    module: {
      diagnose: {
        titel: 'Selbstdiagnose',
        text: 'Schätzen Sie den Ist-Stand Ihrer Schule in sieben Dimensionen ein — verhaltensnah und diskutierbar.',
      },
      referenz: {
        titel: 'Referenzrahmen',
        text: 'Lesen Sie nach, was die sieben Dimensionen bedeuten und woran Entwicklung erkennbar ist.',
      },
      builder: {
        titel: 'Konzept-Builder',
        text: 'Formulieren Sie Ihr KI-Konzept kapitelweise — mit Textgerüsten, die Ihre schulspezifischen Entscheidungen einfordern.',
      },
      massnahmen: {
        titel: 'Maßnahmenplaner',
        text: 'Planen Sie wenige, gut verankerte Maßnahmen — mit Wirkung-Aufwand-Matrix und Entlastungsfrage.',
      },
      prozess: {
        titel: 'Prozessbegleitung',
        text: 'Materialien für den Weg: Diskussionskarten, Ablauf für den pädagogischen Tag, Beschlussvorlage, Elterninformation.',
      },
    },
  },
  diagnose: {
    titel: 'Selbstdiagnose',
    intro:
      'Schätzen Sie für jede Dimension ein, welche Beschreibung dem Stand Ihrer Schule am nächsten kommt. Notieren Sie nach Möglichkeit Belege — das macht die Auswertung im Team belastbarer.',
    itemsBearbeitet: 'von',
    itemsEinheit: 'Einschätzungen',
    auswertungAnzeigen: 'Auswertung anzeigen',
    auswertungTeilweise: 'Auswertung anzeigen (teilweise möglich)',
    auswertungGesperrt:
      'Die Auswertung wird verfügbar, sobald mindestens eine Dimension vollständig eingeschätzt ist.',
    workshopStarten: 'Workshop-Modus starten',
    evidenzLabel: 'Beleg / Beobachtung (empfohlen)',
    evidenzPlaceholder:
      'Woran machen Sie diese Einschätzung fest? z. B. Beschluss, Dokument, beobachtete Praxis. Funktionsbezeichnungen statt Namen verwenden.',
    stufeWaehlen: 'Stufe auswählen',
    keineEinschaetzung: 'Noch nicht eingeschätzt',
    itemVon: 'Einschätzung {aktuell} von {gesamt}',
    dimensionAbgeschlossen: 'Diese Dimension ist vollständig eingeschätzt.',
    zurUebersicht: 'Zur Diagnose-Übersicht',
    naechsteDimension: 'Nächste Dimension',
  },
  workshop: {
    beenden: 'Workshop-Modus beenden',
    tastatur: 'Tastatur: ← / → Einschätzung wechseln · 0–3 Stufe wählen',
  },
  auswertung: {
    titel: 'Auswertung',
    standHinweis:
      'Zuletzt vollständig eingeschätzt am {datum}. Seitdem wurden Einschätzungen geändert.',
    unvollstaendigHinweis:
      'Die Diagnose ist noch nicht vollständig. Angezeigt werden nur vollständig eingeschätzte Dimensionen; die übrigen erscheinen ausgegraut.',
    leerTitel: 'Noch keine Auswertung möglich',
    leerText:
      'Die Auswertung entsteht aus Ihren Einschätzungen in der Selbstdiagnose. Schließen Sie mindestens eine Dimension vollständig ab, um hier ein Ergebnis zu sehen.',
    zurDiagnose: 'Zur Selbstdiagnose',
    hebelTitel: 'Wo Sie ansetzen sollten',
    zusatzHinweise: 'Weitere Hinweise',
    staerken: 'Stärken',
    entwicklungsfelder: 'Entwicklungsfelder',
    mittelwerte: 'Mittelwerte je Dimension',
    dimension: 'Dimension',
    mittelwert: 'Mittelwert',
    ohneEvidenz: '{ohne} von {gesamt} Einschätzungen ohne Beleg-Notiz.',
    weiterMassnahmen: 'Weiter zum Maßnahmenplaner',
    weiterBuilder: 'Weiter zum Konzept-Builder',
    radarLabel: 'Spinnennetz-Diagramm der Mittelwerte: {werte}',
    nichtVollstaendig: 'unvollständig',
  },
  referenz: {
    titel: 'Referenzrahmen',
    intro:
      'Die fachliche Grundlage der Selbstdiagnose: sieben Dimensionen schulischer KI-Entwicklung.',
    vertiefung: 'Vertiefung',
    herleitung: 'Wie diese Kriterien entstanden sind',
  },
  builder: {
    titel: 'Konzept-Builder',
    intro:
      'Ihr Konzept entsteht kapitelweise. Wählen Sie je Kapitel ein Textgerüst und treffen Sie die schulspezifischen Entscheidungen, die das Gerüst einfordert. Was noch nicht entschieden ist, markieren Sie als offen.',
    statusEntwurf: 'Entwurf',
    statusOffen: 'Offen markiert',
    statusFertig: 'Fertig',
    statusLeer: 'Nicht begonnen',
    geruestWaehlen: 'Gerüst wählen',
    geruestWechseln: 'Gerüst wechseln',
    geruestWechselTitel: 'Gerüst wirklich wechseln?',
    geruestWechselText:
      'Beim Wechsel des Gerüsts gehen die Eingaben in diesem Kapitel verloren. Diese Entscheidung kann nicht rückgängig gemacht werden.',
    geruestWechselBestaetigen: 'Gerüst wechseln, Eingaben verwerfen',
    leitfragen: 'Leitfragen für dieses Kapitel',
    markedOpenLabel: 'Offen — wird im Kollegium geklärt',
    pflichtfeld: 'Pflichtfeld',
    exportTitel: 'Konzept exportieren',
    exportDocx: 'Als Word-Datei exportieren (DOCX)',
    exportMd: 'Als Markdown exportieren',
    exportGateTitel: 'Export noch nicht möglich',
    exportGateText:
      'Die folgenden Pflichtfelder sind weder ausgefüllt noch als offen markiert. Füllen Sie sie aus oder markieren Sie sie als offen — offene Felder erscheinen im Export sichtbar gekennzeichnet.',
    exportGateLink: 'Zum Feld',
    docxFehler:
      'Die Word-Datei konnte nicht erstellt werden. Sie können das Konzept stattdessen als Markdown exportieren — der Inhalt ist identisch.',
    gremienHinweis: 'Hinweise zur Beteiligung finden Sie in den Randnotizen des Gerüsts.',
    zeichen: 'Zeichen',
  },
  massnahmen: {
    titel: 'Maßnahmenplaner',
    intro:
      'Wenige, gut verankerte Maßnahmen wirken mehr als ein langer Katalog. Jede Maßnahme braucht eine Antwort auf die Entlastungsfrage: Was lassen wir dafür weg?',
    leerTitel: 'Noch keine Maßnahmen geplant',
    leerText:
      'Ein guter Startpunkt sind die Hebel-Empfehlungen und Entwicklungsfelder aus der Diagnose-Auswertung. Legen Sie Ihre erste Maßnahme an.',
    neueMassnahme: 'Maßnahme anlegen',
    bearbeiten: 'Bearbeiten',
    loeschen: 'Löschen',
    loeschenTitel: 'Maßnahme löschen?',
    loeschenText: 'Die Maßnahme „{titel}“ wird gelöscht.',
    tabListe: 'Liste',
    tabMatrix: 'Matrix',
    warnungViele:
      'Sie planen bereits {anzahl} Maßnahmen. Erfahrungsgemäß werden mehr als sieben Maßnahmen selten umgesetzt — prüfen Sie, ob Sie priorisieren können.',
    formTitel: 'Titel der Maßnahme',
    formDimension: 'Dimension',
    formBeschreibung: 'Beschreibung',
    formRolle: 'Verantwortung',
    formRolleHinweis:
      'Funktionsbezeichnung verwenden, keine Namen — z. B. „Steuergruppe“, „Fachschaftsleitung Deutsch“.',
    formHorizont: 'Zeithorizont',
    horizontShort: 'Kurzfristig (bis 3 Monate)',
    horizontMid: 'Mittelfristig (dieses Schuljahr)',
    horizontLong: 'Langfristig (über das Schuljahr hinaus)',
    formWirkung: 'Erwartete Wirkung',
    formAufwand: 'Aufwand',
    wirkungGering: 'gering',
    wirkungHoch: 'hoch',
    nichtEingeordnet: 'Noch nicht eingeordnet',
    formEntlastung: 'Entlastung: Was lassen wir dafür weg?',
    formEntlastungPlaceholder:
      'Welche bisherige Aufgabe, Routine oder welches Vorhaben wird dafür beendet oder zurückgestellt?',
    formEntlastungWaiver: 'Keine Entlastung — zusätzliche Belastung wird bewusst in Kauf genommen',
    formEntlastungFehler:
      'Beantworten Sie die Entlastungsfrage oder bestätigen Sie ausdrücklich, dass die Maßnahme als zusätzliche Belastung getragen wird.',
    speichern: 'Maßnahme speichern',
    matrixHinweis:
      'Klicken Sie eine Maßnahme an und anschließend den Ziel-Quadranten — oder nutzen Sie die Auswahlfelder auf der Karte.',
    matrixHierZuerst: 'Hier zuerst',
    quadrantWirkungHochAufwandGering: 'Hohe Wirkung · geringer Aufwand',
    quadrantWirkungHochAufwandHoch: 'Hohe Wirkung · hoher Aufwand',
    quadrantWirkungGeringAufwandGering: 'Geringe Wirkung · geringer Aufwand',
    quadrantWirkungGeringAufwandHoch: 'Geringe Wirkung · hoher Aufwand',
    einordnenLeiste: 'Noch einzuordnen',
  },
  prozess: {
    titel: 'Prozessbegleitung',
    intro:
      'Ein KI-Konzept entsteht nicht am Schreibtisch allein. Diese Materialien unterstützen die Verständigung im Kollegium und mit den Gremien — alle druckbar.',
    kartenTitel: 'Diskussionskarten',
    kartenText:
      'Acht Thesen für Konferenzen und pädagogische Tage — bewusst zugespitzt, zum Zerschneiden.',
    ansehen: 'Ansehen',
    kartenHinweisLabel: 'Hinweis zur Moderation',
  },
  hinweise: {
    titel: 'Wie arbeiten wir im Team damit?',
  },
  herleitung: {
    titel: 'Herleitung der Kriterien',
  },
} as const;
