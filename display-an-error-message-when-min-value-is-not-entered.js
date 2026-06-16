(function () {
    const FORM_ID = 5; //provide your form ID
    const FIELD_NAME = 'custom-payment-amount';
    const MIN_AMOUNT = 20;
    const ERROR_MESSAGE = 'Minimum value is $20.00';

    function getForm() {
        return document.querySelector('form[data-form_id="' + FORM_ID + '"], form.fluent_form_' + FORM_ID + ', #fluentform_' + FORM_ID);
    }

    function getInput() {
        const form = getForm();
        return form ? form.querySelector('input[name="' + FIELD_NAME + '"]') : null;
    }

    function parseAmount(value) {
        value = String(value || '').replace(/,/g, '').replace(/[^\d.]/g, '');
        return parseFloat(value);
    }

    function prepareInput(input) {
        if (!input) return;

        input.setAttribute('data-ff-original-min', MIN_AMOUNT);
        input.removeAttribute('min');
        input.removeAttribute('aria-valuemin');
    }

    function showError(input) {
        const group = input.closest('.ff-el-group');
        const content = input.closest('.ff-el-input--content') || group;

        if (!group || !content) return;

        group.classList.add('ff-el-is-error');
        input.setAttribute('aria-invalid', 'true');

        content.querySelectorAll('.ff-custom-payment-min-error').forEach(el => el.remove());

        const error = document.createElement('div');
        error.className = 'error text-danger ff-custom-payment-min-error';
        error.setAttribute('role', 'alert');
        error.textContent = ERROR_MESSAGE;

        content.appendChild(error);
    }

    function clearError(input) {
        const group = input.closest('.ff-el-group');
        const content = input.closest('.ff-el-input--content') || group;

        if (group) {
            group.classList.remove('ff-el-is-error');
        }

        input.setAttribute('aria-invalid', 'false');

        if (content) {
            content.querySelectorAll('.ff-custom-payment-min-error').forEach(el => el.remove());
        }
    }

    function validate() {
        const input = getInput();

        if (!input) return true;

        prepareInput(input);

        const rawValue = input.value;

        if (rawValue === '') {
            clearError(input);
            return true;
        }

        const amount = parseAmount(rawValue);

        if (isNaN(amount) || amount < MIN_AMOUNT) {
            showError(input);
            return false;
        }

        clearError(input);
        return true;
    }

    function init() {
        const input = getInput();

        if (!input || input.dataset.ffCustomMinReady === 'yes') return;

        prepareInput(input);

        input.dataset.ffCustomMinReady = 'yes';

        input.addEventListener('input', validate);
        input.addEventListener('keyup', validate);
        input.addEventListener('blur', validate);
    }

    // Stop Fluent Forms payment JS from changing value to min on change event
    document.addEventListener('change', function (e) {
        if (e.target && e.target.name === FIELD_NAME) {
            prepareInput(e.target);
            validate();
        }
    }, true);

    // Block submit button click
    document.addEventListener('click', function (e) {
        const form = getForm();

        if (!form || !e.target.closest('button[type="submit"], input[type="submit"]')) {
            return;
        }

        if (!validate()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            getInput().focus();
        }
    }, true);

    // Block form submit
    document.addEventListener('submit', function (e) {
        const form = getForm();

        if (!form || e.target !== form) return;

        if (!validate()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            getInput().focus();
        }
    }, true);

    document.addEventListener('DOMContentLoaded', init);

    if (window.jQuery) {
        jQuery(document).on('fluentform_init fluentform_init_single ff_reinit', function () {
            setTimeout(init, 50);
        });
    }

    setTimeout(init, 300);
    setTimeout(init, 1000);
})();
