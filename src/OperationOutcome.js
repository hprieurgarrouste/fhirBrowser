import template from "./templates/OperationOutcome.html";

import "./components/AppBar"
import "./components/AppCard"
import "./components/RoundButton"

import { FhirService } from "./services/Fhir"

class OperationOutcome extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resource = null;

        this._shadow.getElementById('help').onclick = this.helpClick;
        this._main = this._shadow.querySelector('main');
        this._content = this._main.querySelector('main>section');
        this._issue = this._shadow.getElementById('issue');
        this._text = this._shadow.getElementById('text');
    }

    helpClick = () => {
        window.open(FhirService.helpUrl(this._resource.resourceType), "FhirBrowserHelp");
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
            const card = document.createElement('app-card');
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
