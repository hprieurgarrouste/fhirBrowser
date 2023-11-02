import template from "./templates/fhirHistory.html";

import { FhirService } from "./services/Fhir.js";

class FhirHistory extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
    }

    connectedCallback() {
        const main = this._shadow.querySelector('main');
        main.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const div = event.target.closest("div");
            if (div) {
                if (div.classList.contains('active')) return;
                this._shadow.getElementById('list').querySelectorAll('div[class~="active"]').forEach(n => n.classList.remove('active'));
                div.classList.add('active');
                location.hash = `#${this._resourceType}/${this._resourceId}/_history/${div.dataset.versionId}`;
            }
        });
    }

    clear() {
        const list = this._shadow.getElementById('list');
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    load(resourceType, resource) {
        this.hidden = true;
        if (!resourceType.interaction.find(({ code }) => 'vread' == code)) return;
        if (resourceType.type == this._resourceType && resource.id == this._resourceId && resource.meta.versionId == this._versionId) return;

        const list = this._shadow.getElementById('list');
        if (resourceType.type !== this._resourceType || resource.id !== this._resourceId) {
            this._resourceType = resourceType.type;
            this._resourceId = resource.id;
            this._versionId = resource.meta.versionId;
            while (list.firstChild) list.removeChild(list.lastChild);
            const historyEntry = document.createElement("template");
            historyEntry.innerHTML = `<div class="entry"><span class="number">4</span><span class="text"></span></div>`;
            FhirService.readHistory(resourceType.type, resource.id).then(response => {
                if ('Bundle' == response.resourceType && 'history' == response.type && response.total > 1) {
                    let n = response.total;
                    response.entry.forEach(element => {
                        const df = historyEntry.content.cloneNode(true);
                        const div = df.querySelector('div');
                        const vId = element.resource.meta.versionId;
                        div.dataset.versionId = vId;
                        if (this._versionId == vId) {
                            div.classList.add('active');
                        }
                        df.querySelector('span[class="number"]').textContent = n--;
                        const date = new Date(element.resource.meta.lastUpdated);
                        df.querySelector('span[class="text"]').innerHTML = `${date.toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        })} ${date.toLocaleString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short"
                        })}`;
                        list.appendChild(df);
                    });
                    this.hidden = false;
                }
            });
        } else {
            list.querySelectorAll('div').forEach(div => {
                if (resource.meta.versionId == div.dataset.versionId) {
                    div.classList.add('active');
                } else {
                    div.classList.remove('active');
                }
            });
            this.hidden = false;
        }
    }

};

customElements.define('fhir-history', FhirHistory)
