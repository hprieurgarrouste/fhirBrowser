import template from "./templates/fhirHistory.html";

import { FhirService } from "./services/Fhir.js";

class FhirHistory extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._versionId = null;
    }

    connectedCallback() {
        this._shadow.getElementById('help').addEventListener('click', this.helpClick);

        this._shadow.getElementById('list').addEventListener("click", this.listClick);

        this._shadow.querySelector('side-panel').onClose = this.sidePanelClose;
    }

    listClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target.closest("list-row");
        if (item) {
            if (item.hasAttribute('selected')) return;
            this._shadow.querySelector("list-row[selected]")?.removeAttribute("selected");
            item.setAttribute("selected", "")
            location.hash = `#${this._resourceType}/${this._resourceId}/_history/${item.dataset.versionid}`;
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    helpClick = (event) => {
        window.open(`https://hl7.org/fhir/${FhirService.release}/http.html#history`, "FhirBrowserHelp");
        event.preventDefault();
        event.stopPropagation();
    }

    sidePanelClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    clear() {
        const list = this._shadow.getElementById('list');
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    load(resourceType, resource) {
        if (!resourceType.interaction.find(({ code }) => 'vread' == code)) return;
        if (resourceType.type == this._resourceType && resource.id == this._resourceId && resource.meta?.versionId == this._versionId) return;

        const list = this._shadow.getElementById('list');
        if (resourceType.type !== this._resourceType || resource.id !== this._resourceId) {
            this._resourceType = resourceType.type;
            this._resourceId = resource.id;
            this._versionId = resource.meta?.versionId;
            this.clear();
            FhirService.readHistory(resourceType.type, resource.id).then(response => {
                if ('Bundle' == response.resourceType && 'history' == response.type && response.total > 1) {
                    response.entry.sort((e1, e2) => {
                        const d1 = new Date(e1.resource.meta.lastUpdated);
                        const d2 = new Date(e2.resource.meta.lastUpdated);
                        return d2 - d1;
                    }).forEach(element => {
                        const row = document.createElement('list-row');
                        row.setAttribute("data-versionid", element.resource.meta.versionId);
                        if (this._versionId == element.resource.meta.versionId) {
                            row.setAttribute("selected", "");
                        }
                        const date = new Date(element.resource.meta.lastUpdated);
                        const item = document.createElement('list-item');
                        item.setAttribute("data-icon", "line_end_circle");
                        item.setAttribute("data-primary", `${date.toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        })}`);
                        item.setAttribute("data-secondary", `${date.toLocaleString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short"
                        })}`);
                        row.appendChild(item);
                        list.appendChild(row);
                    });
                    return true;
                }
            });
        } else {
            this._shadow.querySelector("list-row[selected]")?.removeAttribute("selected");
            this._shadow.querySelector(`list-row[data-versionid="${resource.meta.versionId}"]`)?.setAttribute("selected", "");
        }
        return false;
    }
};

customElements.define('fhir-history', FhirHistory)
