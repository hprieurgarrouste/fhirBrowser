import template from "./templates/BundleColumnsDialog.html";

import M2List from "./components/M2List";
import M2ListItem from "./components/M2ListItem";
import M2ListRowCheck from "./components/M2ListRowCheck";
import M2LinearProgress from "./components/M2LinearProgress";

import context from "./services/Context"
import fhirService from "./services/Fhir"

export default class BundleColumnsDialog extends HTMLElement {
    /** @type {M2LinearProgress} */
    #progress;
    /** @type {M2List} */
    #list;
    /** @type {String} */
    #resourceType;
    /** @type {String} */
    #serverRelease;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#progress = shadow.querySelector('m2-linear-progress');
        this.#list = shadow.querySelector('m2-list');
        this.#list.onFilter = this.#appListFilter;

        shadow.querySelector('m2-dialog').onClose = this.#appDialogClose;
        shadow.getElementById('btnCancel').onclick = this.#btnCancelClick;
        shadow.getElementById('btnOk').onclick = this.#btnOkClick;
    }

    #btnOkClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.hidden = true;
        const columns = Array.from(this.#list.querySelectorAll('m2-list-row-check[selected]')).map(r => r.dataset.id);
        this.#onValidate(columns);
    }

    #btnCancelClick = () => { this.hidden = true };

    #appListFilter = (value) => {
        const filter = value.toLowerCase();
        this.#list.childNodes.forEach(row => {
            row.hidden = !(row.dataset.id.toLowerCase().includes(filter));
        });
    }

    #appDialogClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    #onValidate = () => { }
    get onValidate() { return this.#onValidate }
    /** @returns {Promise} */
    set onValidate(promise) { this.#onValidate = promise }

    /**
    * @param {String} resourceType
    * @param {Array.<String>} values
    */
    load = (resourceType, values) => {
        if (resourceType === this.#resourceType && context.server.release === this.#serverRelease) {
            this.#checkValues(values);
            return;
        }
        this.#resourceType = resourceType;
        this.#serverRelease = context.server.release;


        this.#progress.hidden = false;
        this.#list.clear();
        this.#sdParse(resourceType, '').then(elements => {
            this.#list.append(...elements
                .sort((e1, e2) => e1.path.localeCompare(e2.path))
                .map(this.#makeRow)
            );
            this.#checkValues(values);
            this.#progress.hidden = true;
        });

    }

    #checkValues = (values) => {
        Array.from(this.#list.querySelectorAll('m2-list-row-check')).forEach(row => {
            if (values.includes(row.dataset.id)) {
                row.setAttribute('selected', '');
            } else {
                row.removeAttribute('selected');
            }
        });
    }

    #makeRow = (element) => {
        const row = new M2ListRowCheck();
        row.setAttribute('data-id', element.id);
        row.append(new M2ListItem(undefined, element.path, element.short));
        return row;
    }

    #sdParse = (resourceType, path) => {
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
                            if (type.match(/^([A-Z][a-z]+)+$/)) {
                                //object
                                subPromises.push(this.#sdParse(type, newPath));
                            } else {
                                //property
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

};
customElements.define('bundle-columns-dialog', BundleColumnsDialog);
