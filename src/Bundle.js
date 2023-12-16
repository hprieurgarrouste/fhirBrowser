import template from "./templates/Bundle.html";

import "./components/AppBar"
import "./components/DataTable"
import "./components/DataTablePagination"
import "./components/LinearProgress"

import "./BundleSearchPanel"
import "./BundleColumnsDialog"

import { FhirService } from "./services/Fhir"
import { SnackbarsService } from "./services/Snackbars"
import { PreferencesService } from "./services/Preferences"

class Bundle extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._skip = 0;
        this._pageSize = 20;
        this._count = null;
        this._columns = null;
        this._filters = [];
        this._page = null;
        this._dateOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        };
        this._timeOptions = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short"
        }
        this._columnsDialog = null;
    }

    connectedCallback() {
        this._shadow.getElementById('help').onclick = this.helpClick;

        this._shadow.querySelector("data-table-pagination").onclick = this.paginationClick;

        const dataTable = this._shadow.getElementById('table');
        dataTable.addEventListener('rowclick', ({ detail }) => {
            location.hash = `#${this._resourceType.type}/${detail.resourceId}`;
        });
        dataTable.onColumnReorder = this.handleColumnChanged;

        this._shadow.getElementById('searchToggle').addEventListener('click', () => {
            this._shadow.getElementById('search')?.classList.toggle("hidden");
        });

        this._shadow.getElementById('copy').onclick = this.copyClick;

        this._shadow.getElementById('download').onclick = this.downloadClick;

        this._columnsDialog = this._shadow.querySelector('bundle-columns-dialog')
        this._columnsDialog.onValidate = this.handleColumnSetup;

        this._shadow.getElementById('settingsDialogToggle').onclick = this.settingsDialogToggleClick;

    }

    handleColumnSetup = (columns) => {
        //suppression des colonnes
        let newColumns = this._columns.filter(c => columns.includes(c));
        //ajout des nvlles colonnes à la fin
        newColumns.push(...columns.filter(c => !newColumns.includes(c)));
        this.handleColumnChanged(newColumns);
    }
    handleColumnChanged = (columns) => {
        this._columns = columns;
        const dataTable = this._shadow.getElementById('table');
        dataTable.clear();
        this._columns.forEach(column => dataTable.addColumn(column));
        this.loadPage();

        const pref = PreferencesService.get("columns", {});
        pref[this._resourceType.type] = this._columns;
        PreferencesService.set("columns", pref);
    }

    settingsDialogToggleClick = () => {
        this._columnsDialog.load(this._resourceType.type, this._columns);
        this._columnsDialog.hidden = false;
    }

    paginationClick = ({ target }) => {
        if (!target.matches("round-button")) {
            return;
        }
        this.loadPage(target.dataset);
    }

    helpClick = () => {
        window.open(FhirService.helpUrl(this._resourceType.type), "FhirBrowserHelp");
    }

    copyClick = () => {
        navigator.clipboard.writeText(JSON.stringify(this._page)).then(function () {
            SnackbarsService.show("Copying to clipboard was successful");
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    downloadClick = () => {
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
    }

    load(resourceType, filters = []) {
        if (resourceType === this._resourceType && JSON.stringify(this._filters) === JSON.stringify(filters)) return;

        if (window.matchMedia("(max-width: 480px)").matches) {
            this._shadow.getElementById('search')?.classList.add("hidden");
        }

        this._resourceType = resourceType;
        this._filters = filters;

        const pref = PreferencesService.get("columns", {});
        this._columns = pref[resourceType.type] || ["id", "meta.lastUpdated"];

        this._columnsDialog.hidden = true;

        this._shadow.getElementById('title').innerText = resourceType.type;

        const dataTable = this._shadow.getElementById('table');
        dataTable.clear();
        this._columns.forEach(column => {
            dataTable.addColumn(column);
        });

        this.loadPage();
    }

    get resourceType() {
        return this._resourceType;
    }

    loadPage(link = {
        url: `${FhirService.server.url}/${this._resourceType.type}?_count=${this._pageSize}`
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
        }).catch(error => {
            SnackbarsService.show(`An error occurred while searching`,
                undefined,
                undefined,
                'error'
            );
        });
    }

    getCount() {
        const paginationCount = this._shadow.getElementById('paginationCount');
        paginationCount.innerHTML = "<circular-progress></circular-progress>";
        FhirService.searchCount(this._resourceType.type, this._filters).then(({ total }) => {
            this._count = total;
            this.fillPaginationRange();
            paginationCount.innerHTML = total?.toLocaleString() || "Unkown";
        });
    }

    fillPaginationRange() {
        const paginationRange = this._shadow.getElementById('paginationRange');
        let range = '0';
        if (typeof this._count == 'undefined') {
            range = `${this._skip + 1}-${this._skip + this._pageSize}`;
        } else if (this._count != 0) {
            range = `${this._skip + 1}-${Math.min(this._skip + this._pageSize, this._count)}`;
        }
        paginationRange.innerText = range;
    }

    beautifyDate(stringdate) {
        const date = new Date(stringdate);
        try {
            return `${date.toLocaleString(undefined, this._dateOptions)}<br>${date.toLocaleString(undefined, this._timeOptions)}`;
        } catch (e) {
            return stringdate;
        }
    }

    parsePage(data) {
        if (data.entry) {
            const dataTable = this._shadow.getElementById('table');
            data.entry
                .filter(entry => this._resourceType.type === entry?.resource?.resourceType)
                .forEach(entry => {
                    let row = {};
                    this._columns.forEach(column => {
                        let value = entry.resource;
                        let path = column.split('.');
                        path.every((expr, idx) => {
                            value = eval("value[expr]");
                            if (value === null || typeof value === "undefined") return false;
                            if (Array.isArray(value)) {
                                if (idx == path.length - 1) {
                                    value = value.join(', ');
                                } else {
                                    value = value[0];
                                }
                            }
                            return true;
                        })
                        if (column === "meta.lastUpdated") value = this.beautifyDate(value);
                        row[column] = value || '';
                    });
                    dataTable.addRow(entry.resource.id, row);
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
customElements.define('fhir-bundle', Bundle);
