import "./appBar.js";
import "./appDataTable.js";
import "./appDataTablePagination.js";
import "./appLinearProgress.js";

import "./fhirSearch.js";

customElements.define('fhir-bundle', class FhirBundle extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirBundleTemplate.content.cloneNode(true));
        this._server = null;
        this._resourceType = null;
        this._skip = 0;
        this._pageSize = 20;
        this._link = null;
        this._count = null;
        this._columns = null;
        this._filters = null;
    }

    connectedCallback() {
        this._shadow.getElementById('help').addEventListener('click', () => {
            window.open(this._resourceType.profile, "FhirBrowserHelp");
        });
        this._shadow.getElementById('pagination').addEventListener("pagination", ({ detail }) => {
            this.loadPage(detail.button);
        });
        const dataTable = this._shadow.getElementById('table');
        dataTable.addEventListener('rowclick', ({ detail }) => {
            this.dispatchEvent(new CustomEvent("resourceSelected", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    resourceType: this._resourceType,
                    resourceId: detail.resourceId
                }
            }));
        });
        this._shadow.getElementById('searchToggle').addEventListener('click', () => {
            this._shadow.getElementById('search').hidden = false;
        });
        this._shadow.getElementById('search').addEventListener('apply', ({ detail }) => {
            this._filters = detail.parameters;
            this._link = {
                "first": `${this._server.url}/${this._resourceType.type}?_count=${this._pageSize}&_summary=true`
            };
            this.loadPage();
        });
    }

    load(server, resourceType) {
        this._server = server;
        this._resourceType = resourceType;
        this._filters = null;

        this._shadow.getElementById("search").metadata = resourceType;

        this._columns = [];
        if ("Binary" === resourceType.type) {
            this._columns.push({
                "label": "Content type",
                "expression": "contentType",
                "type": "string"
            })
        }
        this._columns.push({
            "label": "Id",
            "expression": "id",
            "type": "string"
        }, {
            "label": "Last updated",
            "expression": "meta.lastUpdated",
            "type": "date"
        });

        const dataTable = this._shadow.getElementById('table');
        dataTable.clear();
        this._columns.forEach(column => {
            dataTable.addColumn(column.label);
        });

        this._shadow.getElementById('title').innerText = resourceType.type;

        this._link = {
            "first": `${this._server.url}/${this._resourceType.type}?_count=${this._pageSize}&_summary=true`
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
        this._shadow.getElementById('table').removeAll();
        const loader = this._shadow.getElementById('loader');
        loader.style.visibility = "visible";
        this.fetchPage(url).then(data => {

            if (data.total) {
                this._count = data.total;
                this.parsePage(data);
                loader.style.visibility = "hidden";
            } else {
                this.fetchCount().then(count => {
                    this._count = count.total;
                    this.parsePage(data);
                    loader.style.visibility = "hidden";
                });
            }
        });
    }

    parsePage(data) {
        function evalColumn(resource, expression) {
            return
        }
        const dataTable = this._shadow.getElementById('table');
        const pagination = this._shadow.getElementById('pagination');
        let range = '0';
        if (this._count != 0) {
            range = `${this._skip + 1}-${Math.min(this._skip + this._pageSize, this._count)}`;
        }
        pagination.text = `${range} of ${this._count}`;
        if (data.entry) {
            let value = "";
            data.entry.forEach(entry => {
                if (entry.resource && entry.resource.resourceType == this._resourceType.type) {
                    let row = {};
                    this._columns.forEach(column => {
                        value = eval("entry.resource." + column.expression);
                        //if (column.type === "date") value = formatDate(value);
                        row[column.label] = value;
                    });
                    dataTable.addRow(entry.resource.id, row);
                }
                function formatDate(dte) {
                    let date = new Date(dte);
                    return date.toLocaleDateString(navigator.language, {
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
            pagination.first = false;
            pagination.previous = false;
            pagination.next = false;
            pagination.last = false;
            data.link.forEach(link => {
                this._link[link.relation] = link.url;
                switch (link.relation) {
                    case 'first':
                        pagination.first = true;
                        break;
                    case 'previous':
                        pagination.previous = true;
                        break;
                    case 'next':
                        pagination.next = true;
                        break;
                    case 'last':
                        pagination.last = true;
                        break;
                    default:
                        break;
                }
            });
        }
    }

    async fetchPage(base) {
        const url = new URL(base);
        if (this._filters) {
            this._filters.forEach(filter => {
                url.searchParams.append(filter.name, filter.value);
            });
        }
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    async fetchCount() {
        const url = new URL(`${this._server.url}/${this._resourceType.type}?_summary=count&_format=json`);
        if (this._filters) {
            this._filters.forEach(filter => {
                url.searchParams.append(filter.name, filter.value);
            });
        }
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }
});

const FhirBundleTemplate = document.createElement('template');
FhirBundleTemplate.innerHTML = `
    <link href="./material.css" rel="stylesheet"/>
    <style>
        #wrapper {
            display:flex;
            flex-direction:column;
            height:100%;
        }
        main {
            flex:1 1 auto;
            height:0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
        }
        #title {
            margin:0;
        }
        progress {
            position: fixed;
            top: 100px;
        }
    </style>
    <div id="wrapper">
        <header>
            <app-bar>
                <h3 slot="middle" id="title"></h3>
                <app-round-button slot="right" id="searchToggle" title="Search" app-icon="filter_list"></app-round-button>
                <app-round-button slot="right" id="help" title="Help" app-icon="help"></app-round-button>
            </app-bar>
            <app-linear-progress id="loader"></app-linear-progress>
        </header>
        <main>
            <app-data-table id="table"></app-data-table>
        </main>
        <footer>
            <app-data-table-pagination id="pagination"/>
        </footer>
    </div>
    <fhir-search id="search" hidden></fhir-seach>
`;
