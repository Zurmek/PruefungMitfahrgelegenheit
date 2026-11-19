# Fahrgemeinschafts-Matcher

Eine Web-App, über die Studierende der Hochschule Landshut
Fahrgemeinschaften zur Hochschule finden und anbieten können.
Das Prinzip von BlaBlaCar, aber begrenzt auf eine Hochschule.

**Live-Demo:** https://zurmek.github.io/PruefungMitfahrgelegenheit/

## Das Problem

Fahrgemeinschaften werden an der Hochschule über WhatsApp-Gruppen
und Aushänge organisiert. Wer eine Mitfahrgelegenheit sucht, muss
in mehreren Gruppen fragen und hoffen, dass jemand antwortet, der
zufällig dieselbe Strecke zur selben Zeit fährt. Angebot und
Nachfrage finden sich nur zufällig.

## Was die App kann

- Registrierung und Login mit Hochschul-Mailadresse
- Benutzerprofil mit Wohnort und Kontaktdaten
- Fahrten als Fahrer anbieten
- Fahrten suchen nach Start, Ziel, Datum und Anzahl der Plätze
- Fahrtenübersicht und Verwaltung der eigenen Fahrten
- Matching zwischen Fahrern und Mitfahrern
- Kartendarstellung der Orte über Leaflet und OpenStreetMap
- Kontaktaufnahme per WhatsApp statt eigenem Chat

Fachliche Regeln sind abgebildet, zum Beispiel kann man pro Tag
nur eine Rolle einnehmen: entweder Fahrer oder Mitfahrer.

## Technischer Stand

HTML, CSS und JavaScript ohne Framework. Kartendarstellung über
Leaflet. Alle Daten liegen im localStorage des Browsers.

## Einschränkungen

Das hier ist ein Prototyp aus einem Hochschulprojekt, kein
produktionsreifes System:

- Es gibt kein Backend. Alle Daten liegen lokal im Browser und
  werden zwischen Nutzern nicht geteilt.
- Die Authentifizierung ist nicht produktionsreif. Passwörter
  werden nicht sicher gespeichert.
- Es gibt keine Validierung der Hochschul-Mailadresse.

Für den Zweck des Projekts war das bewusst so gesetzt: Ziel war,
den Ablauf und die Logik abzubilden, nicht eine betriebsfähige
Plattform.

## Wie es entstanden ist

Allein gebaut, KI-gestützt mit ChatGPT, GitHub Copilot und Gemini
direkt in VS Code. Frontend-Entwicklung hatte ich vorher nicht
gemacht.

Die interessanteste Erfahrung dabei: der Engpass war nicht das
Schreiben des Codes, sondern die Entscheidung, welche Fälle das
System überhaupt abbilden muss. Zum Beispiel, was passieren soll,
wenn jemand an einem Tag sowohl fahren als auch mitfahren möchte.

## Was ich heute anders machen würde

- Backend mit echter Datenbank, damit Fahrten zwischen Nutzern
  sichtbar werden
- Authentifizierung über einen etablierten Anbieter statt selbst
  gebaut
- Die Rollenlogik Fahrer und Mitfahrer sauberer modellieren,
  statt sie über Sonderfälle abzufangen
