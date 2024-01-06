import template from "./templates/ResourceTtlView.html";

export default class ResourceTtlView extends HTMLElement {

    /** @type {HTMLPreElement} */
    #content;
    /** @type {Fhir.Resource} */
    #resource

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#content = shadow.getElementById('content');

        shadow.getElementById('download').onclick = this.#downloadClick;

        shadow.getElementById('copy').onclick = this.#copyClick;

        shadow.getElementById('share').onclick = this.#shareClick;

        this.#resource = null;
    }

    clear = () => {
        this.#content.scrollTo(0, 0);
        this.#content.innerHTML = "Loading...";
        this.#content.style.cursor = "wait";
        this.#resource = null;
    }

    /** @returns {String} */
    get resourceType() {
        return this.#resource.match(/rdf:type\s*fhir:(\w+)/)[1];
    }

    /** @returns {String} */
    get resourceId() {
        return this.#resource.match(/fhir:Resource.id\s*\[\s*fhir:value\s*"([^"]+)"\s*\]/)[1];
    }

    /** @returns {Fhir.Resource} */
    get source() {
        return this.#resource;
    }
    /**
     * @param {Fhir.Resource} resource
     */
    set source(resource) {
        this.#content.scrollTo(0, 0);
        this.#content.innerText = resource;
        this.#content.style.cursor = "default";
        this.#resource = resource;
    }

    #downloadClick = () => {
        const content = this.#resource;
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

    #copyClick = () => {
        const content = this.#resource;
        navigator.clipboard.writeText(content).then(function () {
            SnackbarService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarService.error("Could not copy text");
        });
    };

    #shareClick = () => {
        const content = this.#resource;
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };
};
customElements.define('resource-ttl-view', ResourceTtlView);
