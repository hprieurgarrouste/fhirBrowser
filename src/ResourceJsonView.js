import template from "./templates/ResourceJsonView.html";

import "./components/AppSwitch"
import "./ResourceTemplateView"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SnackbarsService } from "./services/Snackbars"

class ResourceJsonView extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._resource = null;

        this._content = shadow.getElementById("content");
        this._content.onclick = this.contentClick;

        this._preferences = PreferencesService.get('jsonView', { 'sorted': false, 'template': false });

        this._sort = this._preferences.sorted;
        this._sortToggle = shadow.getElementById('sort-toggle');
        this._sortToggle.onclick = this.sortToggleClick;

        this._templateToggle = shadow.getElementById('template-toggle');
        if (true || window.matchMedia("(max-width: 480px)").matches) { //WIP not available yet
            this._template = false;
            this._templateToggle.hidden = true;
        } else {
            this._template = this._preferences.template;
            this._templateToggle.onclick = this.templateToggleClick;
        }
        this._templateView = shadow.querySelector('resource-template-view');

        shadow.getElementById('download').onclick = this.downloadClick;
        shadow.getElementById('copy').onclick = this.copyClick;
        shadow.getElementById('share').onclick = this.shareClick;
    }

    connectedCallback() {
        this.sortChange();
        this.showTemplate();
    }

    sortToggleClick = () => {
        this._sort = !this._sort;
        this._preferences.sorted = this._sort;
        PreferencesService.set('jsonView', this._preferences);
        this.sortChange();
    }

    sortChange = () => {
        this._sortToggle.style.color = this._sort ? 'var(--primary-color)' : 'unset';
        if (this._resource) this.source = this._resource;
    }

    templateToggleClick = () => {
        this._template = !this._template;
        this._preferences.template = this._template;
        PreferencesService.set('jsonView', this._preferences);

        this.showTemplate();
    }

    showTemplate = () => {
        this._templateToggle.style.color = this._template ? 'var(--primary-color)' : 'unset';
        this._templateView.hidden = !this._template;
        this._content.hidden = this._template;
        this._sortToggle.style.visibility = this._template ? 'hidden' : 'visible';
    }

    contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
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
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "Loading...";
        this._content.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource.resourceType;
    }
    get resourceId() {
        return this._resource.id;
    }
    get source() {
        return this._resource;
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "";
        this._content.appendChild(document.createTextNode("{"));
        this._content.appendChild(this.parse(resource));
        this._content.appendChild(document.createTextNode("}"));
        this._content.style.cursor = "default";
        this._resource = resource;
        this._templateView.source = resource;
    }

    parse = (obj) => {
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
                    let url = value.replace(`${FhirService.server.url}`, '')
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
                valueElm.appendChild(this.parse(value));
            } else {
                valueElm.innerText = value;
            }
            dt.appendChild(valueElm);

            dl.appendChild(dt);
        });
        return dl;
    }

    downloadClick = () => {
        const content = JSON.stringify(this._resource);
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

    copyClick = () => {
        const content = JSON.stringify(this._resource);
        navigator.clipboard.writeText(content).then(function () {
            SnackbarsService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarsService.error("Could not copy text");
        });
    };

    shareClick = () => {
        const content = JSON.stringify(this._resource);
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };

};
customElements.define('resource-json-view', ResourceJsonView);
