import template from "./templates/fhirResourceXml.html";

class FhirResourceXml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    clear() {
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
        const serializer = new XMLSerializer();
        content.scrollTo(0, 0);
        content.innerText = serializer.serializeToString(resource);
        content.style.cursor = "default";
    }
};
customElements.define('fhir-resource-xml', FhirResourceXml);
