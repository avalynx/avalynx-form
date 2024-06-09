import { AvalynxForm } from '../dist/js/avalynx-form.esm.js';

describe('AvalynxForm', () => {
    let form;
    let avalynxForm;

    beforeEach(() => {
        form = document.createElement('form');
        form.id = 'test-form';
        form.action = '/submit';
        form.method = 'POST';
        form.innerHTML = `
            <div class="form-group">
                <input type="text" id="input1" name="input1" class="form-control" required>
                <div class="invalid-feedback">Please provide a valid input.</div>
            </div>
            <button type="submit">Submit</button>
        `;
        document.body.appendChild(form);

        avalynxForm = new AvalynxForm('test-form', {
            apiParams: { extraParam: 'extraValue' },
            onSuccess: jest.fn(),
            onError: jest.fn(),
        });
    });

    afterEach(() => {
        document.body.removeChild(form);
    });

    test('should be created correctly', () => {
        expect(avalynxForm).toBeInstanceOf(AvalynxForm);
    });

    test('init should set up the submit handler', () => {
        const submitHandler = jest.spyOn(avalynxForm, 'setupSubmitHandler');
        avalynxForm.init();
        expect(submitHandler).toHaveBeenCalled();
    });

    test('showInvalidFeedback should display error messages', () => {
        avalynxForm.showInvalidFeedback('input1', 'Invalid input');
        const inputElement = form.querySelector('#input1');
        expect(inputElement.classList).toContain('is-invalid');
        const feedbackElement = inputElement.nextElementSibling;
        expect(feedbackElement.style.display).toBe('block');
        expect(feedbackElement.innerHTML).toBe('Invalid input');
    });

    test('clearInvalidFeedback should clear error messages', () => {
        avalynxForm.showInvalidFeedback('input1', 'Invalid input');
        avalynxForm.clearInvalidFeedback('input1');
        const inputElement = form.querySelector('#input1');
        expect(inputElement.classList).not.toContain('is-invalid');
        const feedbackElement = inputElement.nextElementSibling;
        expect(feedbackElement.style.display).toBe('none');
    });

    test('setupOverlayAndLoader should create overlay if loader is null', () => {
        const overlay = document.getElementById('test-form-overlay');
        expect(overlay).not.toBeNull();
        expect(overlay.style.display).toBe('none');
    });
});
