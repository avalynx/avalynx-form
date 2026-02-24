# AvalynxForm

[![npm version](https://img.shields.io/npm/v/avalynx-form)](https://www.npmjs.com/package/avalynx-form)
[![npm downloads](https://img.shields.io/npm/dt/avalynx-form)](https://www.npmjs.com/package/avalynx-form)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/avalynx-form)](https://www.jsdelivr.com/package/npm/avalynx-form)
[![License](https://img.shields.io/npm/l/avalynx-form)](LICENSE)
[![Tests](https://github.com/avalynx/avalynx-form/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/avalynx/avalynx-form/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/avalynx/avalynx-form/branch/main/graph/badge.svg)](https://codecov.io/gh/avalynx/avalynx-form)
[![GitHub stars](https://img.shields.io/github/stars/avalynx/avalynx-form?style=flat&logo=github)](https://github.com/avalynx/avalynx-form)

AvalynxForm ist eine leichtgewichtige, anpassbare Formular-Handling-Bibliothek für Webanwendungen. Basierend auf Bootstrap >=5.3 ohne jegliche Framework-Abhängigkeiten.

## Funktionen

- **Formular-Handling**: Vereinfacht den Prozess der Erstellung und Verwaltung von Formularen in Ihren Webanwendungen.
- **Bootstrap-Integration**: Entwickelt für die nahtlose Integration mit Bootstrap >= 5.3.
- **Einfach zu bedienen**: Einfache API zur Erstellung und Verwaltung von Formularen in Ihren Webanwendungen.

## Beispiel

Hier ist ein einfaches Beispiel für die Verwendung von AvalynxForm in Ihrem Projekt:

* [Übersicht](https://avalynx-form.jbs-newmedia.de/examples/index.html)
* [Formular](https://avalynx-form.jbs-newmedia.de/examples/form.html)
* [Formular mit langsamer Antwort](https://avalynx-form.jbs-newmedia.de/examples/form-slow-response.html)
* [Formular mit AvalynxSelect](https://avalynx-form.jbs-newmedia.de/examples/form-with-avalynx-select.html)

## Installation

Um AvalynxForm in Ihrem Projekt zu verwenden, können Sie es direkt in Ihre HTML-Datei einbinden. Stellen Sie sicher, dass Sie Bootstrap 5.3 oder höher in Ihrem Projekt eingebunden haben, damit AvalynxForm korrekt funktioniert.

Zuerst Bootstrap einbinden:

```html
<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script>
```

Dann AvalynxForm einbinden:

```html
<script src="pfad/zu/avalynx-form.js"></script>
```

Ersetzen Sie `pfad/zu/avalynx-form.js` durch den tatsächlichen Pfad zur Datei in Ihrem Projekt.

## Installation über jsDelivr ([Link](https://cdn.jsdelivr.net/npm/avalynx-form/))

AvalynxForm ist auch über [jsDelivr](https://www.jsdelivr.com/) verfügbar. Sie können es wie folgt in Ihr Projekt einbinden:

```html
<script src="https://cdn.jsdelivr.net/npm/avalynx-form@1.0.4/dist/js/avalynx-form.js"></script>
```

Stellen Sie sicher, dass Sie auch die JS/CSS-Dateien von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxForm zu gewährleisten.

## Installation über NPM ([Link](https://www.npmjs.com/package/avalynx-form))

AvalynxForm ist auch als npm-Paket verfügbar. Sie können es mit dem folgenden Befehl zu Ihrem Projekt hinzufügen:

```bash
npm install avalynx-form
```

Nach der Installation können Sie AvalynxForm wie folgt in Ihre JavaScript-Datei importieren:

```javascript
import { AvalynxForm } from 'avalynx-form';
```

Stellen Sie sicher, dass Sie auch die JS/CSS-Dateien von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxForm zu gewährleisten.

## Installation über Symfony AssetMapper

```bash
php bin/console importmap:require avalynx-form
```

Nach der Installation können Sie AvalynxForm wie folgt in Ihre JavaScript-Datei importieren:

```javascript
import { AvalynxForm } from 'avalynx-form';
```

Stellen Sie sicher, dass Sie auch die JS/CSS-Dateien von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxForm zu gewährleisten.

## Installation über Symfony AssetComposer

Weitere Informationen zum Symfony AssetComposer Bundle finden Sie [hier](https://github.com/jbsnewmedia/asset-composer-bundle).

```twig
{% do addAssetComposer('avalynx/avalynx-form/dist/js/avalynx-form.js') %}
```

Stellen Sie sicher, dass Sie auch die JS/CSS-Dateien von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxForm zu gewährleisten.

## Installation über Composer ([Link](https://packagist.org/packages/avalynx/avalynx-form))

AvalynxForm ist auch als Composer-Paket verfügbar. Sie können es mit dem folgenden Befehl zu Ihrem Projekt hinzufügen:

```bash
composer require avalynx/avalynx-form
```

Nach der Installation können Sie AvalynxForm wie folgt in Ihre HTML-Datei einbinden:

```html
<script src="vendor/avalynx/avalynx-form/dist/js/avalynx-form.js"></script>
``` 

Stellen Sie sicher, dass Sie auch die JS/CSS-Dateien von Bootstrap in Ihr Projekt einbinden, um eine korrekte Anzeige von AvalynxForm zu gewährleisten.

## Verwendung

Um AvalynxForm in Ihrem Projekt zu verwenden, binden Sie die JavaScript-Datei von AvalynxForm in Ihr Projekt ein und initialisieren Sie die Klasse mit dem entsprechenden Selektor.

```javascript
new AvalynxForm("myForm", {
    apiParams: {
        extraData1: 'wert1',
        extraData2: 'wert2'
    },
    onSuccess: function(response) {
        console.log('Formularübermittlung war erfolgreich:', response);
    },
    onError: function(response) {
        console.error('Formularübermittlung fehlgeschlagen:', response);
    }
});
```

## Optionen

AvalynxForm ermöglicht die folgenden Optionen zur Anpassung:

- `id`: (string) Die ID des Elements, an das das Formular angehängt werden soll.
- `options`: Ein Objekt, das die folgenden Schlüssel enthält:
  - `apiParams`: (object) Zusätzliche Parameter, die mit den Formulardaten gesendet werden sollen (Standard: `{}`).
  - `loader`: (object) Eine Instanz von AvalynxLoader, die als Loader für das Modal verwendet werden soll (Standard: `null`).
  - `onSuccess`: (function) Eine Callback-Funktion, die ausgeführt wird, wenn die Formularübermittlung erfolgreich ist (Standard: `null`).
  - `onError`: (function) Eine Callback-Funktion, die ausgeführt wird, wenn die Formularübermittlung fehlschlägt (Standard: `null`).
  - `onBeforeSubmit`: (function) Eine Callback-Funktion, die vor der Formularübermittlung ausgeführt wird (Standard: `null`).
  - `onAfterSubmit`: (function) Eine Callback-Funktion, die nach der Formularübermittlung ausgeführt wird (Standard: `null`).

## Mitwirken

Beiträge sind willkommen! Wenn Sie einen Beitrag leisten möchten, erstellen Sie bitte einen Fork des Repositorys und senden Sie einen Pull-Request mit Ihren Änderungen oder Verbesserungen. Wir suchen nach Beiträgen in den folgenden Bereichen:

- Fehlerbehebungen
- Funktionserweiterungen
- Verbesserungen der Dokumentation

Bevor Sie Ihren Pull-Request absenden, stellen Sie bitte sicher, dass Ihre Änderungen gut dokumentiert sind und dem bestehenden Codierungsstil des Projekts entsprechen.

## Lizenz

AvalynxForm ist quelloffene Software, die unter der [MIT-Lizenz](LICENSE) lizenziert ist.

## Kontakt

Wenn Sie Fragen, Funktionswünsche oder Probleme haben, eröffnen Sie bitte ein Issue in unserem [GitHub-Repository](https://github.com/avalynx/avalynx-form/issues) oder senden Sie einen Pull-Request.

Vielen Dank, dass Sie AvalynxForm für Ihr Projekt in Betracht ziehen!
