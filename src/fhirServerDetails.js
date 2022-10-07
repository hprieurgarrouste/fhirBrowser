import "./appListItem.js"

customElements.define('fhir-server-details', class FhirServerDetails extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirServerDetailsTemplate.content.cloneNode(true));
    }

    /**
     * @param {object} metadata
     */
    set metadata(metadata) {
        const wrapper = this._shadow.getElementById('wrapper');
        while (wrapper.firstChild) wrapper.removeChild(wrapper.lastChild);

        make("copyright", metadata.copyright);
        make("description", metadata.description);
        make("fhirVersion", metadata.fhirVersion);
        if (metadata.implementation) {
            make("implementation description", metadata.implementation.description);
            make("implementation name", metadata.implementation.name);
            make("implementation url", metadata.implementation.url);
        }
        make("language", metadata.language);
        make("name", metadata.name);
        make("publisher", metadata.publisher);
        if (metadata.software) {
            make("software name", metadata.software.name);
            make("software version", metadata.software.version);
            make("software release date", metadata.software.releaseDate);
        }
        function make(name, value) {
            if (typeof value === "undefined") return;

            const row = document.createElement('app-list-item');
            const title = document.createElement("span");
            title.appendChild(document.createTextNode(name));
            title.slot = "title";
            row.appendChild(title);
            const subTitle = document.createElement("span");
            subTitle.appendChild(document.createTextNode(value));
            subTitle.slot = "subTitle";
            row.appendChild(subTitle);
            wrapper.appendChild(row);
        }
    }

});

const FhirServerDetailsTemplate = document.createElement('template');
FhirServerDetailsTemplate.innerHTML = `
    <style>
        #wrapper {
            overflow-y: auto;
        }
        #wrapper > div {
            padding: 0.5em 1em;
        }
    </style>
    <div id="wrapper"></div>
`;