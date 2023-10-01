import template from "./templates/fhirBrowserAbout.html";


class FhirBrowserAbout extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
}
customElements.define('fhir-browser-about', FhirBrowserAbout);
