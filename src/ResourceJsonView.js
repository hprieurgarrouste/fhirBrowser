import template from "./templates/ResourceJsonView.html";

import "./components/AppSwitch"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"

class ResourceJsonView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._sorted = false;
        this._resource = null;
    }

    connectedCallback() {
        this._shadow.getElementById("content").onclick = this.contentClick;
        this._sorted = PreferencesService.get('jsonView', { 'sorted': true }).sorted;
        const sortedSwitch = this._shadow.querySelector('app-switch');
        this._shadow.querySelector('app-switch').onclick = this.sortedClickHandler;
        if (this._sorted) {
            sortedSwitch.setAttribute('data-checked', '');
        } else {
            sortedSwitch.removeAttribute('data-checked');
        }
    }

    sortedClickHandler = (event) => {
        this._sorted = this._shadow.querySelector('app-switch').hasAttribute('data-checked');
        PreferencesService.set('jsonView', { 'sorted': this._sorted });
        this.source = this._resource;
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
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "Loading...";
        content.style.cursor = "wait";
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "";
        content.appendChild(document.createTextNode("{"));
        content.appendChild(this.parse(resource));
        content.appendChild(document.createTextNode("}"));
        content.style.cursor = "default";
        this._resource = resource;
    }

    parse = (obj) => {
        let dl = document.createElement('dl');

        let entries = Object.entries(obj);
        if (this._sorted) entries = entries.sort();
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
                    let url = value;
                    if (url.startsWith(FhirService.server.url)) {
                        url = url.slice(FhirService.server.url.length + 1);
                    }
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

};
customElements.define('resource-json-view', ResourceJsonView);
