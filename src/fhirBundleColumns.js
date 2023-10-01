import template from "./templates/fhirBundleColumns.html";

import "./components/LinearProgress.js";
import "./components/ListItem.js";
import "./components/ListRowCheck.js";

import { FhirService } from "./services/Fhir.js";
import { PreferencesService } from "./services/Preferences.js";

class FhirBundleColumns extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
    }

    clear() {
        const content = this._shadow.getElementById("content");
        content.scrollTop = 0;
        while (content.firstChild) content.removeChild(content.lastChild);
    }

    connectedCallback() {
        const nav = this._shadow.getElementById('content');
        nav.addEventListener("click", ({ target }) => {
            const row = target.closest("list-row-check");
            if (row?.getAttribute("selected") !== null) {
                row.removeAttribute("selected");
            } else {
                row.setAttribute("selected", "");
            }
        });

        this._shadow.getElementById("apply").addEventListener("click", (event) => {
            const columns = [];
            this._shadow.querySelectorAll('list-row-check[selected]')?.forEach(r => columns.push(r.dataset.id));
            event.preventDefault();
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent("settingschanged", {
                bubbles: true,
                cancelable: false,
                "detail": {
                    "columns": columns
                }
            }));
        });

    }

    load(resourceType) {
        if (resourceType === this._resourceType) return;

        const pref = PreferencesService.get("columns", {});
        const selected = pref[resourceType] || ["id", "meta.lastUpdated"];
        this.clear();
        const elements = [];
        const types = {};

        function sdLoad(resourceType) {
            return new Promise((resolve) => {
                let elms = [];
                if (types[resourceType]) {
                    resolve(elms);
                } else {
                    FhirService.structureDefinition(resourceType).then(structureDefinition => {
                        types[resourceType] = structureDefinition;
                        structureDefinition.snapshot.element
                            .filter(e => e.isSummary)
                            .forEach((element) => {
                                elms.push(element);
                            });
                        resolve(elms);
                    });
                }
            })
        }
        async function sdParse(resourceType, prefix = '') {
            const elms = await sdLoad(resourceType);
            for (const elm of elms) {
                if (elm.type) {
                    const type = elm.type[0].code;
                    const isClass = type.match(/^([A-Z][a-z]+)+$/);
                    if (isClass) {
                        const newPrefix = elm.path.substr(elm.path.indexOf(".") + 1);
                        await sdParse(type, newPrefix);
                    } else {
                        const path = (prefix ? `${prefix}.` : '') + elm.path.substr(elm.path.indexOf(".") + 1);
                        elements.push({
                            'id': path,
                            'path': path,
                            'short': elm.short
                        });
                    }
                }
            }
        }

        this._shadow.querySelector('linear-progress').hidden = false;
        sdParse(resourceType).then(() => {
            const nav = this._shadow.getElementById('content');
            this._shadow.querySelector('linear-progress').hidden = true;
            elements.sort((e1, e2) => e1.path.localeCompare(e2.path));
            elements.forEach(element => {
                const item = document.createElement('list-item');
                item.setAttribute("data-primary", element.path);
                item.setAttribute("data-secondary", element.short);
                const row = document.createElement('list-row-check');
                row.setAttribute("data-id", element.id);
                if (selected.includes(element.id))
                    row.setAttribute("selected", "");
                row.appendChild(item);
                nav.appendChild(row);
            });
        });

    }
};
customElements.define('fhir-bundle-columns', FhirBundleColumns);
