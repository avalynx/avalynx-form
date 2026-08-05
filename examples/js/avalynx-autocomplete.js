/**
 * AvalynxAutocomplete
 *
 * AvalynxAutocomplete is a lightweight, customizable autocomplete component for web applications. It is designed to be used with Bootstrap version 5.3 or higher and does not require any framework dependencies.
 *
 * @version 1.0.5
 * @license MIT
 * @author https://github.com/avalynx/avalynx-autocomplete/graphs/contributors
 * @website https://github.com/avalynx/
 * @repository https://github.com/avalynx/avalynx-autocomplete.git
 * @bugs https://github.com/avalynx/avalynx-autocomplete/issues
 *
 * @param {string} selector - The selector for the input elements (default: '.avalynx-autocomplete').
 * @param {object} options - An object containing the following keys:
 * @param {string} options.className - Additional CSS classes for the dropdown (default: '').
 * @param {number} options.maxItems - Maximum number of results displayed in the dropdown (default: 5).
 * @param {number} options.maxSelections - Maximum number of selectable items. If > 1, multi-select mode is activated (default: 1).
 * @param {number} options.minLength - Minimum number of characters to start the search (default: 1).
 * @param {number} options.debounce - Delay in milliseconds after the last keystroke (default: 300).
 * @param {boolean} options.caseSensitive - Case-sensitive search (default: false).
 * @param {boolean} options.disabled - Initialize in a disabled state (default: false).
 * @param {string|null} options.defaultValue - Default value (label) upon initialization (default: null).
 * @param {string|null} options.defaultKey - Default key upon initialization (default: null).
 * @param {array|null} options.defaultSelections - Array of objects {key, value} for multi-select default values (default: null).
 * @param {string} options.tagsPosition - Position of tags in multi-select ('above' | 'inline') (default: 'above').
 * @param {string} options.clearStyle - Style of the clear button ('button' | 'icon') (default: 'button').
 * @param {array|null} options.data - Static array of data objects {key, value} (default: null).
 * @param {function} options.fetchData - Asynchronous function for fetching data (default: null).
 * @param {boolean} options.allowCreate - Allows creating new entries from the current input value (default: false).
 * @param {string} options.createShortcut - Keyboard shortcut used to create a new entry (default: 'Enter').
 * @param {function} options.createItem - Maps the typed text to a {key, value} object when a new entry is created (default: null).
 * @param {function} options.onChange - Callback on selection change (default: null).
 * @param {function} options.onClear - Callback when the field is cleared (default: null).
 * @param {function} options.onLoaded - Callback after component initialization (default: null).
 *
 * @param {object} language - An object containing the following keys:
 * @param {string} language.placeholder - Placeholder text for the input field (default: 'Search...').
 * @param {string} language.noResults - Text when no results are found (default: 'No results found').
 * @param {function} language.createOption - Formatter for the create action label (value, shortcut) => string (default: Create "{value}" ({shortcut})).
 * @param {string} language.clearTitle - Title attribute for the clear button (default: 'Clear selection').
 * @param {string} language.removeTitle - Title attribute for removing a tag (default: 'Remove').
 *
 */

class AvalynxAutocomplete {
    constructor(selector, options = {}, language = {}) {
        if (!selector) selector = '.avalynx-autocomplete';
        if (!selector.startsWith('.') && !selector.startsWith('#')) selector = '.' + selector;

        this.elements = document.querySelectorAll(selector);
        if (this.elements.length === 0) {
            console.error("AvalynxAutocomplete: Element(s) with selector '" + selector + "' not found");
            return;
        }

        this.options = {
            className: '',
            maxItems: 5,
            maxSelections: 1,
            minLength: 1,
            debounce: 300,
            caseSensitive: false,
            disabled: false,
            defaultValue: null,
            defaultKey: null,
            defaultSelections: null,
            tagsPosition: 'above',
            clearStyle: 'button',
            data: null,
            fetchData: null,
            allowCreate: false,
            createShortcut: 'Enter',
            createItem: null,
            onChange: null,
            onClear: null,
            onLoaded: null,
            ...options
        };

        this.language = {
            placeholder: 'Search...',
            noResults: 'No results found',
            createOption: (value, shortcut) => `Create "${value}"${shortcut ? ` (${shortcut})` : ''}`,
            clearTitle: 'Clear selection',
            removeTitle: 'Remove',
            ...language
        };

        this.createShortcut = this.normalizeCreateShortcut(this.options.createShortcut);
        this.instances = [];
        this.initialized = false;
        this.elements.forEach(input => this.init(input));
        this.initialized = true;
        if (this.options.onLoaded) this.options.onLoaded();
    }

    init(input) {
        const instance = {
            input: input,
            hiddenInput: null,
            dropdown: null,
            clearBtn: null,
            clearIcon: null,
            wrapper: null,
            tagsContainer: null,
            inputContainer: null,
            inputWrapper: null,
            debounceTimer: null,
            isSelected: false,
            selections: [],
            createdItems: []
        };
        this.createElements(instance);
        this.bindEvents(instance);
        this.setInitialValue(instance);
        if (this.options.disabled || input.disabled) this.disableInstance(instance);
        this.instances.push(instance);
    }

    createElements(instance) {
        const input = instance.input;
        const isMulti = this.options.maxSelections > 1;
        const isInline = this.options.tagsPosition === 'inline';
        const isIconStyle = this.options.clearStyle === 'icon';

        const wrapper = document.createElement('div');
        wrapper.classList.add('avalynx-autocomplete-wrapper', 'position-relative');
        input.parentNode.insertBefore(wrapper, input);

        if (isMulti && !isInline) {
            const tagsContainer = document.createElement('div');
            tagsContainer.classList.add('avalynx-autocomplete-tags', 'd-flex', 'flex-wrap', 'gap-1', 'mb-2');
            wrapper.appendChild(tagsContainer);
            instance.tagsContainer = tagsContainer;
        }

        const inputGroup = document.createElement('div');
        inputGroup.classList.add(isIconStyle ? 'position-relative' : 'input-group');
        wrapper.appendChild(inputGroup);

        if (isMulti && isInline) {
            const inputContainer = document.createElement('div');
            inputContainer.classList.add(
                'form-control', 'd-flex', 'flex-wrap', 'align-items-center',
                'gap-1', 'h-auto', 'py-1', 'avalynx-autocomplete-input-container'
            );
            if (isIconStyle) {
                inputContainer.classList.add('avalynx-autocomplete-container-with-icon');
            }
            inputContainer.style.cursor = 'text';
            inputGroup.appendChild(inputContainer);

            const tagsContainer = document.createElement('span');
            tagsContainer.classList.add('d-flex', 'flex-wrap', 'gap-1', 'align-items-center');
            inputContainer.appendChild(tagsContainer);
            instance.tagsContainer = tagsContainer;

            input.classList.add('avalynx-autocomplete-inline-input', 'flex-grow-1');
            inputContainer.appendChild(input);

            inputContainer.addEventListener('click', (e) => {
                if (e.target === inputContainer || e.target === tagsContainer) {
                    input.focus();
                }
            });

            instance.inputContainer = inputContainer;
        } else {
            input.classList.add('form-control');
            if (isIconStyle) {
                input.classList.add('avalynx-autocomplete-input-with-icon');
            }
            inputGroup.appendChild(input);
        }

        instance.inputWrapper = inputGroup;
        input.setAttribute('autocomplete', 'off');
        input.placeholder = input.placeholder || this.language.placeholder;

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = input.dataset.keyName || (input.name ? input.name + '_key' : 'avalynx_autocomplete_key');
        inputGroup.appendChild(hiddenInput);
        instance.hiddenInput = hiddenInput;

        if (isIconStyle) {
            const clearIcon = document.createElement('span');
            clearIcon.classList.add('avalynx-autocomplete-clear-icon', 'd-none');
            clearIcon.innerHTML = '&times;';
            clearIcon.title = this.language.clearTitle;
            inputGroup.appendChild(clearIcon);
            instance.clearIcon = clearIcon;
        } else {
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.classList.add('btn', 'btn-outline-secondary', 'd-none');
            clearBtn.innerHTML = '&times;';
            clearBtn.title = this.language.clearTitle;
            inputGroup.appendChild(clearBtn);
            instance.clearBtn = clearBtn;
        }

        const dropdown = document.createElement('ul');
        dropdown.classList.add('avalynx-autocomplete-dropdown', 'list-group', 'position-absolute', 'w-100', 'd-none', 'shadow-sm');
        dropdown.style.zIndex = '1050';
        dropdown.style.maxHeight = '250px';
        dropdown.style.overflowY = 'auto';
        if (this.options.className) this.options.className.split(' ').forEach(cls => dropdown.classList.add(cls));
        wrapper.appendChild(dropdown);

        instance.dropdown = dropdown;
        instance.wrapper = wrapper;
    }

    bindEvents(instance) {
        const { input, dropdown, clearBtn, clearIcon } = instance;

        input.addEventListener('input', () => {
            if (instance.debounceTimer) clearTimeout(instance.debounceTimer);
            instance.debounceTimer = setTimeout(() => this.handleInput(instance), this.options.debounce);
        });

        input.addEventListener('focus', () => {
            if (!instance.isSelected && input.value.length >= this.options.minLength) {
                this.handleInput(instance);
            }
        });

        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.avalynx-autocomplete-item');
            if (item && item.dataset.key) {
                this.selectItem(instance, item.dataset.key, item.dataset.value);
                return;
            }

            const createItem = e.target.closest('.avalynx-autocomplete-create-item');
            if (createItem) {
                this.createSelectionFromInput(instance);
            }
        });

        const clearElement = clearBtn || clearIcon;
        if (clearElement) {
            clearElement.addEventListener('click', () => this.clearSelection(instance));
        }

        document.addEventListener('click', (e) => {
            if (!instance.wrapper.contains(e.target)) this.hideDropdown(instance);
        });
        input.addEventListener('keydown', (e) => this.handleKeydown(e, instance));
    }

    async handleInput(instance) {
        const query = instance.input.value.trim();
        if (instance.isSelected) return;
        if (query.length < this.options.minLength) {
            this.hideDropdown(instance);
            return;
        }
        const results = await this.search(query, instance);
        this.renderDropdown(instance, results, query);
    }

    async search(query, instance) {
        let results = [];
        const createdItems = this.filterMatchingItems(instance.createdItems, query);

        if (this.options.fetchData) {
            try {
                results = await this.options.fetchData(query);
            } catch (error) {
                console.error('AvalynxAutocomplete: fetchData error', error);
                return [];
            }
        } else if (this.options.data && Array.isArray(this.options.data)) {
            results = this.filterMatchingItems(this.options.data, query);
        }

        results = this.mergeUniqueItems([...createdItems, ...results]);

        if (this.options.maxSelections > 1) {
            const selectedKeys = instance.selections.map(s => s.key);
            results = results.filter(item => !selectedKeys.includes(item.key));
        }

        return results.slice(0, this.options.maxItems);
    }

    formatCreateShortcutLabel() {
        if (!this.createShortcut) return '';

        const parts = [];
        if (this.createShortcut.modKey) {
            parts.push('Ctrl/Cmd');
        } else {
            if (this.createShortcut.ctrlKey) parts.push('Ctrl');
            if (this.createShortcut.metaKey) parts.push('Cmd');
        }
        if (this.createShortcut.altKey) parts.push('Alt');
        if (this.createShortcut.shiftKey) parts.push('Shift');
        parts.push(this.createShortcut.key.length === 1
            ? this.createShortcut.key.toUpperCase()
            : this.createShortcut.key.charAt(0).toUpperCase() + this.createShortcut.key.slice(1));

        return parts.join('+');
    }

    shouldShowCreateOption(instance, query, results) {
        if (!this.options.allowCreate || query.trim() === '') return false;

        const existingItem = this.getExistingItemByValue(instance, query);
        if (existingItem) {
            if (this.options.maxSelections > 1) {
                return !instance.selections.some(selection => selection.key === existingItem.key);
            }
            return false;
        }

        return !results.some(item => {
            const itemValue = this.options.caseSensitive ? item.value : item.value.toLowerCase();
            const queryValue = this.options.caseSensitive ? query : query.toLowerCase();
            return itemValue === queryValue;
        });
    }

    renderDropdown(instance, results, query = '') {
        const { dropdown } = instance;
        dropdown.innerHTML = '';
        const showCreateOption = this.shouldShowCreateOption(instance, query, results);

        if (results.length === 0) {
            const noResults = document.createElement('li');
            noResults.classList.add('list-group-item', 'text-muted', 'small');
            noResults.textContent = this.language.noResults;
            dropdown.appendChild(noResults);
        } else {
            results.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'list-group-item-action', 'avalynx-autocomplete-item');
                li.setAttribute('role', 'button');
                li.dataset.key = item.key;
                li.dataset.value = item.value;
                li.dataset.index = index;
                li.textContent = item.value;
                dropdown.appendChild(li);
            });
        }

        if (showCreateOption) {
            const createOption = document.createElement('li');
            createOption.classList.add(
                'list-group-item',
                'list-group-item-action',
                'avalynx-autocomplete-create-item',
                'text-primary'
            );
            createOption.setAttribute('role', 'button');
            createOption.textContent = this.language.createOption(query, this.formatCreateShortcutLabel());
            dropdown.appendChild(createOption);
        }

        dropdown.classList.remove('d-none');
    }

    hideDropdown(instance) {
        instance.dropdown.classList.add('d-none');
    }

    showClearElement(instance) {
        const el = instance.clearBtn || instance.clearIcon;
        if (el) el.classList.remove('d-none');
    }

    hideClearElement(instance) {
        const el = instance.clearBtn || instance.clearIcon;
        if (el) el.classList.add('d-none');
    }

    selectItem(instance, key, value) {
        const { input, hiddenInput } = instance;
        const isMulti = this.options.maxSelections > 1;

        if (isMulti) {
            if (instance.selections.length >= this.options.maxSelections) return;

            instance.selections.push({ key, value });
            this.renderTags(instance);
            this.updateHiddenInput(instance);

            input.value = '';
            this.showClearElement(instance);

            if (instance.selections.length >= this.options.maxSelections) {
                input.disabled = true;
                input.placeholder = '';
            }
        } else {
            input.value = value;
            hiddenInput.value = key;
            input.readOnly = true;
            input.classList.add('bg-light');
            instance.isSelected = true;
            this.showClearElement(instance);
        }

        this.hideDropdown(instance);

        if (this.initialized && this.options.onChange) {
            const returnValue = isMulti ? [...instance.selections] : { key, value };
            this.options.onChange(isMulti ? instance.selections.map(s => s.key) : key, returnValue);
        }
    }

    renderTags(instance) {
        const { tagsContainer, input } = instance;
        if (!tagsContainer) return;

        const isInline = this.options.tagsPosition === 'inline';

        tagsContainer.innerHTML = '';
        instance.selections.forEach((selection, index) => {
            const tag = document.createElement('span');
            tag.classList.add('badge', 'bg-primary', 'd-inline-flex', 'align-items-center');

            if (isInline) {
                tag.style.fontSize = '0.8rem';
                tag.style.padding = '0.35em 0.5em';
            } else {
                tag.classList.add('gap-1');
                tag.style.fontSize = '0.875rem';
                tag.style.padding = '0.5em 0.75em';
            }

            const textSpan = document.createElement('span');
            textSpan.textContent = selection.value;
            tag.appendChild(textSpan);

            const removeBtn = document.createElement('span');
            removeBtn.setAttribute('role', 'button');
            removeBtn.classList.add('ms-1');
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.opacity = '0.7';
            removeBtn.style.fontWeight = 'bold';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = this.language.removeTitle;
            removeBtn.dataset.index = index;

            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSelection(instance, index);
            });

            removeBtn.addEventListener('mouseenter', () => removeBtn.style.opacity = '1');
            removeBtn.addEventListener('mouseleave', () => removeBtn.style.opacity = '0.7');

            tag.appendChild(removeBtn);
            tagsContainer.appendChild(tag);
        });
    }

    removeSelection(instance, index) {
        instance.selections.splice(index, 1);
        this.renderTags(instance);
        this.updateHiddenInput(instance);

        instance.input.disabled = false;
        instance.input.placeholder = this.language.placeholder;

        if (instance.selections.length === 0) {
            this.hideClearElement(instance);
        }

        if (this.initialized && this.options.onChange) {
            this.options.onChange(
                instance.selections.map(s => s.key),
                [...instance.selections]
            );
        }
    }

    updateHiddenInput(instance) {
        if (this.options.maxSelections > 1) {
            instance.hiddenInput.value = JSON.stringify(instance.selections.map(s => s.key));
        }
    }

    clearSelection(instance) {
        const { input, hiddenInput, tagsContainer } = instance;
        const isMulti = this.options.maxSelections > 1;

        if (isMulti) {
            instance.selections = [];
            if (tagsContainer) tagsContainer.innerHTML = '';
            input.disabled = false;
            input.placeholder = this.language.placeholder;
        } else {
            input.readOnly = false;
            input.classList.remove('bg-light');
            instance.isSelected = false;
        }

        input.value = '';
        hiddenInput.value = '';
        this.hideClearElement(instance);
        input.focus();

        if (this.initialized && this.options.onClear) this.options.onClear();
    }

    normalizeCreateShortcut(shortcut) {
        if (typeof shortcut !== 'string' || shortcut.trim() === '') {
            console.error('AvalynxAutocomplete: createShortcut must be a non-empty string');
            return null;
        }

        const parts = shortcut.split('+').map(part => part.trim().toLowerCase()).filter(Boolean);
        const key = parts.pop();

        if (!key) {
            console.error('AvalynxAutocomplete: createShortcut must include a key');
            return null;
        }

        const normalized = {
            key,
            modKey: false,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false
        };

        for (const modifier of parts) {
            switch (modifier) {
                case 'ctrl':
                case 'control':
                    normalized.ctrlKey = true;
                    break;
                case 'mod':
                    normalized.modKey = true;
                    break;
                case 'alt':
                    normalized.altKey = true;
                    break;
                case 'shift':
                    normalized.shiftKey = true;
                    break;
                case 'meta':
                case 'cmd':
                case 'command':
                    normalized.metaKey = true;
                    break;
                default:
                    console.error(`AvalynxAutocomplete: Unsupported createShortcut modifier '${modifier}'`);
                    return null;
            }
        }

        return normalized;
    }

    matchesCreateShortcut(e) {
        if (!this.options.allowCreate || !this.createShortcut) return false;

        const ctrlKey = !!e.ctrlKey;
        const metaKey = !!e.metaKey;
        const primaryModifierMatches = this.createShortcut.modKey
            ? (ctrlKey || metaKey)
            : ctrlKey === this.createShortcut.ctrlKey && metaKey === this.createShortcut.metaKey;

        return e.key.toLowerCase() === this.createShortcut.key &&
            primaryModifierMatches &&
            !!e.altKey === this.createShortcut.altKey &&
            !!e.shiftKey === this.createShortcut.shiftKey &&
            (!this.createShortcut.modKey || (!this.createShortcut.ctrlKey && !this.createShortcut.metaKey));
    }

    filterMatchingItems(items, query) {
        if (!Array.isArray(items)) return [];

        const searchTerm = this.options.caseSensitive ? query : query.toLowerCase();
        return items.filter(item => {
            if (!item || typeof item.value !== 'string') return false;
            const value = this.options.caseSensitive ? item.value : item.value.toLowerCase();
            return value.includes(searchTerm);
        });
    }

    mergeUniqueItems(items) {
        const seenKeys = new Set();

        return items.filter(item => {
            if (!item || item.key == null || item.value == null) return false;
            if (seenKeys.has(item.key)) return false;
            seenKeys.add(item.key);
            return true;
        });
    }

    getExistingItemByValue(instance, value) {
        const normalizedValue = this.options.caseSensitive ? value : value.toLowerCase();

        return this.mergeUniqueItems([
            ...instance.createdItems,
            ...(Array.isArray(this.options.data) ? this.options.data : [])
        ]).find(item => {
            const itemValue = this.options.caseSensitive ? item.value : item.value.toLowerCase();
            return itemValue === normalizedValue;
        });
    }

    createSelectionFromInput(instance) {
        const rawValue = instance.input.value.trim();
        if (!rawValue) return false;

        const existingItem = this.getExistingItemByValue(instance, rawValue);
        if (existingItem) {
            if (this.options.maxSelections > 1 && instance.selections.some(selection => selection.key === existingItem.key)) {
                this.hideDropdown(instance);
                instance.input.value = '';
                return false;
            }

            this.selectItem(instance, existingItem.key, existingItem.value);
            return true;
        }

        const createdItem = this.options.createItem
            ? this.options.createItem(rawValue, instance)
            : { key: rawValue, value: rawValue };

        if (!createdItem || createdItem.key == null || createdItem.value == null) {
            console.error('AvalynxAutocomplete: createItem must return an object with key and value');
            return false;
        }

        const normalizedItem = {
            key: String(createdItem.key),
            value: String(createdItem.value)
        };

        if (!instance.createdItems.some(item => item.key === normalizedItem.key)) {
            instance.createdItems.push(normalizedItem);
        }

        this.selectItem(instance, normalizedItem.key, normalizedItem.value);
        return true;
    }

    handleKeydown(e, instance) {
        const { dropdown } = instance;
        const items = dropdown.querySelectorAll('.avalynx-autocomplete-item');
        const activeItem = dropdown.querySelector('.avalynx-autocomplete-item.active');
        let activeIndex = activeItem ? parseInt(activeItem.dataset.index) : -1;
        const usesPlainEnterShortcut = this.createShortcut &&
            this.createShortcut.key === 'enter' &&
            !this.createShortcut.modKey &&
            !this.createShortcut.ctrlKey &&
            !this.createShortcut.altKey &&
            !this.createShortcut.shiftKey &&
            !this.createShortcut.metaKey;

        if (this.matchesCreateShortcut(e) && instance.input.value.trim() !== '') {
            if (!activeItem || !usesPlainEnterShortcut) {
                e.preventDefault();
                this.createSelectionFromInput(instance);
                return;
            }
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (dropdown.classList.contains('d-none')) return;
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                this.setActiveItem(items, activeIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (dropdown.classList.contains('d-none')) return;
                activeIndex = Math.max(activeIndex - 1, 0);
                this.setActiveItem(items, activeIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeItem && activeItem.dataset.key) {
                    this.selectItem(instance, activeItem.dataset.key, activeItem.dataset.value);
                }
                break;
            case 'Escape':
                this.hideDropdown(instance);
                break;
            case 'Backspace':
                if (this.options.tagsPosition === 'inline' &&
                    this.options.maxSelections > 1 &&
                    instance.input.value === '' &&
                    instance.selections.length > 0) {
                    this.removeSelection(instance, instance.selections.length - 1);
                }
                break;
        }
    }

    setActiveItem(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
            if (i === index) item.scrollIntoView({ block: 'nearest' });
        });
    }

    setInitialValue(instance) {
        const isMulti = this.options.maxSelections > 1;

        if (isMulti && this.options.defaultSelections && Array.isArray(this.options.defaultSelections)) {
            this.options.defaultSelections.forEach(item => {
                if (item.key && item.value) {
                    this.selectItem(instance, item.key, item.value);
                }
            });
        } else {
            const key = this.options.defaultKey || instance.input.dataset.defaultKey;
            const value = this.options.defaultValue || instance.input.dataset.defaultValue;
            if (key && value) this.selectItem(instance, key, value);
        }
    }

    disableInstance(instance) {
        instance.input.disabled = true;
        const clearEl = instance.clearBtn || instance.clearIcon;
        if (clearEl) {
            if (instance.clearBtn) instance.clearBtn.disabled = true;
            if (instance.clearIcon) instance.clearIcon.style.pointerEvents = 'none';
        }
        if (instance.inputContainer) {
            instance.inputContainer.style.backgroundColor = '#e9ecef';
            instance.inputContainer.style.cursor = 'not-allowed';
        }
    }

    enableInstance(instance) {
        instance.input.disabled = false;
        const clearEl = instance.clearBtn || instance.clearIcon;
        if (clearEl) {
            if (instance.clearBtn) instance.clearBtn.disabled = false;
            if (instance.clearIcon) instance.clearIcon.style.pointerEvents = '';
        }
        if (instance.inputContainer) {
            instance.inputContainer.style.backgroundColor = '';
            instance.inputContainer.style.cursor = 'text';
        }
    }

    disable() { this.instances.forEach(i => this.disableInstance(i)); }
    enable() { this.instances.forEach(i => this.enableInstance(i)); }
    clear() { this.instances.forEach(i => this.clearSelection(i)); }

    get value() {
        return this.instances.map(i => {
            if (this.options.maxSelections > 1) return i.selections;
            return { key: i.hiddenInput.value, value: i.input.value };
        });
    }

    set value(values) {
        if (!Array.isArray(values)) return;
        this.instances.forEach((instance, idx) => {
            const val = values[idx];
            if (this.options.maxSelections > 1 && Array.isArray(val)) {
                instance.selections = [];
                val.forEach(v => {
                    if (v && v.key && v.value) this.selectItem(instance, v.key, v.value);
                });
            } else if (val && val.key && val.value) {
                this.selectItem(instance, val.key, val.value);
            } else {
                this.clearSelection(instance);
            }
        });
    }

    get key() {
        return this.instances.map(i => {
            if (this.options.maxSelections > 1) return i.selections.map(s => s.key);
            return i.hiddenInput.value;
        });
    }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvalynxAutocomplete;
}
