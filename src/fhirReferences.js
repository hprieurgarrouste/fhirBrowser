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
            const main = this._shadow.querySelector('main')
            main.appendChild(document.createElement("populated-refs"));
            main.appendChild(document.createElement("empty-refs"));
            const populatedRefs = this._shadow.querySelector('populated-refs')
            const emptyRefs = this._shadow.querySelector('empty-refs')
            const countList = []
            references.forEach(ref => {
                let chipRef = document.createElement("app-chips");
                let chipIcon = document.createElement("chip-icon");
                let chipCount = document.createElement("badge");
                let chipLabel = document.createElement("chip-label");
                chipRef.setAttribute("data-resource", ref);
                chipRef.setAttribute("id", ref);
                chipIcon.setAttribute("class", 'material-symbols');
                chipIcon.innerText = FhirService.fhirIconSet[ref.toLowerCase()]?FhirService.fhirIconSet[ref.toLowerCase()]:'';
                chipLabel.innerText=ref;
                chipCount.innerHTML = "<circular-progress></circular-progress>"
                chipRef.appendChild(chipIcon);
                chipRef.appendChild(chipLabel);
                chipRef.appendChild(chipCount);
                emptyRefs.appendChild(chipRef);
                countList.push({
                    'ref':ref,
                    'resourceType': resourceType.type,
                    'resourceId': resourceId,
                    'element': chipCount
                })
            });

            const myPromise = args =>
                AsyncService.sleep(1000).then(() => {
                    FhirService.searchCount(args.ref,[{"name":args.resourceType.toLowerCase(), "value":resourceId}]).then(({ total }) => {
                        this._count = (total == undefined) ? "?" : total.toLocaleString();
                        if (this._count=="0") {
                            args.element.parentElement.setAttribute("class", "disabled");
                        } else {
                            populatedRefs.appendChild(this._shadow.getElementById(args.ref))
                        }
                    }).catch((e) => {
                        populatedRefs.appendChild(this._shadow.getElementById(args.ref))
                        this._count = "🥶"
                    }).finally( () => {
                        args.element.innerText = this._count;
                    });
                })
            AsyncService.forEachSeries(countList, myPromise)
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
                #max-height: 5em;
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
                flex-wrap: wrap;
                gap: inherit;
            }

            .disabled {
                opacity: 0.5;
            }

            badge {
                display: flex;
                margin-left: auto;
                order: 2;
                border-radius: 1em;
                background-color: var(--primary-color);
                color: rgb(255, 255, 255);
                padding: 0 0.5em;
                font-size: 0.8em;
            }
            badge.error {
                background-color: var(--background-error);
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