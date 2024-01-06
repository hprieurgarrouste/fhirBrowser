import template from "./templates/ResourceJsonView.html";

import ResourceTemplateView from "./ResourceTemplateView"

import context from "./services/Context"
import preferencesService from "./services/Preferences"
import snackbarService from "./services/Snackbar"

export default class ResourceJsonView extends HTMLElement {
    /** @type {Fhir.resource} */
    #resource;
    /** @type {HTMLElement} */
    #content;
    /** @type {M2RoundButton} */
    #sortToggle;
    /** @type {M2RoundButton} */
    #templateToggle;
    /** @type {ResourceTemplateView} */
    #templateView;
    /** @type {Boolean} */
    #templateMode;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#resource = null;

        this.#content = shadow.getElementById("content");
        this.#content.onclick = this.#contentClick;

        this._preferences = preferencesService.get('jsonView', { 'sorted': false, 'template': false });

        this._sort = this._preferences.sorted;
        this.#sortToggle = shadow.getElementById('sort-toggle');
        this.#sortToggle.onclick = this.#sortToggleClick;

        this.#templateToggle = shadow.getElementById('template-toggle');
        if (true || window.matchMedia("(max-width: 480px)").matches) { //WIP not available yet
            this.#templateMode = false;
            this.#templateToggle.hidden = true;
        } else {
            this.#templateMode = this._preferences.template;
            this.#templateToggle.onclick = this.#templateToggleClick;
        }

        this.#templateView = shadow.querySelector('resource-template-view');

        shadow.getElementById('download').onclick = this.#downloadClick;
        shadow.getElementById('copy').onclick = this.#copyClick;
        shadow.getElementById('share').onclick = this.#shareClick;
    }

    connectedCallback() {
        this.#sortChange();
        this.#showTemplate();
    }

    #sortToggleClick = () => {
        this._sort = !this._sort;
        this._preferences.sorted = this._sort;
        preferencesService.set('jsonView', this._preferences);
        this.#sortChange();
    }

    #sortChange = () => {
        this.#sortToggle.style.color = this._sort ? 'var(--primary-color)' : 'unset';
        if (this.#resource) this.source = this.#resource;
    }

    #templateToggleClick = () => {
        this.#templateMode = !this.#templateMode;
        this._preferences.template = this.#templateMode;
        preferencesService.set('jsonView', this._preferences);

        this.#showTemplate();
    }

    #showTemplate = () => {
        this.#templateToggle.style.color = this.#templateMode ? 'var(--primary-color)' : 'unset';
        this.#content.hidden = this.#templateMode;
        this.#sortToggle.hidden = this.#templateMode;
        this.#templateView.hidden = !this.#templateMode;
    }

    #contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.classList.contains("array") || target.classList.contains("object")) {
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

    get resourceType() {
        return this.#resource.resourceType;
    }
    get resourceId() {
        return this.#resource.id;
    }
    get source() {
        return this.#resource;
    }

    /** @param {object} resource */
    set source(resource) {
        this.#content.scrollTo(0, 0);
        this.#content.innerHTML = "";
        this.#content.appendChild(document.createTextNode("{"));
        this.#content.appendChild(this.#parse(resource));
        this.#content.appendChild(document.createTextNode("}"));
        this.#content.style.cursor = "default";
        this.#resource = resource;
        this.#templateView.source = resource;
    }

    #parse = (obj) => {
        let dl = document.createElement('dl');

        let entries = Object.entries(obj);
        if (this._sort) entries = entries.sort();
        entries.forEach(([key, value]) => {
            const dt = document.createElement('dt');

            const keyElm = document.createElement('span');
            keyElm.className = "key";
            keyElm.innerText = key;
            dt.appendChild(keyElm);

            const valueElm = document.createElement('span');
            valueElm.classList.add("value");
            if (value === null) {
                valueElm.innerText = "null";
            } else if ("string" === typeof (value)) {
                valueElm.classList.add("string");
                if (key === "reference") {
                    let url = value.replace(`${context.server.url}`, '')
                    if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`;
                    let a = document.createElement('a');
                    a.setAttribute("href", `#${url}`);
                    a.appendChild(document.createTextNode(value));
                    valueElm.appendChild(a);
                } else {
                    valueElm.innerText = value;
                }
            } else if ("object" === typeof (value)) {
                dt.classList.add(Array.isArray(value) ? "array" : "object");
                valueElm.appendChild(this.#parse(value));
            } else {
                valueElm.innerText = value;
            }
            dt.appendChild(valueElm);

            dl.appendChild(dt);
        });
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
