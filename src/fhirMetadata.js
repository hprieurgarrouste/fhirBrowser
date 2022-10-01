import "./appTab.js";
import "./appTabs.js";
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
        this._shadow.getElementById("tabs").addEventListener('click', ({ detail }) => {
            const tabId = detail.tabId;
            this._shadow.getElementById("resourceTypes").hidden = (tabId !== 'tabResources');
            this._shadow.getElementById("serverDetails").hidden = (tabId !== 'tabDetails');
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
        #wrapper {
            display:flex;
            flex-direction: column;
            height : 100%;
        }
        #tabs {
            border-bottom:1px solid var(--border-color, gray);
        }
        #resourceTypes, #serverDetails {
            flex:1 1 auto;
            overflow: auto;
            height:0;
        }
    </style>
    <div id="wrapper">
        <app-tabs id="tabs">
            <app-tab id="tabResources" selected>Resource Types</app-tab>
            <app-tab id="tabDetails">Details</app-tab>
        </app-tabs>
        <fhir-resource-types id="resourceTypes"></fhir-resource-types>
        <fhir-server-details id="serverDetails" hidden></fhir-server-details>
    </div>
`;
