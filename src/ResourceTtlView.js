import template from "./templates/ResourceTtlView.html";

import { SnackbarsService } from "./services/Snackbars"

class ResourceTtlView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resource = null;

        this._shadow.getElementById('download').onclick = this.downloadClick;

        this._shadow.getElementById('copy').onclick = this.copyClick;

        this._shadow.getElementById('share').onclick = this.shareClick;
    }
    clear = () => {
        const content = this._shadow.getElementById("content");
        content.scrollTo(0, 0);
        content.innerHTML = "Loading...";
        content.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource.match(/rdf:type\s*fhir:(\w+)/)[1];
    }
    get resourceId() {
        return this._resource.match(/fhir:Resource.id\s*\[\s*fhir:value\s*"([^"]+)"\s*\]/)[1];
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

    downloadClick = () => {
        const content = this._resource;
        const file = new File([content], this.resourceId, {
            'type': 'data:text/plain;charset=utf-8'
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resourceType}#${file.name}.txt`;
        this._shadow.appendChild(link);
        link.click();
        this._shadow.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    copyClick = () => {
        const content = this._resource;
        navigator.clipboard.writeText(content).then(function () {
            SnackbarsService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarsService.error("Could not copy text");
        });
    };

    shareClick = () => {
        const content = this._resource;
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };
};
customElements.define('resource-ttl-view', ResourceTtlView);
