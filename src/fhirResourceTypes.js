import "./fhirResourceTypesFilter.js";

(function () {
    class FhirResourceTypes extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._metadata = null;
            this._resourceType = null;
        }

        connectedCallback() {
            this._shadow.getElementById('filter').addEventListener("filterChanged", ({ detail }) => {
                const ul = this._shadow.getElementById('list').firstElementChild;
                const filter = detail.text.toLowerCase();
                ul.childNodes.forEach(li => {
                    li.hidden = !li.innerText.toLowerCase().startsWith(filter);
                });
            });

            this._shadow.getElementById('list').onclick = ({ target }) => {
                if (target.nodeName === 'LI') {
                    let prev = this._shadow.querySelector(".selected");
                    if (prev) prev.classList.remove('selected');
                    target.classList.add('selected');
                    this._resourceType = target.dataset.type;
                    location.hash = `#${target.dataset.type}`;
                }
            };
        }

        clear() {
            this._shadow.getElementById('filter').clear();
            const list = this._shadow.getElementById('list');
            list.scrollTop = 0;
            const ul = list.firstElementChild;
            while (ul.firstChild) ul.removeChild(ul.lastChild);
        }

        get value() {
            return this._resourceType;
        }

        set value(resourceType) {
            if (resourceType != this._resourceType) {
                const ul = this._shadow.getElementById('list').firstElementChild;
                const li = Array.from(ul.childNodes).filter(li => li.dataset.type === resourceType);
                if (li?.length) {
                    this._resourceType = resourceType;
                    let prev = this._shadow.querySelector(".selected");
                    if (prev) prev.classList.remove('selected');
                    li[0].classList.add('selected');
                    li[0].scrollIntoView();
                }
            }
        }

        set metadata(metadata) {
            this._metadata = metadata;
            this.clear();
            const ul = this._shadow.getElementById('list').firstElementChild;
            metadata.rest[0].resource.forEach(resource => {
                const li = document.createElement('li');
                li.setAttribute("data-type", resource.type);
                li.innerHTML = resource.type;
                ul.appendChild(li);
            })
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                display: flex;
                flex-direction: column;
                height:100%;
            }
            #list {
                box-shadow: inset 0px 2px 4px 0px var(--border-color);
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
                line-height: 2em;
            }
            li:hover, li.selected {
                background-color:var(--hover-color, lightgray);
            }
        </style>
        <main>
            <fhir-resource-types-filter id="filter"></fhir-resource-types-filter>
            <div id="list"><ul></ul></div>
        </main>
    `;

    window.customElements.define('fhir-resource-types', FhirResourceTypes);
})();