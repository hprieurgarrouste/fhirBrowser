import "./appLinearLoader.js";
import "./appPagination.js";
import "./appDataTable.js";

customElements.define('fhir-bundle', class FhirBundle extends HTMLElement {
    constructor() {
        super();
        let shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                div {
                    display:flex;
                    flex-direction:column;
                    height:100%;
                }
                #table {
                    flex:1 1 auto;
                    height:0;
                }
                .header {
                    margin-bottom: 1em;
                    display: flex;
                    align-items: center;
                }
                .header > * {
                    margin-right: .5em;
                }
                #help {
                    color: var(--primary-color);
                }
            </style>
            <div>
                <h2 class="header">
                    <span id="title"></span>
                    <app-round-button id="help" title="Help">help</app-round-button>
                </h2>
                <app-linear-loader id="loader" style="visibility:hidden;"></app-linear-loader>
                <data-table id="table">
                    <data-table-pagination id="pagination" slot="footer"/>
                </data-table>
            </div>
        `;
        this._title = shadow.getElementById('title');
        this._help = shadow.getElementById('help');
        this._loader = shadow.getElementById('loader');
        this._dataTable = shadow.getElementById('table');
        this._pagination = shadow.getElementById('pagination');
        this._server = null;
        this._resourceType = null;
        this._skip = 0;
        this._pageSize = 20;
        this._link = null;
        this._count = null;
    }
    connectedCallback() {
        this._help.addEventListener('click', (event) => {
            const resourceDefinition = this._server.metadata.rest[0].resource.find(r => r.type == this._resourceType);
            window.open(resourceDefinition.profile, "_blank");
        });
        this._pagination.addEventListener("pagination", (event) => {
            this.loadPage(event.detail.button);
        });
        this._dataTable.addColumn("id");
        this._dataTable.addColumn("lastUpdated");
        this._dataTable.addEventListener('rowclick', (event) => {
            this.dispatchEvent(new CustomEvent("resourceSelected", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    resourceType: this._resourceType,
                    resourceId: event.detail.resourceId
                }
            }));
        });
    }

    load(server, resourceType) {
        this._server = server;
        this._resourceType = resourceType;

        const resourceDefinition = server.metadata.rest[0].resource.find(r => r.type == resourceType);
        this._help.href = resourceDefinition.profile;

        this._title.innerText = resourceType;

        this._skip = 0;
        this._link = {
            "first": `${this._server.url}/${this._resourceType}?_count=${this._pageSize}&_elements=entry.id,entry.lastupdated`
        };
        this.loadPage();
    }

    loadPage(page = 'first') {
        switch (page) {
            case 'first':
                this._skip = 0;
                break;
            case 'previous':
                this._skip -= this._pageSize;
                break;
            case 'next':
                this._skip += this._pageSize;
                break;
            case 'last':
                this._skip = Math.floor(this._count / this._pageSize) * this._pageSize;
                break;
            default:
                return;
        }
        const url = this._link[page];
        this._dataTable.removeAll();
        this._loader.style.visibility = "visible";
        this.fetchPage(url).then(data => {

            if (data.total) {
                this._count = data.total;
                this.parsePage(data);
                this._loader.style.visibility = "hidden";
            } else {
                this.fetchCount().then(count => {
                    this._count = count.total;
                    this.parsePage(data);
                    this._loader.style.visibility = "hidden";
                });
            }
        });
    }

    parsePage(data) {
        let range = '0';
        if (this._count != 0) {
            range = `${this._skip + 1}-${Math.min(this._skip + this._pageSize, this._count)}`;
        }
        this._pagination.text = `${range} of ${this._count}`;
        if (data.entry) {
            data.entry.forEach(entry => {
                if (entry.resource && entry.resource.resourceType == this._resourceType) {
                    let row = {
                        "id": entry.resource.id,
                        "lastupdated": formatDate(entry.resource.meta.lastUpdated)
                    }
                    this._dataTable.addRow(entry.resource.id, row);
                }
                function formatDate(dte) {
                    let date = new Date(dte);
                    return date.toLocaleDateString("en", {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    });
                }
            });
            this._link = {};
            this._pagination.first = false;
            this._pagination.previous = false;
            this._pagination.next = false;
            this._pagination.last = false;
            data.link.forEach(link => {
                this._link[link.relation] = link.url;
                switch (link.relation) {
                    case 'first':
                        this._pagination.first = true;
                        break;
                    case 'previous':
                        this._pagination.previous = true;
                        break;
                    case 'next':
                        this._pagination.next = true;
                        break;
                    case 'last':
                        this._pagination.last = true;
                        break;
                    default:
                        break;
                }
            });
        }
    }

    async fetchPage(url) {
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    async fetchCount() {
        const response = await fetch(`${this._server.url}/${this._resourceType}?_summary=count&_format=json`, {
            "headers": this._server.headers
        });
        return response.json();
    }
});
