import "./components/ListRow.js"
import "./components/ListItem.js"
import "./fhirResourceTypesFilter.js";
import { FhirService } from "./services/Fhir.js";
import { AsyncService } from "./services/Async.js";

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
                const filter = detail.text.toLowerCase();
                const list = this._shadow.getElementById('list');
                list.childNodes.forEach(row => {
                    row.hidden = !row.dataset.type.toLowerCase().startsWith(filter);
                });
            });

            const list = this._shadow.getElementById('list');
            list.addEventListener("click", ({ target }) => {
                const row = target.closest("list-row");
                if (row) {
                    list.querySelector("[selected]")?.removeAttribute("selected");
                    row.setAttribute("selected", "");
                    this._resourceType = row.dataset.type;
                    location.hash = `#${row.dataset.type}`;
                }
            });
        }

        clear() {
            this._shadow.getElementById('filter').clear();
            const list = this._shadow.getElementById('list');
            list.scrollTop = 0;
            while (list.firstChild) list.removeChild(list.lastChild);
        }

        get value() {
            return this._resourceType;
        }

        set value(resourceType) {
            if (resourceType != this._resourceType) {
                const list = this._shadow.getElementById('list');
                const rows = Array.from(list.childNodes).filter(r => r.dataset.type === resourceType);
                if (rows?.length) {
                    this._resourceType = resourceType;
                    this._shadow.querySelector("[selected]")?.removeAttribute("selected");
                    rows[0].setAttribute("selected", "");
                    rows[0].scrollIntoView();
                }
            }
        }

        set metadata(metadata) {
            this._metadata = metadata;
            this.clear();
            const list = this._shadow.getElementById('list');
            const countList = [];
            metadata.rest[0].resource.forEach(resource => {
                const row = document.createElement('list-row');
                row.setAttribute("data-type", resource.type);
                const item = document.createElement('list-item');
                item.setAttribute("data-primary", resource.type);
                const badge = item._shadow.querySelector('badge');
                const icon = document.createElement('icon')
                icon.setAttribute('class', 'material-symbols');
                icon.innerText = FhirService.fhirIconSet[resource.type.toLowerCase()]?FhirService.fhirIconSet[resource.type.toLowerCase()]:'';
                countList.push({'resource': resource.type, 'element': badge});
                row.appendChild(item);
                list.appendChild(row);
                const row_item = item._shadow.querySelector('span');
                row_item.appendChild(icon);
            })

            const myPromise = args =>
                AsyncService.sleep(1000).then(() => {
                    FhirService.searchCount(args.resource).then(({total}) => {
                        args.element.innerText = (total==undefined)?'':total.toLocaleString();
                    }).catch(response=>{
                        args.element.innerText = 'report ';
                        args.element.setAttribute('class', 'error material-symbols')
                        args.element.setAttribute('title', "HTTP Error: " + response.status + " " + response.statusText)
                    });
                })
            AsyncService.forEachSeries(countList, myPromise)
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
            #list > * {
                cursor: pointer;
            }
        </style>
        <main>
            <fhir-resource-types-filter id="filter"></fhir-resource-types-filter>
            <div id="list"></div>
        </main>
    `;

    window.customElements.define('fhir-resource-types', FhirResourceTypes);
})();