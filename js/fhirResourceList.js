import "./fhirResourceListFilter.js";

customElements.define('fhir-resources-list', class FhirResourcesList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                #wrapper {
                    display: flex;
                    flex-direction: column;
                    height:100%;
                }
                #list {
                    flex:1 1 auto;
                    height:0;
                    overflow:auto;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                li {
                    cursor: pointer;
                    padding: 0.3em 1em;
                }
                li:hover, li.selected {
                    background-color:var(--hover-color, lightgray);
                }
            </style>
            <div id="wrapper">
                <fhir-resources-list-filter id="filter"></fhir-resources-list-filter>
                <div id="list"><ul></ul></div>
            </div>
        `;
    }
    connectedCallback() {
        this._shadow.getElementById('filter').addEventListener("filterChanged", (event) => {
            const ul = this._shadow.getElementById('list').firstElementChild;
            const filter = event.detail.text.toLowerCase();
            ul.childNodes.forEach(li => {
                li.hidden = !li.id.toLowerCase().startsWith(filter);
            });
        });
        this._shadow.getElementById('list').onclick = (event) => {
            if (event.target.nodeName === 'LI') {
                let prev = this._shadow.querySelector(".selected");
                if (prev) {
                    prev.classList.remove('selected');
                }
                event.target.classList.add('selected');
                this.dispatchEvent(new CustomEvent("resourceSelected", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        resourceType: event.target.id
                    }
                }));
                event.stopPropagation();
            }
        };
    }

    /**
     * @param {object} metadata
     */
    set metadata(metadata) {
        const ul = this._shadow.getElementById('list').firstElementChild;
        metadata.rest[0].resource.forEach(resource => {
            const li = document.createElement('li');
            li.id = resource.type;
            li.innerHTML = resource.type;
            ul.appendChild(li);
        })
    }

    clear() {
        const ul = this._shadow.getElementById('list').firstElementChild;
        while (ul.firstChild) {
            ul.removeChild(ul.lastChild);
        }
    }
});