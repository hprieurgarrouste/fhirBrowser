import template from "./templates/ResourceJsonView.html"

import M2RoundButton from "./components/M2RoundButton"
import ResourceTemplateView from "./ResourceTemplateView"

import context from "./services/Context"
import preferencesService from "./services/Preferences"
import snackbarService from "./services/Snackbar"

export default class ResourceJsonView extends HTMLElement {
    /** @type {fhir4.Resource} */
    #resource;
    /** @type {HTMLElement} */
    #content;
    /** @type {M2RoundButton} */
    #sortToggle;
    /** @type {ResourceTemplateView} */
    #templateView;
    /** @type {M2RoundButton} */
    #modeToggleRaw;
    /** @type {M2RoundButton} */
    #modeToggleObject;
    /** @type {M2RoundButton} */
    #modeToggleTemplate;
    /**
     * @type {Object}
     * @property {(raw|enhanced|template)} mode
     */
    #preferences;
    #MODE = {
        raw: 'raw',
        object: 'oject',
        template: 'template'
    };

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#resource = null;

        this.#content = shadow.getElementById("content");
        this.#content.onclick = this.#contentClick;

        this.#preferences = preferencesService.get('jsonView', { 'mode': this.#MODE.object });

        this.#sortToggle = shadow.getElementById('sort-toggle');
        this.#sortToggle.onclick = this.#sortToggleClick;
        this.#sortChange();

        this.#modeToggleRaw = shadow.getElementById('mode-toggle-raw');
        this.#modeToggleRaw.onclick = this.#modeToggleClick;

        this.#modeToggleObject = shadow.getElementById('mode-toggle-object');
        this.#modeToggleObject.onclick = this.#modeToggleClick;

        this.#modeToggleTemplate = shadow.getElementById('mode-toggle-template');
        this.#modeToggleTemplate.onclick = this.#modeToggleClick;

        if (true || window.matchMedia("(max-width: 480px)").matches) { //WIP not available yet
            this.#preferences.templateMode = false;
            this.#modeToggleTemplate.hidden = true;
        }
        this.#templateView = shadow.querySelector('resource-template-view');

        shadow.getElementById('download').onclick = this.#downloadClick;
        shadow.getElementById('copy').onclick = this.#copyClick;
        shadow.getElementById('share').onclick = this.#shareClick;
    }

    connectedCallback() {
        this.#modeChange();
    }

    #modeToggleClick = (event) => {
        switch (event.target) {
            case this.#modeToggleRaw:
                this.#preferences.mode = this.#MODE.raw;
                break;
            case this.#modeToggleObject:
                this.#preferences.mode = this.#MODE.object;
                break;
            case this.#modeToggleTemplate:
                this.#preferences.mode = this.#MODE.template;
                break;
        }
        preferencesService.set('jsonView', this.#preferences);
        this.#modeChange();
    }

    #modeChange = () => {
        switch (this.#preferences.mode) {
            case this.#MODE.raw:
                this.#modeToggleRaw.style.color = 'var(--primary-color';
                this.#modeToggleObject.style.color = 'unset';
                this.#modeToggleTemplate.style.color = 'unset';
                this.#content.hidden = false;
                this.#templateView.hidden = true;
                this.#sortToggle.hidden = true;
                break;
            case this.#MODE.object:
                this.#modeToggleRaw.style.color = 'unset';
                this.#modeToggleObject.style.color = 'var(--primary-color';
                this.#modeToggleTemplate.style.color = 'unset';
                this.#content.hidden = false;
                this.#templateView.hidden = true;
                this.#sortToggle.hidden = false;
                break;
            case this.#MODE.template:
                this.#modeToggleRaw.style.color = 'unset';
                this.#modeToggleObject.style.color = 'unset';
                this.#modeToggleTemplate.style.color = 'var(--primary-color';
                this.#content.hidden = true;
                this.#templateView.hidden = false;
                this.#sortToggle.hidden = true;
                break;
        }
        if (this.#resource) this.source = this.#resource;
    }

    #sortToggleClick = () => {
        this.#preferences.sortMode = !this.#preferences.sortMode;
        preferencesService.set('jsonView', this.#preferences);
        this.#sortChange();
    }

    #sortChange = () => {
        this.#sortToggle.style.color = this.#preferences.sortMode ? 'var(--primary-color)' : 'unset';
        if (this.#resource) this.source = this.#resource;
    }

    #contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.querySelector("span.value.array") || target.querySelector("span.value.object")) {
            const key = target.childNodes[0];
            if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                target.classList.toggle("collapsed");
                if (ctrlKey) {
                    const collapsed = target.classList.contains("collapsed");
                    Array.from(target.querySelectorAll('dt'))
                        .filter(e => e.classList.contains('object') || e.classList.contains('array'))
                        .forEach(e => {
                            if (collapsed) {
                                e.classList.add("collapsed");
                            } else {
                                e.classList.remove("collapsed");
                            }
                        });
                }

            }
        }
    };

    clear = () => {
        this.#content.scrollTo(0, 0);
        this.#content.innerHTML = "Loading...";
        this.#content.style.cursor = "wait";
        this.#resource = null;
    }

    /** @returns {string} */
    get resourceType() {
        return this.#resource.resourceType;
    }
    /** @returns {string} */
    get resourceId() {
        return this.#resource.id;
    }
    /** @returns {fhir4.Resource} */
    get source() {
        return this.#resource;
    }

    /** @param {fhir4.Resource} resource */
    set source(resource) {
        const definition = context.server.schema.getRefByResourceType(resource.resourceType);
        this.#content.scrollTo(0, 0);
        this.#content.innerHTML = "";
        if (this.#MODE.raw == this.#preferences.mode) {
            const pre = document.createElement('pre');
            pre.classList.add('raw');
            pre.innerText = JSON.stringify(resource, null, 4);
            this.#content.append(pre);
        } else {
            this.#content.append('{', this.#makeObjectElm(resource, definition), '}');
        }
        this.#content.style.cursor = "default";
        this.#resource = resource;
        this.#templateView.source = resource;
    }

    /**
     * @param {object} ob
     * @param {string} definitionRef
     **/
    #makeObjectElm = (obj, definitionRef) => {
        const definition = context.server.schema.getDefinitionByRef(definitionRef);
        let entries = Object.entries(obj);
        if (this.#preferences.sortMode) entries = entries.sort();

        let dl = document.createElement('dl');
        dl.append(...entries.map(([key, value]) => {
            let valueElm;
            if ('#/definitions/Reference' == definitionRef && 'reference' == key) {
                valueElm = this.#makeReferenceValueElm(value);
            } else {
                const property = definition.properties[key];
                if ('#/definitions/instant' == property['$ref']) {
                    valueElm = this.#makeInstantValueElm(value);
                } else {
                    valueElm = this.#makeValueElm(value, definition.properties[key]);
                }
            }
            const dt = document.createElement('dt');
            dt.append(this.#makeKeyElm(key), valueElm);
            return dt;
        }));
        return dl;
    }

    #makeInstantValueElm = (value) => {
        const valueElm = document.createElement('span');
        valueElm.classList.add('value', 'instant');
        valueElm.append(format(value));
        return valueElm;

        function format(value) {
            const dateOptions = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            };
            const timeOptions = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short"
            }
            const date = new Date(value);
            try {
                return `${date.toLocaleString(undefined, dateOptions)} ${date.toLocaleString(undefined, timeOptions)}`;
            } catch (e) {
                return value;
            }
        }
    }

    #makeReferenceValueElm = (value) => {
        const valueElm = document.createElement('span');
        valueElm.classList.add('value', 'string');
        valueElm.append(format(value));
        return valueElm;

        function format(value) {
            let url = value.replace(`${context.server.url}`, '')
            if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`;
            const a = document.createElement('a');
            a.setAttribute("href", `#${url}`);
            a.append(value);
            return a;
        }
    }

    /** @param {string} key */
    #makeKeyElm = (key) => {
        const keyElm = document.createElement('span');
        keyElm.className = "key";
        keyElm.innerText = key;
        return keyElm;
    }

    /**
     * @param {any} value
     * @param {object} property
     */
    #makeValueElm = (value, property) => {
        const valueElm = document.createElement('span');
        valueElm.classList.add("value");
        if (value === null) {
            valueElm.append('null');
        } else if (property.const) {
            valueElm.classList.add('const');
            valueElm.append(value);
        } else if (property.enum) {
            valueElm.classList.add('enum');
            valueElm.append(value);
        } else if (property['$ref']) {
            const propRef = property['$ref'];
            const propDefinition = context.server.schema.getDefinitionByRef(propRef);
            const propType = propRef.split('/').at(-1);
            if (propDefinition.properties) {
                valueElm.classList.add('object', propType);
                valueElm.append(this.#makeObjectElm(value, propRef));
            } else {
                valueElm.classList.add(propType);
                valueElm.append(value);
            }
        } else if (property.type) {
            if ('array' == property.type) {
                const propType = property.items['$ref'].split('/').at(-1);
                valueElm.classList.add('array', propType);
                valueElm.append(this.#makeArrayElm(value, property.items));
            } else {
                valueElm.classList.add(property.type);
                valueElm.append(value);
            }
        }

        return valueElm;
    }

    /**
     * @param {array} array
     * @param {object} ref
     */
    #makeArrayElm = (array, ref) => {
        let dl = document.createElement('dl');
        dl.append(...array.map((value, index) => {
            const dt = document.createElement('dt');
            dt.append(
                this.#makeKeyElm(index),
                this.#makeValueElm(value, ref)
            );
            return dt;
        }));
        return dl;
    }

    #downloadClick = () => {
        const content = JSON.stringify(this.#resource);
        const file = new File([content], this.resourceId, {
            'type': 'data:text/json;charset=utf-8'
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resourceType}#${file.name}.json`;
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    #copyClick = () => {
        const content = JSON.stringify(this.#resource);
        navigator.clipboard.writeText(content).then(function () {
            snackbarService.show("Copying to clipboard was successful");
        }, function (err) {
            snackbarService.error("Could not copy text");
        });
    };

    #shareClick = () => {
        const content = JSON.stringify(this.#resource);
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };

};

customElements.define('resource-json-view', ResourceJsonView);
