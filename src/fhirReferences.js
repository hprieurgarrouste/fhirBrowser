import "./components/Chips.js"
import { FhirService } from "./services/Fhir.js";

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

            const main = this._shadow.querySelector('main')
            main.appendChild(document.createElement("populated-refs"));
            main.appendChild(document.createElement("empty-refs"));
            const populatedRefs = this._shadow.querySelector('populated-refs')
            const emptyRefs = this._shadow.querySelector('empty-refs')

            references.forEach(ref => {

                FhirService.searchCount(ref,[{"name":resourceType.type.toLowerCase(), "value":resourceId}]).then(({ total }) => {
                    this._count = total;
                    const chipCount = this._shadow.getElementById(ref).querySelector('chip-count');
                    chipCount.innerText = total;
                    if (total=="0") {
                        chipCount.parentElement.setAttribute("class", "disabled");
                    } else {
                        populatedRefs.appendChild(this._shadow.getElementById(ref))
                    }
                });

                let chipRef = document.createElement("app-chips");
                let chipCount = document.createElement("chip-count");
                let chipLabel = document.createElement("chip-label");

                chipRef.setAttribute("data-resource", ref);
                chipRef.setAttribute("id", ref);
                chipLabel.innerText=ref;
                chipCount.appendChild(document.createTextNode("⏳"));

                chipRef.appendChild(chipCount);
                chipRef.appendChild(chipLabel);

                emptyRefs.appendChild(chipRef);


            });
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main,container {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                flex-wrap: wrap;
                max-height: 5em;
                overflow-y: auto;
                padding: 0.5em;
                align-items: center;
            }
            container {
                padding: 0 0.5em;
            }

            main > * {
                cursor: pointer;
                display: flex;
                gap: inherit;
            }
            app-chips > * {
                margin: 0.2em;
            }
            .disabled {
                opacity: 0.5;
            }

        </style>

        <container>
        <span class="material-icons">link</span>
        <span>References:</span>
        <main></main>
        </container>


    `;

    window.customElements.define('fhir-references', FhirReferences);
})();