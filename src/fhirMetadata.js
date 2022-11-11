import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceTypes.js";
import "./fhirServerDetails.js";

(function () {
    class FhirMetadata extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._metadata = null;
        }

        connectedCallback() {
            this._shadow.querySelector("tab-bar").addEventListener('click', ({ detail }) => {
                this._shadow.getElementById(detail.tab.dataset.target).scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? "auto" : "smooth",
                    block: "start",
                    inline: "start"
                });
            });
        }

        clear() {
            this._shadow.getElementById("resourceTypes").clear();
            this._shadow.getElementById("serverDetails").clear();
        }
        select(resourceType) {
            this._shadow.getElementById("resourceTypes").value = resourceType;
        }

        /**
        * @param {FhirMetadata} metadata
        */
        set metadata(metadata) {
            this.clear();
            this._shadow.getElementById("resourceTypes").metadata = metadata;
            this._shadow.getElementById("serverDetails").metadata = metadata;
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                display:flex;
                flex-direction: column;
                height : 100%;
                overflow:hidden;
                position:relative;
            }
            tab-bar {
                border-bottom:1px solid var(--border-color, gray);
            }
            #tabsBody {
                flex: auto;
                height: 0;
                overflow: hidden;
                position: relative;
                block-size: 100%;
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 100%;
                grid-auto-rows: 100%;
            }
        </style>
        <main>
            <tab-bar>
                <app-tab id="tabResources" data-target="resourceTypes" selected>Resource Types</app-tab>
                <app-tab id="tabDetails" data-target="serverDetails">Details</app-tab>
            </tab-bar>
            <div id="tabsBody">
                <fhir-resource-types id="resourceTypes"></fhir-resource-types>
                <fhir-server-details id="serverDetails"></fhir-server-details>
            </div>
        </main>
    `;

    window.customElements.define('fhir-metadata', FhirMetadata);
})();