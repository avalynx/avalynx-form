# AvalynxForm

AvalynxForm is a lightweight, customizable form handling library for web applications. Based on Bootstrap >=5.3 without any framework dependencies.

## Features

- **Form Handling**: Simplifies the process of creating and managing forms in your web applications.
- **Bootstrap Integration**: Designed for seamless integration with Bootstrap >= 5.3.
- **Easy to Use**: Simple API for creating and managing forms within your web applications.

## Example

Here's a simple example of how to use AvalynxForm in your project:

* [Overview](https://avalynx-form.jbs-newmedia.de/examples/index.html)
* [Form](https://avalynx-form.jbs-newmedia.de/examples/form.html)
* [Form with slow response](https://avalynx-form.jbs-newmedia.de/examples/form-slow-response.html)
* [Form with AvalynxSelect](https://avalynx-form.jbs-newmedia.de/examples/form-with-avalynx-select.html)

## Installation

To use AvalynxForm in your project, you can directly include it in your HTML file. Ensure you have Bootstrap 5.3 or higher included in your project for AvalynxForm to work correctly.

First, include Bootstrap:

```html
<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script>
```

Then, include AvalynxForm:

```html
<script src="path/to/avalynx-form.js"></script>
```

Replace `path/to/avalynx-form.js` with the actual path to the file in your project.

## Installation via jsDelivr ([Link](https://cdn.jsdelivr.net/npm/avalynx-form/))

AvalynxForm is also available via [jsDelivr](https://www.jsdelivr.com/). You can include it in your project like this:

```html
<script src="https://cdn.jsdelivr.net/npm/avalynx-form@1.0.3/dist/js/avalynx-form.js"></script>
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxForm displays correctly.

## Installation via NPM ([Link](https://www.npmjs.com/package/avalynx-form))

AvalynxForm is also available as a npm package. You can add it to your project with the following command:

```bash
npm install avalynx-form
```

After installing, you can import AvalynxForm into your JavaScript file like this:

```javascript
import { AvalynxForm } from 'avalynx-form';
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxForm displays correctly.

## Installation via Symfony AssetMapper

```bash
php bin/console importmap:require avalynx-form
```

After installing, you can import AvalynxForm into your JavaScript file like this:

```javascript
import { AvalynxForm } from 'avalynx-form';
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxForm displays correctly.

## Installation via Symfony AssetComposer

More information about the Symfony AssetComposer Bundle can be found [here](https://github.com/jbsnewmedia/asset-composer-bundle).

```twig
{% do addAssetComposer('avalynx/avalynx-form/dist/js/avalynx-form.js') %}
```

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxForm displays correctly.

## Installation via Composer ([Link](https://packagist.org/packages/avalynx/avalynx-form))

AvalynxForm is also available as a Composer package. You can add it to your project with the following command:

```bash
composer require avalynx/avalynx-form
```

After installing, you can import AvalynxForm into your HTML file like this:

```html
<script src="vendor/avalynx/avalynx-form/dist/js/avalynx-form.js"></script>
``` 

Make sure to also include Bootstrap's JS/CSS in your project to ensure AvalynxForm displays correctly.

## Usage

To use AvalynxForm in your project, include the AvalynxForm JavaScript file in your project and initialize the class with the appropriate selector.

```javascript
new AvalynxForm("myForm", {
    apiParams: {
        extraData1: 'value1',
        extraData2: 'value2'
    },
    onSuccess: function(response) {
        console.log('Form submission was successful:', response);
    },
    onError: function(response) {
        console.error('Form submission failed:', response);
    }
});
```

## Options

AvalynxForm allows the following options for customization:

- `id`: (string) The ID of the element to attach the form to.
- `options`: An object containing the following keys:
  - `apiParams`: (object) Additional parameters to be sent with the form data (default: `{}`).
  - `loader`: (object) An instance of AvalynxLoader to use as the loader for the modal (default: `null`).
  - `onSuccess`: (function) A callback function to be executed when the form submission is successful (default: `null`).
  - `onError`: (function) A callback function to be executed when the form submission fails (default: `null`).
  - `onBeforeSubmit`: (function) A callback function to be executed before the form submission (default: `null`).
  - `onAfterSubmit`: (function) A callback function to be executed after the form submission (default: `null`).

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request with your changes or improvements. We're looking for contributions in the following areas:

- Bug fixes
- Feature enhancements
- Documentation improvements

Before submitting your pull request, please ensure your changes are well-documented and follow the existing coding style of the project.

## License

AvalynxForm is open-sourced software licensed under the [MIT license](LICENSE).

## Contact

If you have any questions, feature requests, or issues, please open an issue on our [GitHub repository](https://github.com/avalynx/avalynx-form/issues) or submit a pull request.

Thank you for considering AvalynxForm for your project!
