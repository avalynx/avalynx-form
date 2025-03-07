/**
 * AvalynxForm
 *
 * AvalynxForm is a lightweight, customizable form handling library for web applications. Based on Bootstrap >=5.3 without any framework dependencies.
 *
 * @version 0.0.2
 * @license MIT
 * @author https://github.com/avalynx/avalynx-datatable/graphs/contributors
 * @website https://github.com/avalynx/
 * @repository https://github.com/avalynx/avalynx-datatable.git
 * @bugs https://github.com/avalynx/avalynx-datatable/issues
 *
 * @param {string} id - The ID of the element to attach the form to.
 * @param {object} options - An object containing the following keys:
 * @param {object} options.apiParams - Additional parameters to be sent with the form data (default: `{}`).
 * @param {object} options.loader - An instance of AvalynxLoader to use as the loader for the modal (default: `null`).
 * @param {function} options.onSuccess - A callback function to be executed when the form submission is successful (default: `null`).
 * @param {function} options.onError - A callback function to be executed when the form submission fails (default: `null`).
 *
 */

export class AvalynxForm {
    constructor(id, options = {}) {
        this.form = document.getElementById(id);
        if (this.form === null) {
            console.error("AvalynxForm: Element with id '" + id + "' not found");
            return;
        }
        this.id = id;
        this.options = {
            apiParams: {},
            loader: null,
            onSuccess: null,
            onError: null,
            ...options
        };
        this.init();
    }

    init() {
        this.setupSubmitHandler();
        this.setupOverlayAndLoader();
    }

    setupSubmitHandler() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.sendAjaxRequest();
        });
    }

    async sendAjaxRequest() {
        const action = this.form.action;
        const method = this.form.method.toUpperCase();

        const formData = new FormData(this.form);

        for (const [key, value] of Object.entries(this.options.apiParams)) {
            formData.append(key, value);
        }

        try {
            if (this.options.loader === null) {
                const overlay = document.getElementById(`${this.id}-overlay`);
                overlay.style.display = 'flex';
            } else {
                this.options.loader.load = true;
            }

            const response = await fetch(action, {
                method: method,
                body: formData,
            });

            const result = await response.json();
            this.handleResponse(result);
        } catch (error) {
            console.error('Error during AJAX request:', error);
        } finally {
            if (this.options.loader === null) {
                const overlay = document.getElementById(`${this.id}-overlay`);
                if (overlay) {
                    overlay.style.display = 'none';
                }
            } else {
                this.options.loader.load = false;
            }
        }
    }

    handleResponse(response) {
        if (response.debug_msg !== undefined) {
            alert(response.debug_msg);
        }
        if ((response.success !== undefined) && (response.success === true)) {
            if (this.options.onSuccess) {
                this.options.onSuccess(response);
            }

            if (response.redirect !== undefined) {
                window.location.href = response.redirect;
            }
        } else {
            if (response.invalid !== undefined) {
                for (const [key, value] of Object.entries(response.invalid)) {
                    this.showInvalidFeedback(key, value);
                }
            }

            if (response.valid !== undefined) {
                for (const [key, value] of Object.entries(response.valid)) {
                    this.clearInvalidFeedback(key);
                }
            }

            if (this.options.onError) {
                this.options.onError(response);
            }
        }
    }

    showInvalidFeedback(key, value) {
        const elements = document.querySelectorAll(`#${key}, [name="${key}"], [name="${key}[]"], [name^="${key}["]`);
        elements.forEach(element => {
            const parentElement = element.closest('.form-group') || element.parentElement;
            if (parentElement !== null) {
                const spanElement = parentElement.querySelector('.invalid-feedback');
                element.classList.add('is-invalid');
                if (spanElement !== null) {
                    spanElement.innerHTML = value;
                    spanElement.style.display = 'block';
                }
            }
        });
    }

    clearInvalidFeedback(key) {
        const elements = document.querySelectorAll(`#${key}, [name="${key}"], [name="${key}[]"], [name^="${key}["]`);
        elements.forEach(element => {
            const parentElement = element.closest('.form-group') || element.parentElement;
            if (parentElement !== null) {
                const spanElement = parentElement.querySelector('.invalid-feedback');
                element.classList.remove('is-invalid');
                if (spanElement !== null) {
                    spanElement.innerHTML = "&nbsp;";
                    spanElement.style.display = 'none';
                }
            }
        });
    }

    setupOverlayAndLoader() {
        if (this.options.loader === null) {
            this.form.style.position = 'relative';
            const overlay = document.createElement('div');
            overlay.id = `${this.id}-overlay`;
            overlay.style.position = 'absolute';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.display = 'none';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.backgroundColor = 'rgba(var(--bs-body-bg-rgb, 0, 0, 0), 0.7)';
            overlay.style.zIndex = '1000';

            const spinner = document.createElement('div');
            spinner.className = 'spinner-border text-primary';
            spinner.role = 'status';
            spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';

            overlay.appendChild(spinner);
            this.form.appendChild(overlay);
        }
    }
}
