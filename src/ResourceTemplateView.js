import template from "./templates/ResourceTemplateView.html"

import "./components/TextField"
import "./ResourceTemplateEditor"
import "./ResourceTemplateEditorDialog"

class ResourceTemplateView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._template = this._shadow.getElementById('template');
        this._resource = null;
        this._templateEditorButton = this._shadow.querySelector('round-button[class~="fab"]');
        this._templateEditorButton.onclick = this.showEditor;
        this._emptyMsg = this._shadow.getElementById('emptyMsg');
    }

    clear() {
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

    createFieldset = (name) => {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.innerText = name;
        fieldset.appendChild(legend);
        return fieldset;
    }

    createSection = () => {
        const section = document.createElement('section');
        return section
    }

    createField = (name, placeholder) => {
        const textField = document.createElement('text-field');
        textField.id = name;
        textField.setAttribute("placeholder", placeholder);
        textField.setAttribute("readonly", "");
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

    /**
     * @param {object} resource
     */
    set source(resource) {
        if (!resource) return;
        let templates = JSON.parse(localStorage.getItem('templates') || '{}');
        const template = templates[resource.resourceType];
        this._emptyMsg.hidden = template;
        if (template) {
            this.buildTemplate(template);
            this.cleanEmpty();
            this.setValues(resource);
        } else {
            this.clear();
        }
        this._resource = resource;
    }

    cleanEmpty = () => {
        Array.from(this._template.querySelectorAll('section:not(:has(text-field))')).forEach(e => e.remove());
        Array.from(this._template.querySelectorAll('fieldset:not(:has(section))')).forEach(e => e.remove());
    }

    showEditor = () => {
        this._editor = document.createElement('resource-template-editor-dialog');
        this._editor.source = this._resource;
        this._editor.onClose = () => {
            this.source = this._resource;
        }
        document.querySelector('fhir-browser').container.appendChild(this._editor);
    }

};
customElements.define('resource-template-view', ResourceTemplateView);
