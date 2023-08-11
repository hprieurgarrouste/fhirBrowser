import "./components/RoundButton.js"
import "./components/ListItem.js"
import "./components/ListRowCheck.js"
import { FhirService } from "./services/Fhir.js";
import { PreferencesService } from "./services/Preferences.js";

(function () {
    class FhirBundleColumns extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._resourceType = null;
            this._columns = [];
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
                    this._columns.splice(target.dataset.order, 1);
                } else {
                    row.setAttribute("selected", "");
                    this._columns.push(target.dataset.id);
                    target.dataset.order = this._columns.indexOf(target.dataset.id);
                }
            });


            nav.addEventListener('orderChanged', ({detail}) => {
                const r2 = this._shadow.querySelectorAll('list-row-check[data-order="'+detail.newValue+'"]')
                const r1 = this._shadow.querySelectorAll('list-row-check[data-id="'+detail.what+'"]')
                r2?.forEach(r => {
                    r.setAttribute('data-order', detail.oldValue)
                    r1[0].setAttribute('data-order', detail.newValue)
                });
                [this._columns[r1[0].dataset.order], this._columns[r2[0].dataset.order]] = [this._columns[r2[0].dataset.order], this._columns[r1[0].dataset.order]]
            });

            this._shadow.getElementById("apply").addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.dispatchEvent(new CustomEvent("settingschanged", {
                    bubbles: true,
                    cancelable: false,
                    "detail": {
                        "columns": this._columns
                    }
                }));
            });

        }

        load(resourceType) {
            if (resourceType === this._resourceType) return;

            const pref = PreferencesService.get("columns", {});
            const selected = pref[resourceType] || ["id", "meta.lastUpdated"];
            this._columns = selected;
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
                        const order = (selected.indexOf(element.id)>=0)?selected.indexOf(element.id):undefined;
                        if (order>=0) {row.setAttribute("data-order", order);}
                    row.appendChild(item);
                    nav.appendChild(row);
                });
            });

        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                display:flex;
                flex-direction: column;
                height: 100%;
            }
            #content {
                overflow: auto;
                flex: 1 1 auto;
                height: 0;
            }
            #content > * {
                cursor: pointer;
            }
            #actions {
                border-top: 1px solid var(--border-color);
                padding: 0.5em 1em;
                text-align: center;
                overflow: hidden;
            }
            #actions input[type=button] {
                background: none;
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                color: var(--primary-color);
                cursor: pointer;
                font: inherit;
                padding: 5px 16px;
                text-transform: uppercase;
            }
            #actions input[type=button]:hover {
                background-color: var(--hover-color);
            }
        </style>
        <main>
            <linear-progress></linear-progress>
            <section id="content"></section>
            <section id="actions">
                <input type="button" id="apply" value="Apply"></input>
            <section>
        </main>
    `;

    window.customElements.define('fhir-bundle-columns', FhirBundleColumns);
})();