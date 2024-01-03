import template from "./templates/ResourceTtlView.html";

import snackbarService from "./services/Snackbar"

class ResourceTtlView extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._content = shadow.getElementById('content');

        shadow.getElementById('download').onclick = this.downloadClick;

        shadow.getElementById('copy').onclick = this.copyClick;

        shadow.getElementById('share').onclick = this.shareClick;

        this._resource = null;
    }

    clear = () => {
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "Loading...";
        this._content.style.cursor = "wait";
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
        this._content.scrollTo(0, 0);
        this._content.innerText = resource;
        this._content.style.cursor = "default";
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
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    copyClick = () => {
        const content = this._resource;
        navigator.clipboard.writeText(content).then(function () {
            SnackbarService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarService.error("Could not copy text");
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
