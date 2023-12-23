import template from "./templates/ResourceTtlView.html";

class ResourceTtlView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resource = null;
    }
    clear = () => {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "Loading...";
        content.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource.match(/rdf:type\s+fhir:(\w+)/)[1];
    }
    get resourceId() {
        return this._resource.match(/fhir:Resource.id\s+\[\s+fhir:value\s+"([^"]+)"\s+\];/)[1];
    }
    get source() {
        return this._resource;
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerText = resource;
        content.style.cursor = "default";
        this._resource = resource;
    }
};
customElements.define('resource-ttl-view', ResourceTtlView);
