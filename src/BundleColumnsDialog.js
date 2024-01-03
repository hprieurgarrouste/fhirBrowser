import template from "./templates/BundleColumnsDialog.html";

import "./components/M2Button"
import "./components/M2Dialog"
import "./components/M2List"
import "./components/M2LinearProgress"
import "./components/M2ListItem"
import "./components/M2ListRowCheck"

import context from "./services/Context"
import fhirService from "./services/Fhir"

class BundleColumnsDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._release = null;
        this._onValidate = () => { };
        this._list = null;
        this._shadow.querySelector('m2-dialog').onClose = this.appDialogClose;

        this._list = this._shadow.querySelector('m2-list');
        this._list.onFilter = this.appListFilter;

        this._shadow.getElementById('btnCancel').onclick = this.btnCancelClick;
        this._shadow.getElementById('btnOk').onclick = this.btnOkClick;
    }

    btnOkClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.hidden = true;
        const columns = Array.from(this._list.querySelectorAll('m2-list-row-check[selected]')).map(r => r.dataset.id);
        this._onValidate(columns);
    }

    btnCancelClick = () => { this.hidden = true };

    appListFilter = (value) => {
        const filter = value.toLowerCase();
        this._list.childNodes.forEach(row => {
            row.hidden = !(row.dataset.id.toLowerCase().includes(filter));
        });
    }

    appDialogClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    get onValidate() { return this._onValidate }

    set onValidate(promise) { this._onValidate = promise }

    checkValues = (values) => {
        Array.from(this._list.querySelectorAll('m2-list-row-check')).forEach(row => {
            if (values.includes(row.dataset.id)) {
                row.setAttribute('selected', '');
            } else {
                row.removeAttribute('selected');
            }
        });
    }

    /**
    * @param {string} resourceType
    * @param {string[]} values
    */
    load = (resourceType, values) => {
        if (resourceType === this._resourceType && context.server.release === this._release) {
            this.checkValues(values);
            return;
        }
        this._resourceType = resourceType;
        this._release = context.server.release;

        this._list.clear();

        this._shadow.querySelector('m2-linear-progress').hidden = false;
        sdParse(resourceType, '').then((elements) => {
            elements.sort((e1, e2) => e1.path.localeCompare(e2.path));
            elements.forEach(element => {
                const item = document.createElement('m2-list-item');
                item.setAttribute('data-primary', element.path);
                item.setAttribute('data-secondary', element.short);
                const row = document.createElement('m2-list-row-check');
                row.setAttribute('data-id', element.id);
                row.appendChild(item);
                this._list.appendChild(row);
            });
            this._shadow.querySelector('m2-linear-progress').hidden = true;
            this.checkValues(values);
        });

        function sdParse(resourceType, path) {
            return new Promise((resolve) => {
                const elements = [];
                fhirService.structureDefinition(resourceType).then((structureDefinition) => {
                    const subPromises = [];
                    structureDefinition.snapshot.element
                        .filter(e => e.isSummary && e.type)
                        .forEach((element) => {
                            const elementName = element.path.substr(element.path.indexOf(".") + 1);
                            //avoid infinite loops
                            if (!path.includes(`${elementName}.`)) {
                                const newPath = (path ? `${path}.` : '') + elementName;
                                const type = element.type[0].code;
                                const isClass = type.match(/^([A-Z][a-z]+)+$/);
                                if (isClass) {
                                    subPromises.push(sdParse(type, newPath));
                                } else {
                                    elements.push({
                                        'id': newPath,
                                        'path': newPath,
                                        'short': element.short,
                                        'type': type
                                    });
                                }
                            }
                        });
                    if (subPromises.length > 0) {
                        Promise.all(subPromises).then((values) => {
                            values.forEach(value => elements.push(...value));
                            resolve(elements);
                        });
                    } else {
                        resolve(elements);
                    }
                });
            });
        }

    }
};
customElements.define('bundle-columns-dialog', BundleColumnsDialog);
