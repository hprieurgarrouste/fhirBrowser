import template from "./templates/fhirResourceForm.html"

import "./components/AppList"
import "./components/SidePanel"
import "./components/TextField"

import { FhirService } from "./services/Fhir"

class FhirResourceForm extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resource = null;
        this._dragSrcEl = null;
    }

    connectedCallback() {
        this._content = this._shadow.getElementById('content');

        const main = this._shadow.querySelector('main');
        main.ondragstart = this.onDragStart;
        main.ondragover = this.onDragOver;
        main.ondragenter = this.onDragEnter;
        main.ondragleave = this.onDragLeave;
        main.ondragend = this.onDragEnd;
        main.ondrop = this.onDragDrop;

        this._list = this._shadow.querySelector('app-list');
        this._list.onFilter = this.dataListFilter;
        this._shadow.querySelector('side-panel').onClose = this.dataPanelClose;
    }

    dataPanelClose = () => {
        this._shadow.querySelector('side-panel').hidden = true;
    }

    dataListFilter = (value) => {
        const filter = value.toLowerCase();
        this._list.childNodes.forEach(row => {
            row.hidden = !row.dataset.id.toLowerCase().includes(filter);
        });
    }

    clear() {
        while (this._content.firstChild) this._content.removeChild(this._content.lastChild);
    }

    buildTemplate = (template) => {
        this.clear();
        template.forEach(section => {
            const fieldset = this.createFieldset(section.label);
            section.row.forEach(row => {
                const section = this.createSection();
                row.forEach(field => {
                    section.appendChild(this.createField(field.name, field.placeholder));
                })
                fieldset.appendChild(section);
            });
            this._content.appendChild(fieldset);
        });
    }

    createFieldset = (name = 'unamed') => {
        const fieldset = document.createElement('fieldset');
        fieldset.setAttribute('draggable', 'true');
        const legend = document.createElement('legend');
        legend.innerText = name;
        fieldset.appendChild(legend);
        return fieldset;
    }

    createSection = () => {
        const section = document.createElement('section');
        section.setAttribute('draggable', 'true');
        return section
    }

    createField = (name, placeholder) => {
        const textField = document.createElement('text-field');
        textField.id = name;
        textField.setAttribute("placeholder", placeholder);
        textField.setAttribute("readonly", "");
        textField.setAttribute('draggable', 'true');
        return textField;
    }

    setValues = (resource) => {
        const fields = Array.from(this._shadow.querySelectorAll("text-field"));
        fields.forEach(field => {
            let value = '';
            if (field.id) {
                value = this.calcValue(resource, field.id)
            }
            field.setAttribute("value", value);
        })
    }

    calcValue = (resource, id) => {
        let value = resource;
        const path = id.split('.');
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
        return value;
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        if (resource.resourceType != this._resource?.resourceType) {
            let templates = JSON.parse(localStorage.getItem('templates') || '{}');
            const template = templates[resource.resourceType];
            if (template) {
                this.buildTemplate(template);
                this.load(resource.resourceType);
            }
        }
        this.setValues(resource);
        this._resource = resource;
    }

    load = (resourceType) => {
        this._list.clear();

        this._shadow.querySelector('linear-progress').hidden = false;
        sdParse(resourceType, '').then((elements) => {
            elements.sort((e1, e2) => e1.path.localeCompare(e2.path));
            elements.forEach(element => {
                const item = document.createElement('list-item');
                item.setAttribute("data-primary", element.path);
                item.setAttribute("data-secondary", element.short);
                const row = document.createElement('list-row');
                row.setAttribute('draggable', 'true');
                row.setAttribute("data-id", element.id);
                row.appendChild(item);
                this._list.appendChild(row);
            });
            this._shadow.querySelector('linear-progress').hidden = true;
        });

        function sdParse(resourceType, path) {
            return new Promise((resolve) => {
                const elements = [];
                FhirService.structureDefinition(resourceType).then((structureDefinition) => {
                    const subPromises = [];
                    structureDefinition.snapshot.element
                        .filter(e => e.type)
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

    isDropAvailable = (src, target) => {
        return (src != target) &&
            (
                (target.id == 'content') ||
                (target.closest('#content') == null) ||
                ('FIELDSET' == src.tagName && (
                    'content' == target.id ||
                    'FIELDSET' == target.tagName
                )) ||
                ('SECTION' == src.tagName && (
                    'content' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName
                )) ||
                ('TEXT-FIELD' == src.tagName && (
                    'content' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName ||
                    'TEXT-FIELD' == target.tagName
                )) ||
                ('LIST-ROW' == src.tagName && (
                    'content' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName ||
                    'TEXT-FIELD' == target.tagName
                ))
            );
    }

    onDragStart = (event) => {
        this._content.classList.add('drag');
        this._dragSrcEl = event.target;
        this._dragSrcEl.style.opacity = '0.4';
    }

    onDragEnter = (event) => {
        event.target?.classList.add('over');
    }

    onDragLeave = (event) => {
        event.target?.classList.remove('over');
    }

    onDragOver = (event) => {
        event.preventDefault();
        if (this.isDropAvailable(this._dragSrcEl, event.target)) {
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
        return false;
    }

    onDragDrop = (event) => {
        event.stopPropagation();
        let target = event.target;
        let src = this._dragSrcEl;
        if (this.isDropAvailable(this._dragSrcEl, target)) {
            if (target.closest('#content') == null) {
                this._dragSrcEl.remove();
            } else {
                if (this._dragSrcEl.parentNode == target.parentNode) {
                    const thArr = Array.from(target.parentNode.childNodes);
                    const srcIdx = thArr.findIndex(th => th == this._dragSrcEl);
                    const tgtIdx = thArr.findIndex(th => th == target);

                    if (srcIdx < tgtIdx) {
                        target = target.nextSibling;
                    }
                }

                if ('LIST-ROW' == src.tagName) {
                    const id = this._dragSrcEl.dataset.id;
                    src = this.createField(id, id.split(".").pop());
                    src.setAttribute('value', this.calcValue(this._resource, id));
                    if ('content' == target.id) {
                        const section = this.createSection();
                        section.appendChild(src);
                        const fieldset = this.createFieldset();
                        fieldset.appendChild(section);
                        target.appendChild(fieldset);
                    } else if ('FIELDSET' == target.tagName) {
                        const section = this.createSection();
                        section.appendChild(src);
                        target.appendChild(section);
                    } else if ('SECTION' == target.tagName) {
                        target.appendChild(src);
                    } else if ('TEXT-FIELD' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                } else if ('FIELDSET' == src.tagName) {
                    if ('content' == target.id) {
                        target.appendChild(src);
                    } else if ('FIELDSET' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                } else if ('SECTION' == src.tagName) {
                    if ('content' == target.id) {
                        const fieldset = this.createFieldset();
                        fieldset.appendChild(src);
                        target.appendChild(fieldset);
                    } else if ('FIELDSET' == target.tagName) {
                        target.appendChild(src);
                    } else if ('SECTION' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                } else if ('TEXT-FIELD' == src.tagName) {
                    if ('content' == target.id) {
                        const section = this.createSection();
                        section.appendChild(src);
                        const fieldset = this.createFieldset();
                        fieldset.appendChild(section);
                        target.appendChild(fieldset);
                    } else if ('FIELDSET' == target.tagName) {
                        const section = this.createSection();
                        section.appendChild(src);
                        target.appendChild(src);
                    } else if ('SECTION' == target.tagName) {
                        target.appendChild(src);
                    } else if ('TEXT-FIELD' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                }
            }
        }

        return false;
    }

    onDragEnd = (event) => {
        this._dragSrcEl.style.opacity = '1';
        this._dragSrcEl = null;
        this._content.classList.remove('drag');
        this._content.querySelectorAll('[class~="over"]').forEach(e => e.classList.remove('over'));
    }


};
customElements.define('fhir-resource-form', FhirResourceForm);
