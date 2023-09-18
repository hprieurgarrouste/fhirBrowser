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
            const main = this._shadow.querySelector('main');
            while (main.firstChild) main.removeChild(main.lastChild);
        }

        load(references, resourceType, resourceId) {
            this.clear();
            const main = this._shadow.querySelector('main');
            references.forEach(ref => {
                let chip = document.createElement("app-chips");
                chip.setAttribute("data-icon", FhirService.ResourceIcon(ref));
                chip.setAttribute("data-text", ref);
                chip.setAttribute("data-resource", ref);
                main.appendChild(chip);
            });
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                max-height: 8em;
                overflow-y: auto;
                padding: 0.5em;
                flex-wrap: wrap;
            }

            main > * {
                cursor: pointer;
            }

            .disabled {
                opacity: 0.5;
            }
        </style>

        <main></main>
    `;

    window.customElements.define('fhir-references', FhirReferences);
})();