import template from "./templates/OperationOutcome.html";

import "./components/M2AppBar"
import "./components/M2Card"
import "./components/M2RoundButton"

import fhirService from "./services/Fhir"

class OperationOutcome extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._resource = null;

        shadow.getElementById('help').onclick = this.helpClick;
        this._main = shadow.querySelector('main');
        this._content = this._main.querySelector('main>section');
        this._issue = shadow.getElementById('issue');
        this._text = shadow.getElementById('text');
    }

    helpClick = () => {
        window.open(fhirService.helpUrl(this._resource.resourceType), "FhirBrowserHelp");
    }

    clear = () => {
        this._content.scrollTo(0, 0);
        this._issue.innerHTML = "";
        this._text.innerHTML = "";
        this._main.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource.resourceType
    }
    get resourceId() {
        return null;
    }
    get source() {
        return this._resource;
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        const severityIcon = {
            'information': 'info',
            'warning': 'warning',
            'error': 'error',
            'fatal': 'dangerous'
        }
        this.clear();
        resource.issue.forEach(issue => {
            const diagnostics = document.createElement('p');
            diagnostics.innerText = issue.diagnostics;
            const card = document.createElement('m2-card');
            card.setAttribute('data-icon', severityIcon[issue.severity] || 'error');
            card.setAttribute('data-primary', issue.code);
            card.setAttribute('data-secondary', issue.severity);
            card.appendChild(diagnostics);
            this._issue.appendChild(card);
        });
        this._text.innerHTML = resource.text?.div || '';
        this._main.style.cursor = "default";
        this._resource = resource;
    }

};
customElements.define('fhir-operation-outcome', OperationOutcome);
