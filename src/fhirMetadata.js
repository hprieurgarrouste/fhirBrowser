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
        window.addEventListener("hashchange", this.locationHandler);
    }

    locationHandler = async () => {
        let hash = window.location.hash.replace('#', '').trim();
        if (hash.length) {
            let resourceType = '';
            if (hash.indexOf('?') > 0) {
                resourceType = hash.split('?')[0];
            } else {
                resourceType = hash.split("/")[0];
            }
            this._shadow.getElementById("resourceTypes").value = resourceType;
        } else {
            this._shadow.getElementById("resourceTypes").value = null;
        }
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

    /**
    * @param {FhirMetadata} server
    */
    set server(server) {
        this._shadow.getElementById("serverTitle").setAttribute("data-primary", server.capabilities?.software?.name || server.serverCode);
        this._shadow.getElementById("serverTitle").setAttribute("data-secondary", server.capabilities?.implementation?.description || server.url);

        this._shadow.getElementById("resourceTypes").metadata = server.capabilities;
        this._shadow.getElementById("capability").metadata = server.capabilities;
        this.locationHandler();
    }

};
customElements.define('fhir-metadata', FhirMetadata)
