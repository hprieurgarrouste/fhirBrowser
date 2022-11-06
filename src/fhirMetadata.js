import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceTypes.js";
import "./fhirServerDetails.js";

customElements.define('fhir-metadata', class FhirMetadata extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirMetadataTemplate.content.cloneNode(true));
        this._metadata = null;
    }

    connectedCallback() {
        this._shadow.querySelector("tab-bar").addEventListener('click', ({ detail }) => {
            const tabId = detail.tabId;
            if (tabId === "tabResources") {
                this._shadow.getElementById("resourceTypes").classList.remove("hidden");
            } else {
                this._shadow.getElementById("resourceTypes").classList.add("hidden");
            }
        });
        this._shadow.getElementById("resourceTypes").addEventListener('resourceTypeSelected', ({ detail }) => {
            this.dispatchEvent(new CustomEvent("resourceTypeSelected", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    "resourceType": detail.resourceType
                }
            }));
        });
    }

    /**
    * @param {FhirMetadata} metadata
    */
    set metadata(metadata) {
        this._shadow.getElementById("resourceTypes").metadata = metadata;
        this._shadow.getElementById("serverDetails").metadata = metadata;
    }

});

const FhirMetadataTemplate = document.createElement('template');
FhirMetadataTemplate.innerHTML = `
    <style>
        main {
            display:flex;
            flex-direction: column;
            height : 100%;
        }
        tab-bar {
            border-bottom:1px solid var(--border-color, gray);
        }
        #resourceTypes, #serverDetails {
            flex: auto;
            overflow: auto;
            height: 100%;
            min-width: 100%;
            transition: all 0.3s;
        }
        #tabsBody {
            display:flex;
            flex-direction:row;
            flex: auto;
            height: 0;
            overflow:hidden;
        }
        #resourceTypes.hidden {
            margin-left: -100%;
            transition: all 0.3s;
        }
    </style>
    <main>
        <tab-bar>
            <app-tab id="tabResources" selected>Resource Types</app-tab>
            <app-tab id="tabDetails">Details</app-tab>
        </tab-bar>
        <div id="tabsBody">
            <fhir-resource-types id="resourceTypes"></fhir-resource-types>
            <fhir-server-details id="serverDetails"></fhir-server-details>
        </div>
    </main>
`;