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
        this._source = null;

        this._shadow.getElementById('help').onclick = this.helpClick;
        this._shadow.querySelector("data-table-pagination").onclick = this.paginationClick;

        const dataTable = this._shadow.getElementById('table');
        dataTable.addEventListener('rowclick', this.onRowClick);
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

    onRowClick = ({ detail }) => {
        const entry = this._source.entry.find(({ resource }) => resource.id == detail.resourceId);
        if (entry) {
            const url = entry.fullUrl.replace(`${FhirService.server.url}`, '');
            location.hash = `#${url}`;
        }
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
        this.parsePage(this._source);

        const pref = PreferencesService.get("columns", {});
        pref[this._resourceType.type] = this._columns;
        PreferencesService.set("columns", pref);
    }

    settingsDialogToggleClick = () => {
        this._columnsDialog.load(this._resourceType.type, this._columns);
        this._columnsDialog.hidden = false;
    }

    paginationClick = ({ target }) => {
        if ("ROUND-BUTTON" != target.nodeName) return;
        let url = target.dataset.url;
        url = url.replace(`${FhirService.server.url}`, '');
        location.hash = `#${url}`;
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

    get resourceType() {
        return this._resourceType;
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
                //prev is specific to firely server
                "prev": this._shadow.getElementById('paginationPrevious'),
                "next": this._shadow.getElementById('paginationNext'),
                "last": this._shadow.getElementById('paginationLast')
            }

            Object.entries(buttons).forEach(([, button]) => {
                button.setAttribute("disabled", '');
                button.removeAttribute("data-relation");
                button.removeAttribute("data-url");
            });

            data.link?.forEach(({ relation, url }) => {
                buttons[relation]?.removeAttribute("disabled");
                buttons[relation]?.setAttribute("data-relation", relation);
                buttons[relation]?.setAttribute("data-url", url);
            });
        }
    }

    /**
     * @param {any} response
     */
    set source(response) {

        let resourceType;
        let singleResourceType = false;
        if (response.entry?.length) {
            const types = [...new Set(response.entry.map(entry => entry.resource.resourceType))];
            singleResourceType = (types.length == 1);
            if (singleResourceType) {
                resourceType = types[0];
            } else {
                resourceType = 'Bundle';
            }
        }
        else {
            const hash = window.location.hash.replace('#/', '').trim();
            resourceType = RegExp(/^\w+/).exec(hash)[0];
        }

        this._resourceType = FhirService.server.capabilities.rest[0].resource.find(res => res.type === resourceType);

        let title = resourceType;

        if (singleResourceType) {
            const pref = PreferencesService.get('columns', {});
            this._columns = pref[resourceType] || ['id', 'meta.lastUpdated'];
            this._shadow.getElementById('settingsDialogToggle').hidden = false;
            this._shadow.getElementById('search').hidden = false;
        } else {
            this._shadow.getElementById('settingsDialogToggle').hidden = true;
            this._shadow.getElementById('search').hidden = true;
            this._columns = ['resourceType', 'id'];
            if ('Bundle' == resourceType) {
                title = `${response.type} ${title.toLowerCase()}`;
            }
        }
        this._shadow.getElementById('title').innerText = title;

        const dataTable = this._shadow.getElementById('table');
        dataTable.clear();
        this._columns.forEach(column => dataTable.addColumn(column));

        this._source = response;
        this.parsePage(response);
    }
};
customElements.define('fhir-bundle', Bundle);