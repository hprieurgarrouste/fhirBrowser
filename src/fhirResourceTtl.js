import template from "./templates/fhirResourceTtl.html";

class FhirResourceTtl extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    clear = () => {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "Loading...";
        content.style.cursor = "wait";
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerText = resource;
        content.style.cursor = "default";
    }
};
customElements.define('fhir-resource-ttl', FhirResourceTtl);
