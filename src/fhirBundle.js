import "./components/AppBar.js";
import "./components/DataTable.js";
import "./components/DataTablePagination.js";
import "./components/LinearProgress.js";
import { FhirService } from "./services/Fhir.js";

import "./fhirSearch.js";
import "./fhirSearch.js";

customElements.define('fhir-bundle', class FhirBundle extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirBundleTemplate.content.cloneNode(true));
        this._resourceType = null;
        this._skip = 0;
        this._pageSize = 20;
        this._link = null;
        this._count = null;
        this._columns = null;
        this._filters = [];
    }

    connectedCallback() {
        this._shadow.getElementById('help').addEventListener('click', () => {
            window.open(this._resourceType.profile, "FhirBrowserHelp");
        });
        this._shadow.querySelector("data-table-pagination").addEventListener('click', (event) => {
            const { target } = event;
            if (!target.matches("round-button")) {
                return;
            }
            this.loadPage(target.dataset.relation);
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

        const searchPanel = this._shadow.getElementById('search');

        this._shadow.getElementById('searchToggle').addEventListener('click', () => {
            searchPanel.classList.toggle("hidden");
        });

        searchPanel.addEventListener('apply', ({ detail }) => {
            this._filters = detail.parameters;
            this._link = {
                "first": `${FhirService.server.url}/${this._resourceType.type}?_count=${this._pageSize}&_summary=true`
            };
            this.loadPage();
            if (window.matchMedia("(max-width: 480px)").matches) {
                searchPanel.classList.add("hidden");
            }
        });
    }

    load(resourceType) {
        this._resourceType = resourceType;
        this._filters = [];

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
            "first": `${FhirService.server.url}/${this._resourceType.type}?_count=${this._pageSize}&_summary=true`
        };
        this.loadPage();
    }

    loadPage(page = 'first') {
        switch (page) {
            case 'first':
                this._skip = 0;
                break;
            case 'prev':
            //prev is specific to firely server
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
        this._shadow.getElementById('table').removeAll();
        const loader = this._shadow.querySelector('linear-progress');
        loader.style.visibility = "visible";
        FhirService.searchByLink(this._link[page], this._filters).then(data => {
            if (data.total) {
                this._count = data.total;
                this.parsePage(data);
                loader.style.visibility = "hidden";
            } else {
                FhirService.searchCount(this._resourceType.type, this._filters).then(count => {
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
        const paginationRows = this._shadow.getElementById('paginationRows');
        let range = '0';
        if (this._count != 0) {
            range = `${this._skip + 1}-${Math.min(this._skip + this._pageSize, this._count)}`;
        }
        paginationRows.innerText = `${range} of ${this._count}`;
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

            const paginationFirst = this._shadow.getElementById('paginationFirst');
            paginationFirst.setAttribute("disabled", '');
            const paginationPrevious = this._shadow.getElementById('paginationPrevious');
            paginationPrevious.setAttribute("disabled", '');
            const paginationNext = this._shadow.getElementById('paginationNext');
            paginationNext.setAttribute("disabled", '');
            const paginationLast = this._shadow.getElementById('paginationLast');
            paginationLast.setAttribute("disabled", '');

            data.link.forEach(link => {
                this._link[link.relation] = link.url;
                switch (link.relation) {
                    case 'first':
                        paginationFirst.removeAttribute("disabled");
                        paginationFirst.setAttribute("data-relation", link.relation);
                        break;
                    case 'prev':
                    //prev is specific to firely server
                    case 'previous':
                        paginationPrevious.removeAttribute("disabled");
                        paginationPrevious.setAttribute("data-relation", link.relation);
                        break;
                    case 'next':
                        paginationNext.removeAttribute("disabled");
                        paginationNext.setAttribute("data-relation", link.relation);
                        break;
                    case 'last':
                        paginationLast.removeAttribute("disabled");
                        paginationLast.setAttribute("data-relation", link.relation);
                        break;
                    default:
                        break;
                }
            });
        }
    }

});

const FhirBundleTemplate = document.createElement('template');
FhirBundleTemplate.innerHTML = `
    <link href="./assets/material.css" rel="stylesheet"/>
    <style>
        #wrapper {
            display:flex;
            flex-direction:row;
            height:100%;
            overflow: hidden;
        }
        #bundleCnt {
            display:flex;
            flex-direction:column;
            height:100%;
            flex: auto;
            width: 0;
        }
        main {
            flex:1 1 auto;
            height:0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
        }
        #title {
            margin:0;
            overflow:hidden;
            text-overflow:ellipsis;
        }
        linear-progress {
            position: relative;
            top: 0;
        }
        #table {
            flex: auto;
        }
        fhir-search {
            border-left: 1px solid var(--border-color);
            flex: none;
            transition: all 0.3s;
            width: 400px;
        }
        fhir-search.hidden {
            transition: all 0.3s;
            margin-right: -400px;
        }
        @media (max-width:480px){
            fhir-search {
                background-color: var(--background-color, rgb(255,255,255));
                position: relative;
                width:100%;
            }
            fhir-search.hidden {
                margin-right: -100%;
            }
        }
    </style>
    <div id="wrapper">
        <div id="bundleCnt">
            <header>
                <app-bar>
                    <h3 slot="middle" id="title"></h3>
                    <round-button slot="right" id="searchToggle" title="Search" data-icon="search"></round-button>
                    <round-button slot="right" id="help" title="Help" data-icon="help"></round-button>
                </app-bar>
                <linear-progress></linear-progress>
            </header>
            <main>
                <data-table id="table"></data-table>
            </main>
            <footer>
                <data-table-pagination id="pagination">
                    <span slot="rows" id="paginationRows"></span>
                    <round-button slot="arrows" id="paginationFirst" title="first" data-icon="first_page" disabled></round-button>
                    <round-button slot="arrows" id="paginationPrevious" title="previous" data-icon="chevron_left" disabled></round-button>
                    <round-button slot="arrows" id="paginationNext" title="next" data-icon="chevron_right" disabled></round-button>
                    <round-button slot="arrows" id="paginationLast" title="last" data-icon="last_page" disabled/>
                </data-table-pagination>
            </footer>
        </div>
        <fhir-search id="search" class="hidden"></fhir-search>
    </div>
`;
