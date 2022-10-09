import "./appBar.js";
import "./appDataTable.js";
import "./appDataTablePagination.js";
import "./appLinearProgress.js";
import "./appDataTablePagination.js";

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
    }

    connectedCallback() {
        this._shadow.getElementById('help').addEventListener('click', () => {
            window.open(this._resourceType.profile, "_blank");
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
    }

    load(server, resourceType) {
        this._server = server;
        this._resourceType = resourceType;

        this._columns = [];
        if (resourceType.type === "Binary") {
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

        this._skip = 0;
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
                        if (column.type === "date") value = formatDate(value);
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

    async fetchPage(url) {
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    async fetchCount() {
        const response = await fetch(`${this._server.url}/${this._resourceType.type}?_summary=count&_format=json`, {
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
        #table {
            flex:1 1 auto;
            height:0;
        }
        #title {
            margin:0;
        }
    </style>
    <div id="wrapper">
        <app-bar>
            <h3 slot="middle" id="title"></h3>
            <app-round-button slot="right" id="filter" title="Filter" disabled app-icon="filter_list"></app-round-button>
            <app-round-button slot="right" id="help" title="Help" app-icon="help"></app-round-button>
        </app-bar>
        <app-linear-progress id="loader" style="visibility:hidden;"></app-linear-progress>
        <app-data-table id="table">
            <app-data-table-pagination id="pagination" slot="footer"/>
        </app-data-table>
    </div>
`;
