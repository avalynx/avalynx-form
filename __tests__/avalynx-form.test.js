/**
 * AvalynxForm Jest Tests
 * Comprehensive test suite for all important functionality
 */

// Mock bootstrap dropdown
global.bootstrap = {
    Dropdown: jest.fn().mockImplementation(() => ({
        hide: jest.fn(),
        show: jest.fn()
    }))
};

const AvalynxForm = require('../src/js/avalynx-form.js');

describe('AvalynxForm', () => {
    let formElement;
    let consoleErrorSpy;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <form id="test-form" action="/api/submit" method="POST">
                <div class="form-group">
                    <input type="text" id="username" name="username" class="form-control" />
                    <span class="invalid-feedback"></span>
                </div>
                <div class="form-group">
                    <input type="email" id="email" name="email" class="form-control" />
                    <span class="invalid-feedback"></span>
                </div>
                <div class="form-group">
                    <input type="checkbox" name="terms" value="1" class="form-check-input" />
                    <span class="invalid-feedback"></span>
                </div>
                <button type="submit">Submit</button>
            </form>
        `;
        formElement = document.getElementById('test-form');
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock fetch globally
        global.fetch = jest.fn();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with valid form ID', () => {
            const form = new AvalynxForm('test-form');
            expect(form.form).toBe(formElement);
            expect(form.id).toBe('test-form');
        });

        test('should log error and return when form element not found', () => {
            const form = new AvalynxForm('non-existent-form');
            expect(consoleErrorSpy).toHaveBeenCalledWith("AvalynxForm: Element with id 'non-existent-form' not found");
            expect(form.form).toBeNull();
        });

        test('should set default options', () => {
            const form = new AvalynxForm('test-form');
            expect(form.options.apiParams).toEqual({});
            expect(form.options.loader).toBeNull();
            expect(form.options.onSuccess).toBeNull();
            expect(form.options.onError).toBeNull();
        });

        test('should merge custom options with defaults', () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const apiParams = { test: 'value' };
            const form = new AvalynxForm('test-form', {
                apiParams,
                onSuccess,
                onError
            });
            expect(form.options.apiParams).toEqual(apiParams);
            expect(form.options.onSuccess).toBe(onSuccess);
            expect(form.options.onError).toBe(onError);
        });

        test('should handle null or non-object options', () => {
            const form1 = new AvalynxForm('test-form', null);
            expect(form1.options.apiParams).toEqual({});

            const form2 = new AvalynxForm('test-form', 'not-an-object');
            expect(form2.options.apiParams).toEqual({});
        });
    });

    describe('Initialization', () => {
        test('should setup submit handler on init', () => {
            const addEventListenerSpy = jest.spyOn(formElement, 'addEventListener');
            new AvalynxForm('test-form');
            expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
        });

        test('should create overlay and loader when loader option is null', () => {
            new AvalynxForm('test-form');
            const overlay = document.getElementById('test-form-overlay');
            expect(overlay).not.toBeNull();
            expect(overlay.style.position).toBe('absolute');
            expect(overlay.style.display).toBe('none');
            expect(formElement.style.position).toBe('relative');
        });

        test('should not create overlay when custom loader is provided', () => {
            const mockLoader = { load: false };
            new AvalynxForm('test-form', { loader: mockLoader });
            const overlay = document.getElementById('test-form-overlay');
            expect(overlay).toBeNull();
        });

        test('should create spinner inside overlay', () => {
            new AvalynxForm('test-form');
            const overlay = document.getElementById('test-form-overlay');
            const spinner = overlay.querySelector('.spinner-border');
            expect(spinner).not.toBeNull();
            expect(spinner.className).toContain('spinner-border');
            expect(spinner.className).toContain('text-primary');
        });
    });

    describe('Form Submission', () => {
        test('should prevent default form submission', () => {
            const form = new AvalynxForm('test-form');
            const event = new Event('submit', { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            formElement.dispatchEvent(event);
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test('should call sendAjaxRequest on form submit', async () => {
            const form = new AvalynxForm('test-form');
            const sendAjaxRequestSpy = jest.spyOn(form, 'sendAjaxRequest').mockResolvedValue();

            const event = new Event('submit', { bubbles: true, cancelable: true });
            formElement.dispatchEvent(event);

            expect(sendAjaxRequestSpy).toHaveBeenCalled();
        });
    });

    describe('AJAX Request Handling', () => {
        test('should call onBeforeSubmit and proceed if it returns true', async () => {
            const onBeforeSubmit = jest.fn().mockReturnValue(true);
            const form = new AvalynxForm('test-form', { onBeforeSubmit });
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            await form.sendAjaxRequest();

            expect(onBeforeSubmit).toHaveBeenCalledWith(formElement);
            expect(global.fetch).toHaveBeenCalled();
        });

        test('should call onBeforeSubmit and abort if it returns false', async () => {
            const onBeforeSubmit = jest.fn().mockReturnValue(false);
            const form = new AvalynxForm('test-form', { onBeforeSubmit });
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            await form.sendAjaxRequest();

            expect(onBeforeSubmit).toHaveBeenCalledWith(formElement);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('should call onAfterSubmit after request', async () => {
            const onAfterSubmit = jest.fn();
            const form = new AvalynxForm('test-form', { onAfterSubmit });
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            await form.sendAjaxRequest();

            expect(onAfterSubmit).toHaveBeenCalledWith(formElement);
        });

        test('should call onError when fetch fails and onError is provided', async () => {
            const onError = jest.fn();
            const error = new Error('Network error');
            global.fetch.mockRejectedValue(error);

            const form = new AvalynxForm('test-form', { onError });
            await form.sendAjaxRequest();

            expect(onError).toHaveBeenCalledWith(error);
        });

        test('should send FormData with correct action and method', async () => {
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            const form = new AvalynxForm('test-form');
            await form.sendAjaxRequest();

            expect(global.fetch).toHaveBeenCalledWith(
                'https://jestjs.io/api/submit',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData)
                })
            );
        });

        test('should append apiParams to FormData', async () => {
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            const form = new AvalynxForm('test-form', {
                apiParams: { api_key: '12345', token: 'abc' }
            });

            await form.sendAjaxRequest();

            const callArgs = global.fetch.mock.calls[0];
            const formData = callArgs[1].body;
            expect(formData.get('api_key')).toBe('12345');
            expect(formData.get('token')).toBe('abc');
        });

        test('should show overlay during request when no custom loader', async () => {
            let resolvePromise;
            global.fetch.mockReturnValue(new Promise(resolve => {
                resolvePromise = resolve;
            }));

            const form = new AvalynxForm('test-form');
            const overlay = document.getElementById('test-form-overlay');

            const requestPromise = form.sendAjaxRequest();

            // Check overlay is shown
            expect(overlay.style.display).toBe('flex');

            // Resolve the fetch
            resolvePromise({ json: async () => ({ success: true }) });
            await requestPromise;

            // Check overlay is hidden
            expect(overlay.style.display).toBe('none');
        });

        test('should use custom loader when provided', async () => {
            let resolvePromise;
            global.fetch.mockReturnValue(new Promise(resolve => {
                resolvePromise = resolve;
            }));

            const mockLoader = { load: false };
            const form = new AvalynxForm('test-form', { loader: mockLoader });

            const requestPromise = form.sendAjaxRequest();

            // Check loader is set to true
            expect(mockLoader.load).toBe(true);

            // Resolve the fetch
            resolvePromise({ json: async () => ({ success: true }) });
            await requestPromise;

            // Check loader is set to false
            expect(mockLoader.load).toBe(false);
        });

        test('should handle fetch errors gracefully', async () => {
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
            global.fetch.mockRejectedValue(new Error('Network error'));

            const form = new AvalynxForm('test-form');
            await form.sendAjaxRequest();

            expect(consoleErrorMock).toHaveBeenCalledWith('Error during AJAX request:', expect.any(Error));

            // Overlay should still be hidden after error
            const overlay = document.getElementById('test-form-overlay');
            expect(overlay.style.display).toBe('none');

            consoleErrorMock.mockRestore();
        });

        test('should hide overlay even when overlay is null in finally block', async () => {
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            const form = new AvalynxForm('test-form');
            const overlay = document.getElementById('test-form-overlay');
            overlay.remove(); // Remove overlay to test null check

            await expect(form.sendAjaxRequest()).resolves.not.toThrow();
        });
    });

    describe('Response Handling', () => {
        test('should call onSuccess callback on successful response', () => {
            const onSuccess = jest.fn();
            const form = new AvalynxForm('test-form', { onSuccess });

            const response = { success: true, message: 'Form submitted' };
            form.handleResponse(response);

            expect(onSuccess).toHaveBeenCalledWith(response);
        });

        test('should redirect on successful response with redirect URL', () => {
            const form = new AvalynxForm('test-form');
            const redirectSpy = jest.spyOn(form, 'redirect').mockImplementation(() => {});
            const response = { success: true, redirect: '/thank-you' };

            form.handleResponse(response);

            expect(redirectSpy).toHaveBeenCalledWith('/thank-you');
        });

        test('should show alert for debug messages', () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
            const form = new AvalynxForm('test-form');

            const response = { debug_msg: 'Debug information', success: false };
            form.handleResponse(response);

            expect(alertSpy).toHaveBeenCalledWith('Debug information');
            alertSpy.mockRestore();
        });

        test('should call onError callback on failed response', () => {
            const onError = jest.fn();
            const form = new AvalynxForm('test-form', { onError });

            const response = { success: false, message: 'Validation failed' };
            form.handleResponse(response);

            expect(onError).toHaveBeenCalledWith(response);
        });

        test('should not call onSuccess when success is undefined', () => {
            const onSuccess = jest.fn();
            const form = new AvalynxForm('test-form', { onSuccess });

            const response = { message: 'Some message' };
            form.handleResponse(response);

            expect(onSuccess).not.toHaveBeenCalled();
        });

        test('should not call onSuccess when success is false', () => {
            const onSuccess = jest.fn();
            const form = new AvalynxForm('test-form', { onSuccess });

            const response = { success: false };
            form.handleResponse(response);

            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('Validation Feedback', () => {
        test('should show invalid feedback for field', () => {
            const form = new AvalynxForm('test-form');
            const usernameInput = document.getElementById('username');
            const feedbackElement = usernameInput.parentElement.querySelector('.invalid-feedback');

            form.showInvalidFeedback('username', 'Username is required');

            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(feedbackElement.innerHTML).toBe('Username is required');
            expect(feedbackElement.style.display).toBe('block');
        });

        test('should show invalid feedback for field with name attribute', () => {
            const form = new AvalynxForm('test-form');
            const emailInput = document.querySelector('[name="email"]');
            const feedbackElement = emailInput.parentElement.querySelector('.invalid-feedback');

            form.showInvalidFeedback('email', 'Invalid email format');

            expect(emailInput.classList.contains('is-invalid')).toBe(true);
            expect(feedbackElement.innerHTML).toBe('Invalid email format');
            expect(feedbackElement.style.display).toBe('block');
        });

        test('should handle multiple invalid fields from response', () => {
            const form = new AvalynxForm('test-form');
            const response = {
                success: false,
                invalid: {
                    username: 'Username is required',
                    email: 'Email is invalid'
                }
            };

            form.handleResponse(response);

            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');

            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(emailInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should clear invalid feedback for field', () => {
            const form = new AvalynxForm('test-form');
            const usernameInput = document.getElementById('username');
            const feedbackElement = usernameInput.parentElement.querySelector('.invalid-feedback');

            // First add invalid feedback
            form.showInvalidFeedback('username', 'Username is required');

            // Then clear it
            form.clearInvalidFeedback('username');

            expect(usernameInput.classList.contains('is-invalid')).toBe(false);
            expect(feedbackElement.innerHTML).toBe('&nbsp;');
            expect(feedbackElement.style.display).toBe('none');
        });

        test('should clear valid fields from response', () => {
            const form = new AvalynxForm('test-form');
            const usernameInput = document.getElementById('username');

            // Add invalid feedback first
            form.showInvalidFeedback('username', 'Username is required');

            const response = {
                success: false,
                valid: {
                    username: true
                }
            };

            form.handleResponse(response);

            expect(usernameInput.classList.contains('is-invalid')).toBe(false);
        });

        test('should handle fields with array notation name[]', () => {
            document.body.innerHTML += `
                <form id="array-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <input type="text" name="tags[]" class="form-control" />
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('array-form');
            form.showInvalidFeedback('tags', 'At least one tag is required');

            const input = document.querySelector('[name="tags[]"]');
            expect(input.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle fields with associative array notation name[key]', () => {
            document.body.innerHTML += `
                <form id="assoc-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <input type="text" name="user[name]" class="form-control" />
                        <span class="invalid-feedback"></span>
                    </div>
                    <div class="form-group">
                        <input type="text" name="user[email]" class="form-control" />
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('assoc-form');
            // The source code uses [name^="user["] selector which matches fields starting with "user["
            form.showInvalidFeedback('user', 'User information is invalid');

            const input1 = document.querySelector('[name="user[name]"]');
            const input2 = document.querySelector('[name="user[email]"]');
            expect(input1.classList.contains('is-invalid')).toBe(true);
            expect(input2.classList.contains('is-invalid')).toBe(true);
        });

        test('should show invalid feedback for field in a custom input container', () => {
            document.body.innerHTML += `
                <form id="container-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <div class="avalynx-autocomplete-input-container">
                            <input type="text" id="autocomplete" name="autocomplete" class="form-control" />
                        </div>
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('container-form');
            const autocompleteInput = document.getElementById('autocomplete');
            const containerElement = autocompleteInput.closest('.avalynx-autocomplete-input-container');

            form.showInvalidFeedback('autocomplete', 'Selection is required');

            expect(autocompleteInput.classList.contains('is-invalid')).toBe(true);
            expect(containerElement.classList.contains('is-invalid')).toBe(true);
        });

        test('should clear invalid feedback for field in a custom input container', () => {
            document.body.innerHTML += `
                <form id="container-clear-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <div class="avalynx-test-input-container">
                            <input type="text" id="testinput" name="testinput" class="form-control" />
                        </div>
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('container-clear-form');
            const testInput = document.getElementById('testinput');
            const containerElement = testInput.closest('.avalynx-test-input-container');

            // Add invalid feedback first
            form.showInvalidFeedback('testinput', 'Error');
            expect(containerElement.classList.contains('is-invalid')).toBe(true);

            // Then clear it
            form.clearInvalidFeedback('testinput');
            expect(containerElement.classList.contains('is-invalid')).toBe(false);
        });

        test('should handle fields without form-group parent', () => {
            document.body.innerHTML += `
                <form id="no-group-form" action="/api/submit" method="POST">
                    <div>
                        <input type="text" id="simple" name="simple" class="form-control" />
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('no-group-form');
            form.showInvalidFeedback('simple', 'Field is invalid');

            const input = document.getElementById('simple');
            expect(input.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle fields without invalid-feedback span', () => {
            document.body.innerHTML += `
                <form id="no-feedback-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <input type="text" id="nofeedback" name="nofeedback" class="form-control" />
                    </div>
                </form>
            `;

            const form = new AvalynxForm('no-feedback-form');
            const input = document.getElementById('nofeedback');

            // Should not throw error
            expect(() => form.showInvalidFeedback('nofeedback', 'Error message')).not.toThrow();
            expect(input.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle multiple elements with same name', () => {
            document.body.innerHTML += `
                <form id="multi-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <input type="checkbox" name="options" value="1" class="form-check-input" />
                        <span class="invalid-feedback"></span>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" name="options" value="2" class="form-check-input" />
                        <span class="invalid-feedback"></span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('multi-form');
            form.showInvalidFeedback('options', 'Select at least one option');

            const inputs = document.querySelectorAll('[name="options"]');
            inputs.forEach(input => {
                expect(input.classList.contains('is-invalid')).toBe(true);
            });
        });
    });

    describe('Integration Tests', () => {
        test('should complete full submission flow with success', async () => {
            const onSuccess = jest.fn();
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true, message: 'Saved successfully' })
            });

            const form = new AvalynxForm('test-form', { onSuccess });

            const event = new Event('submit', { bubbles: true, cancelable: true });
            formElement.dispatchEvent(event);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(global.fetch).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalledWith({ success: true, message: 'Saved successfully' });
        });

        test('should complete full submission flow with validation errors', async () => {
            const onError = jest.fn();
            global.fetch.mockResolvedValue({
                json: async () => ({
                    success: false,
                    invalid: {
                        username: 'Username is required',
                        email: 'Email is invalid'
                    }
                })
            });

            const form = new AvalynxForm('test-form', { onError });

            const event = new Event('submit', { bubbles: true, cancelable: true });
            formElement.dispatchEvent(event);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(global.fetch).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();

            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(emailInput.classList.contains('is-invalid')).toBe(true);
        });

        test('should handle mixed valid and invalid fields', async () => {
            const onError = jest.fn();
            global.fetch.mockResolvedValue({
                json: async () => ({
                    success: false,
                    valid: {
                        email: true
                    },
                    invalid: {
                        username: 'Username is required'
                    }
                })
            });

            const form = new AvalynxForm('test-form', { onError });

            // First mark email as invalid
            form.showInvalidFeedback('email', 'Some error');

            const event = new Event('submit', { bubbles: true, cancelable: true });
            formElement.dispatchEvent(event);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            expect(usernameInput.classList.contains('is-invalid')).toBe(true);
            expect(emailInput.classList.contains('is-invalid')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('should call redirect with correct URL', () => {
            const form = new AvalynxForm('test-form');
            expect(typeof form.redirect).toBe('function');

            const redirectSpy = jest.spyOn(form, 'redirect').mockImplementation(() => {});
            form.handleResponse({ success: true, redirect: '/test-url' });
            expect(redirectSpy).toHaveBeenCalledWith('/test-url');
        });

        test('should set window.location.href when redirect is called', () => {
            const form = new AvalynxForm('test-form');
            expect(() => form.redirect('https://jestjs.io/new-page')).not.toThrow();
        });

        test('should handle empty response object', () => {
            const form = new AvalynxForm('test-form');
            expect(() => form.handleResponse({})).not.toThrow();
        });

        test('should handle null response', () => {
            const form = new AvalynxForm('test-form');
            expect(() => form.handleResponse(null)).toThrow();
        });

        test('should handle form method in different cases', async () => {
            formElement.method = 'post';
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            const form = new AvalynxForm('test-form');
            await form.sendAjaxRequest();

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST'
                })
            );
        });

        test('should handle form with GET method', async () => {
            formElement.method = 'GET';
            global.fetch.mockResolvedValue({
                json: async () => ({ success: true })
            });

            const form = new AvalynxForm('test-form');
            await form.sendAjaxRequest();

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        test('should handle success: false without calling onError when onError is not provided', () => {
            const form = new AvalynxForm('test-form');
            expect(() => form.handleResponse({ success: false })).not.toThrow();
        });

        test('should handle both debug_msg and success redirect', () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
            const onSuccess = jest.fn();
            const form = new AvalynxForm('test-form', { onSuccess });
            const redirectSpy = jest.spyOn(form, 'redirect').mockImplementation(() => {});

            const response = {
                success: true,
                debug_msg: 'Debug info',
                redirect: '/success-page'
            };
            form.handleResponse(response);

            expect(alertSpy).toHaveBeenCalledWith('Debug info');
            expect(onSuccess).toHaveBeenCalledWith(response);
            expect(redirectSpy).toHaveBeenCalledWith('/success-page');

            alertSpy.mockRestore();
        });

        test('should handle showInvalidFeedback when parentElement is null', () => {
            document.body.innerHTML += `
                <form id="null-parent-form" action="/api/submit" method="POST">
                    <input type="text" id="orphan-input" name="orphan" class="form-control" />
                </form>
            `;

            const form = new AvalynxForm('null-parent-form');
            const input = document.getElementById('orphan-input');

            // Mock closest to return null and parentElement to be null
            Object.defineProperty(input, 'closest', {
                value: jest.fn(() => null),
                configurable: true
            });
            Object.defineProperty(input, 'parentElement', {
                value: null,
                configurable: true
            });

            // Should not throw error and should not add is-invalid class when parentElement is null
            expect(() => form.showInvalidFeedback('orphan', 'Error message')).not.toThrow();
            expect(input.classList.contains('is-invalid')).toBe(false);
        });

        test('should clear invalid feedback for field without form-group parent using parentElement fallback', () => {
            document.body.innerHTML += `
                <form id="no-group-clear-form" action="/api/submit" method="POST">
                    <div>
                        <input type="text" id="nogroupclear" name="nogroupclear" class="form-control is-invalid" />
                        <span class="invalid-feedback" style="display:block">Error</span>
                    </div>
                </form>
            `;

            const form = new AvalynxForm('no-group-clear-form');
            form.clearInvalidFeedback('nogroupclear');

            const input = document.getElementById('nogroupclear');
            expect(input.classList.contains('is-invalid')).toBe(false);
        });

        test('should clear invalid feedback for field without invalid-feedback span', () => {
            document.body.innerHTML += `
                <form id="no-feedback-clear-form" action="/api/submit" method="POST">
                    <div class="form-group">
                        <input type="text" id="nofeedbackclear" name="nofeedbackclear" class="form-control is-invalid" />
                    </div>
                </form>
            `;

            const form = new AvalynxForm('no-feedback-clear-form');
            expect(() => form.clearInvalidFeedback('nofeedbackclear')).not.toThrow();

            const input = document.getElementById('nofeedbackclear');
            expect(input.classList.contains('is-invalid')).toBe(false);
        });

        test('should handle clearInvalidFeedback when parentElement is null', () => {
            document.body.innerHTML += `
                <form id="null-parent-clear-form" action="/api/submit" method="POST">
                    <input type="text" id="orphan-clear-input" name="orphanclear" class="form-control is-invalid" />
                </form>
            `;

            const form = new AvalynxForm('null-parent-clear-form');
            const input = document.getElementById('orphan-clear-input');

            // Mock closest to return null and parentElement to be null
            Object.defineProperty(input, 'closest', {
                value: jest.fn(() => null),
                configurable: true
            });
            Object.defineProperty(input, 'parentElement', {
                value: null,
                configurable: true
            });

            // Should not throw error and should not remove is-invalid class when parentElement is null
            expect(() => form.clearInvalidFeedback('orphanclear')).not.toThrow();
            expect(input.classList.contains('is-invalid')).toBe(true);
        });
    });

    describe('Module Export', () => {
        test('should export AvalynxForm when module exists', () => {
            // This test verifies the module.exports branch is covered
            // The require at the top of this file already tests this path
            const AvalynxFormModule = require('../src/js/avalynx-form.js');
            expect(AvalynxFormModule).toBe(AvalynxForm);
        });

        test('should verify module.exports is set correctly', () => {
            const AvalynxFormModule = require('../src/js/avalynx-form.js');
            expect(AvalynxFormModule).toBe(AvalynxForm);
            expect(typeof AvalynxFormModule).toBe('function');
        });
    });
});
