import "./components/AppBar.js";
import "./components/DataTable.js";
import "./components/DataTablePagination.js";
import "./components/LinearProgress.js";
import "./fhirSearch.js";

import { FhirService } from "./services/Fhir.js";
import { SnackbarsService } from "./services/Snackbars.js";

(function () {
    class FhirBundle extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._resourceType = null;
            this._skip = 0;
            this._pageSize = 20;
            this._count = null;
            this._columns = null;
            this._filters = [];
            this._page = null;
        }

        connectedCallback() {
            this._shadow.getElementById('help').addEventListener('click', () => {
                window.open(FhirService.helpUrl(this._resourceType.type), "FhirBrowserHelp");
            });
            this._shadow.querySelector("data-table-pagination").addEventListener('click', (event) => {
                const { target } = event;
                if (!target.matches("round-button")) {
                    return;
                }
                this.loadPage(target.dataset);
            });
            const dataTable = this._shadow.getElementById('table');
            dataTable.addEventListener('rowclick', ({ detail }) => {
                location.hash = `#${this._resourceType.type}/${detail.resourceId}`;
            });

            const searchPanel = this._shadow.getElementById('search');

            this._shadow.getElementById('searchToggle').addEventListener('click', () => {
                searchPanel.classList.toggle("hidden");
            });

            searchPanel.addEventListener('apply', ({ detail }) => {
                this._filters = detail.parameters;
                this.loadPage();
                if (window.matchMedia("(max-width: 480px)").matches) {
                    searchPanel.classList.add("hidden");
                }
            });

            this._shadow.getElementById('copy').addEventListener("click", () => {
                navigator.clipboard.writeText(JSON.stringify(this._page)).then(function () {
                    SnackbarsService.show("Copying to clipboard was successful");
                }, function (err) {
                    console.error('Async: Could not copy text: ', err);
                });
            });

            this._shadow.getElementById('download').addEventListener("click", () => {
                const fileName = `${this._resourceType.type}-${this._skip}`;
                const file = new File([JSON.stringify(this._page)], fileName, {
                    type: 'data:text/json;charset=utf-8',
                });
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.json`;
                this._shadow.appendChild(link);
                link.click();
                this._shadow.removeChild(link);
                window.URL.revokeObjectURL(url);
            });

        }

        load(resourceType) {
            if (resourceType === this._resourceType) return;
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

            this.loadPage();
        }

        loadPage(link = {
            url: `${FhirService.server.url}/${this._resourceType.type}?_count=${this._pageSize}&_summary=true`
        }) {
            switch (link.relation) {
                case 'previous':
                    this._skip -= this._pageSize;
                    break;
                case 'next':
                    this._skip += this._pageSize;
                    break;
                case 'last':
                    this._skip = Math.floor(this._count / this._pageSize) * this._pageSize;
                    break;
                case 'first':
                default:
                    this._skip = 0;
                    break;
            }
            this._shadow.getElementById('table').removeAll();
            const loader = this._shadow.querySelector('linear-progress');
            loader.style.visibility = "visible";
            FhirService.searchByLink(link.url, this._filters).then(data => {
                this._page = data;
                this.parsePage(data);
                loader.style.visibility = "hidden";
                if (typeof link.relation === 'undefined') {
                    if (data.total) {
                        this._count = data.total;
                        this.fillPaginationRange();
                        this._shadow.getElementById('paginationCount').innerHTML = this._count;
                    } else {
                        this.getCount();
                    }
                } else {
                    this.fillPaginationRange();
                }
            });
        }

        getCount() {
            const paginationCount = this._shadow.getElementById('paginationCount');
            paginationCount.innerHTML = "<circular-progress></circular-progress>";
            FhirService.searchCount(this._resourceType.type, this._filters).then(({ total }) => {
                this._count = total;
                this.fillPaginationRange();
                paginationCount.innerHTML = total;
            });
        }

        fillPaginationRange() {
            const paginationRange = this._shadow.getElementById('paginationRange');
            let range = '0';
            if (this._count != 0) {
                range = `${this._skip + 1}-${Math.min(this._skip + this._pageSize, this._count)}`;
            }
            paginationRange.innerText = range;
        }

        parsePage(data) {
            if (data.entry) {
                const dataTable = this._shadow.getElementById('table');
                let value = "";
                data.entry.forEach(entry => {
                    if (entry.resource && entry.resource.resourceType == this._resourceType.type) {
                        let row = {};
                        this._columns.forEach(column => {
                            value = eval("entry.resource." + column.expression);
                            row[column.label] = typeof value !== "undefined" ? value : "";
                        });
                        dataTable.addRow(entry.resource.id, row);
                    }
                });

                const buttons = {
                    "first": this._shadow.getElementById('paginationFirst'),
                    "previous": this._shadow.getElementById('paginationPrevious'),
                    "next": this._shadow.getElementById('paginationNext'),
                    "last": this._shadow.getElementById('paginationLast')
                }

                for (const [relation, button] of Object.entries(buttons)) {
                    button.setAttribute("disabled", '');
                    button.removeAttribute("data-relation");
                    button.removeAttribute("data-url");
                }
                let button = null;
                data.link.forEach(link => {
                    //prev is specific to firely server
                    const rel = ("prev" === link.relation) ? "previous" : link.relation;
                    if (button = buttons[rel]) {
                        button.removeAttribute("disabled");
                        button.setAttribute("data-relation", rel);
                        button.setAttribute("data-url", link.url);
                    }
                });
            }
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
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
                        <round-button slot="right" id="copy" title="Copy to clipboard" data-icon="content_copy"></round-button>
                        <round-button slot="right" id="download" title="Download" data-icon="download"></round-button>
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
                        <div slot="rows"><span id="paginationRange"></span> of <span id="paginationCount"></span></div>
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

    window.customElements.define('fhir-bundle', FhirBundle);
})();
