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
        this._release = null;
    }

    clear() {
        const list = this._shadow.getElementById("list");
        list.scrollTop = 0;
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    connectedCallback() {
        const list = this._shadow.getElementById('list');
        list.addEventListener("click", ({ target }) => {
            const row = target.closest("list-row-check");
            if (row?.getAttribute("selected") !== null) {
                row.removeAttribute("selected");
            } else {
                row.setAttribute("selected", "");
            }
        });

        this._shadow.querySelector('list-filter').onChange = ((value) => {
            const filter = value.toLowerCase();
            const list = this._shadow.getElementById('list');
            list.childNodes.forEach(row => {
                row.hidden = !(row.dataset.id.toLowerCase().includes(filter));
            });
        }).bind(this);

        this._shadow.getElementById("apply").addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const columns = [];
            this._shadow.querySelectorAll('list-row-check[selected]')?.forEach(r => columns.push(r.dataset.id));
            this.dispatchEvent(new CustomEvent("settingschanged", {
                bubbles: true,
                cancelable: false,
                "detail": {
                    "columns": columns
                }
            }));
        });

    }

    load(resourceType, selected) {
        if (resourceType === this._resourceType && FhirService.release === this._release) return;
        this._resourceType = resourceType;
        this._release = FhirService.release;

        this._shadow.querySelector('list-filter').clear();
        this.clear();

        this._shadow.querySelector('linear-progress').hidden = false;
        sdParse(resourceType, '').then((elements) => {
            const list = this._shadow.getElementById('list');
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
                list.appendChild(row);
            });
            this._shadow.querySelector('list-filter').hidden = (list.children.length <= 10);
            this._shadow.querySelector('linear-progress').hidden = true;
        });

        function sdParse(resourceType, path) {
            return new Promise((resolve) => {
                const elements = [];
                FhirService.structureDefinition(resourceType).then((structureDefinition) => {
                    const subPromises = [];
                    structureDefinition.snapshot.element
                        .filter(e => e.isSummary && e.type)
                        .forEach((element) => {
                            const elementName = element.path.substr(element.path.indexOf(".") + 1);
                            //avoid infinite loops
                            if (!path.includes(`${elementName}.`)) {
                                const newPath = (path ? `${path}.` : '') + elementName;
                                const type = element.type[0].code;
                                const isClass = type.match(/^([A-Z][a-z]+)+$/);
                                if (isClass) {
                                    subPromises.push(sdParse(type, newPath));
                                } else {
                                    elements.push({
                                        'id': newPath,
                                        'path': newPath,
                                        'short': element.short,
                                        'type': type
                                    });
                                }
                            }
                        });
                    if (subPromises.length > 0) {
                        Promise.all(subPromises).then((values) => {
                            values.forEach(value => elements.push(...value));
                            resolve(elements);
                        });
                    } else {
                        resolve(elements);
                    }
                });
            });
        }

    }
};
customElements.define('fhir-bundle-columns', FhirBundleColumns);
