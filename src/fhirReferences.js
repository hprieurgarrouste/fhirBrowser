import "./components/Chips.js"
import { FhirService } from "./services/Fhir.js";
import { AsyncService } from "./services/Async.js";

(function () {
    class FhirReferences extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._resourceType = null;
        }

        connectedCallback() {
            const main = this._shadow.querySelector('main');
            main.addEventListener("click", ({ target }) => {
                const chip = target.closest("app-chips");
                if (chip) {
                    this.dispatchEvent(new CustomEvent("referenceClick", {
                        bubbles: false,
                        cancelable: false,
                        'detail': {
                            'resourceType': chip.dataset.resource
                        }
                    }));
                }
            });
        }

        clear() {
            const list = this._shadow.getElementById('list');
            while (list.firstChild) list.removeChild(list.lastChild);
        }

        load(references, resourceType, resourceId) {
            this.clear();
            const list = this._shadow.getElementById('list');
            references.forEach(ref => {
                let chip = document.createElement("app-chips");
                chip.setAttribute("data-icon", FhirService.ResourceIcon(ref));
                chip.setAttribute("data-text", ref);
                chip.setAttribute("data-resource", ref);
                list.appendChild(chip);
            });
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                display: flex;
                flex-direction: column;
                gap: 0.5em;
                padding: 0.5em;
            }
            #list {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 0.5em;
                max-height: 8em;
                overflow-y: auto;
            }
            #list > * {
                cursor: pointer;
            }
            #title {
                font-weight: bold;
            }
        </style>
        <main>
            <section id="title">References</section>
            <section id="list"></section>
        </main>
    `;

    window.customElements.define('fhir-references', FhirReferences);
})();