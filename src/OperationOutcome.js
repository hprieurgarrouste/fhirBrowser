import template from "./templates/OperationOutcome.html";

import "./components/M2AppBar"
import "./components/M2RoundButton"

import context from "./services/Context"
import M2Card from "./components/M2Card";

export default class OperationOutcome extends HTMLElement {
    /** @type {HTMLElement} */
    #main;
    /** @type {HTMLElement} */
    #content;
    /** @type {HTMLElement} */
    #issue;
    /** @type {HTMLElement} */
    #text;
    /** @type {any} */
    #resource;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this.#resource = null;

        shadow.getElementById('help').onclick = this.#helpClick;
        this.#main = shadow.querySelector('main');
        this.#content = this.#main.querySelector('main>section');
        this.#issue = shadow.getElementById('issue');
        this.#text = shadow.getElementById('text');
    }

    #helpClick = () => {
        window.open(context.server.resourceHelpUrl(this.#resource.resourceType), "FhirBrowserHelp");
    }

    #clear = () => {
        this.#content.scrollTo(0, 0);
        this.#issue.innerHTML = "";
        this.#text.innerHTML = "";
        this.#main.style.cursor = "wait";
        this.#resource = null;
    }

    get resourceType() {
        return this.#resource.resourceType
    }
    get resourceId() {
        return null;
    }
    get source() {
        return this.#resource;
    }

    /** @param {Fhir.OperationOutcome} resource */
    set source(resource) {
        const severityIcon = {
            'information': 'info',
            'warning': 'warning',
            'error': 'error',
            'fatal': 'dangerous'
        }
        this.#clear();
        resource.issue.forEach(issue => {
            const diagnostics = document.createElement('p');
            diagnostics.innerText = issue.diagnostics;
            const card = new M2Card();
            card.setAttribute('data-icon', severityIcon[issue.severity] || 'error');
            card.setAttribute('data-primary', issue.code);
            card.setAttribute('data-secondary', issue.severity);
            card.appendChild(diagnostics);
            this.#issue.appendChild(card);
        });
        this.#text.innerHTML = resource.text?.div || '';
        this.#main.style.cursor = "default";
        this.#resource = resource;
    }

};
customElements.define('fhir-operation-outcome', OperationOutcome);
