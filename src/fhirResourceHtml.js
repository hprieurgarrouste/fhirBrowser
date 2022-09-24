import Mustache from "mustache";

customElements.define('fhir-resource-html', class FhirResourceHtml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #wrapper {
                    display:flex;
                    flex-direction:column;
                    height:100%;
                    padding: 1em;
                }
            </style>
            <div id="wrapper">

            </div>
        `;
    }
    connectedCallback() {

    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        //this._shadow.getElementById('wrapper').innerHTML = Mustache.render("id: {{id}}", resource);
        this._shadow.getElementById('wrapper').innerHTML = "<i>Work in progress : Mustache template</i>"
    }
});
