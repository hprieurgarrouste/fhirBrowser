import template from "./templates/ResourceTemplateEditor.html"

import "./components/AppList"
import "./components/SidePanel"
import "./components/TextField"

import { FhirService } from "./services/Fhir"

class ResourceTemplateEditor extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resource = null;
        this._dragSrcEl = null;
        this._template = this._shadow.getElementById('template');

        const dragZone = this._shadow.querySelector('main');
        dragZone.ondragstart = this.onDragStart;
        dragZone.ondragover = this.onDragOver;
        dragZone.ondragenter = this.onDragEnter;
        dragZone.ondragleave = this.onDragLeave;
        dragZone.ondragend = this.onDragEnd;
        dragZone.ondrop = this.onDragDrop;

        this._list = this._shadow.querySelector('app-list');
        this._list.onFilter = this.dataListFilter;
    }

    dataListFilter = (value) => {
        const filter = value.toLowerCase();
        this._list.childNodes.forEach(row => {
            row.hidden = !row.dataset.id.toLowerCase().includes(filter);
        });
    }

    clear = () => {
        while (this._template.firstChild) this._template.removeChild(this._template.lastChild);
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
            this._template.appendChild(fieldset);
        });
    }

    createFieldset = (name = 'unamed') => {
        const fieldset = document.createElement('fieldset');
        fieldset.setAttribute('draggable', 'true');
        const label = document.createElement('input');
        label.setAttribute('spellcheck', 'false');
        label.type = 'text';
        label.classList.add('label')
        label.value = name;
        fieldset.appendChild(label);
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
        return value || '';
    }


    get source() {
        return this._resource;
    }
    /**
     * @param {object} resource
     */
    set source(resource) {
        this._resource = resource;
        this.loadData(this._resource.resourceType);
        this.setValues(this._resource);
    }

    set template(tpl) {
        if (tpl) {
            this.buildTemplate(tpl);
            this.cleanEmpty();
        } else {
            this.clear();
        }
    }
    get template() {
        let ret = [];
        Array.from(this._template.childNodes)
            .filter(node => 'FIELDSET' == node.nodeName)
            .forEach(fieldset => ret.push(parseFieldset(fieldset)));
        return ret;

        function parseFieldset(fieldset) {
            let fs = {
                'label': '',
                'row': []
            }
            Array.from(fieldset.childNodes).forEach(node => {
                if ('INPUT' == node.nodeName) {
                    fs.label = node.value;
                } else if ('SECTION' == node.nodeName) {
                    fs.row.push(parseSection(node));
                }
            });
            return fs;
        }
        function parseSection(section) {
            let ret = [];
            Array.from(section.childNodes)
                .filter(node => 'TEXT-FIELD' == node.nodeName)
                .forEach(node => ret.push(parseField(node)))
            return ret;
        }
        function parseField(textField) {
            return {
                'placeholder': textField.getAttribute('placeholder'),
                'name': textField.id
            };
        }
    }

    loadData = (resourceType) => {
        this._list.clear();

        this._shadow.querySelector('linear-progress').hidden = false;
        sdParse(resourceType, '').then((elements) => {
            elements.sort((e1, e2) => e1.path.localeCompare(e2.path));
            elements.forEach(element => {
                const item = document.createElement('list-item');
                item.setAttribute("data-icon", 'drag_indicator');
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

    cleanEmpty = () => {
        Array.from(this._template.querySelectorAll('section:not(:has(text-field))')).forEach(e => e.remove());
        Array.from(this._template.querySelectorAll('fieldset:not(:has(section))')).forEach(e => e.remove());
    }

    isDropAvailable = (src, target) => {
        return (src != target) &&
            (
                (target.id == 'template') ||
                (target.closest('#template') == null) ||
                ('FIELDSET' == src.tagName && (
                    'template' == target.id ||
                    'FIELDSET' == target.tagName
                )) ||
                ('SECTION' == src.tagName && (
                    'template' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName
                )) ||
                ('TEXT-FIELD' == src.tagName && (
                    'template' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName ||
                    'TEXT-FIELD' == target.tagName
                )) ||
                ('LIST-ROW' == src.tagName && (
                    'template' == target.id ||
                    'FIELDSET' == target.tagName ||
                    'SECTION' == target.tagName ||
                    'TEXT-FIELD' == target.tagName
                ))
            );
    }

    onDragStart = (event) => {
        this._template.classList.add('drag');
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
            if (target.closest('#template') == null) {
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
                    if ('template' == target.id) {
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
                    if ('template' == target.id) {
                        target.appendChild(src);
                    } else if ('FIELDSET' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                } else if ('SECTION' == src.tagName) {
                    if ('template' == target.id) {
                        const fieldset = this.createFieldset();
                        fieldset.appendChild(src);
                        target.appendChild(fieldset);
                    } else if ('FIELDSET' == target.tagName) {
                        target.appendChild(src);
                    } else if ('SECTION' == target.tagName) {
                        target.parentNode.insertBefore(src, target);
                    }
                } else if ('TEXT-FIELD' == src.tagName) {
                    if ('template' == target.id) {
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
                }
            }
            this.cleanEmpty();
        }

        return false;
    }

    onDragEnd = (event) => {
        this._dragSrcEl.style.opacity = '1';
        this._dragSrcEl = null;
        this._template.classList.remove('drag');
        this._template.querySelectorAll('[class~="over"]').forEach(e => e.classList.remove('over'));
    }

};
customElements.define('resource-template-editor', ResourceTemplateEditor);
