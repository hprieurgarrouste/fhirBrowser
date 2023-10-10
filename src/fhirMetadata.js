import template from "./templates/fhirMetadata.html";

import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceTypes.js";
import "./fhirCapability.js";

class FhirMetadata extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
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
        this._shadow.getElementById("serverTitle").setAttribute("data-primary", "");
        this._shadow.getElementById("serverTitle").setAttribute("data-secondary", "");

        this._shadow.getElementById("resourceTypes").clear();
        this._shadow.getElementById("capability").clear();
    }
    select(resourceType) {
        this._shadow.getElementById("resourceTypes").value = resourceType;
    }

    /**
    * @param {FhirMetadata} metadata
    */
    set server(server) {
        this.clear();
        this._shadow.getElementById("serverTitle").setAttribute("data-primary", server.serverCode);
        this._shadow.getElementById("serverTitle").setAttribute("data-secondary", server.url);

        this._shadow.getElementById("resourceTypes").metadata = server.capabilities;
        this._shadow.getElementById("capability").metadata = server.capabilities;
    }

};
customElements.define('fhir-metadata', FhirMetadata)
