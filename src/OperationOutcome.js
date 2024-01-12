import template from "./templates/OperationOutcome.html";

import "./components/M2AppBar"
import "./components/M2RoundButton"

import context from "./services/Context"
import M2Card from "./components/M2Card";

export default class OperationOutcome extends HTMLElement {
    /** @type {HTMLElement} */
    #main;
    /** @type {HTMLElement} */
    #issue;
    /** @type {HTMLElement} */
    #text;
    /** @type {fhir4.OperationOutcome} */
    #operationOutcome;
    /** @enum {String} */
    #severityIcon = Object.freeze({
        'information': 'info',
        'warning': 'warning',
        'error': 'error',
        'fatal': 'dangerous'
    });

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this.#operationOutcome = null;

        shadow.getElementById('help').onclick = this.#helpClick;
        this.#main = shadow.querySelector('main');
        this.#issue = shadow.getElementById('issue');
        this.#text = shadow.getElementById('text');
    }

    #helpClick = () => {
        window.open(context.server.resourceHelpUrl(this.#operationOutcome.resourceType), "FhirBrowserHelp");
    }

    #clear = () => {
        this.#issue.innerHTML = "";
        this.#text.innerHTML = "";
        this.#main.style.cursor = "wait";
        this.#operationOutcome = null;
    }

    get resourceType() {
        return this.#operationOutcome.resourceType
    }
    get resourceId() {
        return null;
    }
    get source() {
        return this.#operationOutcome;
    }

    /** @param {fhir4.OperationOutcome} operationOutcome */
    set source(operationOutcome) {
        this.#clear();
        operationOutcome.issue.forEach(issue => {
            const diagnostics = document.createElement('p');
            diagnostics.innerText = issue.diagnostics;
            const card = new M2Card(
                this.#severityIcon[issue.severity] || 'error',
                issue.code,
                issue.severity
            );
            card.append(diagnostics);
            this.#issue.append(card);
        });
        this.#text.innerHTML = operationOutcome.text?.div || '';
        this.#main.style.cursor = "default";
        this.#operationOutcome = operationOutcome;
    }

};
customElements.define('fhir-operation-outcome', OperationOutcome);