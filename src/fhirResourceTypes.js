import "./fhirResourceTypesFilter.js";

customElements.define('fhir-resource-types', class FhirResourceTypes extends HTMLElement {
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
                <fhir-resource-types-filter id="filter"></fhir-resource-types-filter>
                <div id="list"><ul></ul></div>
            </div>
        `;
        this._metadata = null;
    }

    connectedCallback() {
        this._shadow.getElementById('filter').addEventListener("filterChanged", ({ detail }) => {
            const ul = this._shadow.getElementById('list').firstElementChild;
            const filter = detail.text.toLowerCase();
            ul.childNodes.forEach(li => {
                li.hidden = !li.id.toLowerCase().startsWith(filter);
            });
        });

        this._shadow.getElementById('list').onclick = ({ target }) => {
            if (target.nodeName === 'LI') {
                let prev = this._shadow.querySelector(".selected");
                if (prev) {
                    prev.classList.remove('selected');
                }
                target.classList.add('selected');
                this.dispatchEvent(new CustomEvent("resourceTypeSelected", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        resourceType: this._metadata.rest[0].resource.filter(res => res.type === target.id)[0]
                    }
                }));
            }
        };
    }

    /**
     * @param {object} metadata
     */
    set metadata(metadata) {
        this._metadata = metadata;
        this._shadow.getElementById('filter').clear();
        const list = this._shadow.getElementById('list');
        list.scrollTop = 0;
        const ul = list.firstElementChild;
        while (ul.firstChild) {
            ul.removeChild(ul.lastChild);
        }

        metadata.rest[0].resource.forEach(resource => {
            const li = document.createElement('li');
            li.id = resource.type;
            li.innerHTML = resource.type;
            ul.appendChild(li);
        })
    }

});