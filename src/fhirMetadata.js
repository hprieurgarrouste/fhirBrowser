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
        this._shadow.querySelector("fhir-resource-types").addEventListener('resourceTypeSelected', ({ detail }) => {
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
        this._shadow.querySelector("fhir-resource-types").metadata = metadata;
        this._shadow.querySelector("fhir-server-details").metadata = metadata;
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
            flex: auto;
            height: 0;
        }
    </style>
    <main>
        <tab-bar>
            <fhir-resource-types data-tab="Resource Types"></fhir-resource-types>
            <fhir-server-details data-tab="Details"></fhir-server-details>
        </tab-bar>
    </main>
`;
