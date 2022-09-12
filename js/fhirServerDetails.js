customElements.define('fhir-server-details', class FhirServerDetails extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <style>
                #wrapper {
                    overflow-y: auto;
                }
                .item {
                    padding: 0.5em 1em;
                }
                .item:hover {
                    background-color: var(--hover-color, rgba(0, 0, 0, 5%));
                }
                .primary {
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    text-transform: capitalize;
                    color: var(--text-color-normal, black);
                }
                .secondary {
                    font-size: 0.875em;
                    color: rgba(var(--text-color, "0, 0, 0"), 54%);
                    overflow-wrap: break-word;
                }
            </style>
            <div id="wrapper"></div>
        `;
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
            const item = document.createElement('div');
            item.classList.add("item");
            const line1 = document.createElement('div');
            line1.classList.add("primary");
            line1.innerText = name;
            item.appendChild(line1);
            const line2 = document.createElement('div');
            line2.classList.add("secondary");
            line2.innerText = value;
            item.appendChild(line2);
            wrapper.appendChild(item);
        }
    }

});