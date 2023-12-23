import template from "./templates/ResourceTemplateView.html"

import "./components/TextField"

class ResourceTemplateView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._form = null;
    }

    connectedCallback() {
        this._form = this._shadow.getElementById('form');
    }

    clear() {
        while (this._form.firstChild) this._form.removeChild(this._form.lastChild);
        const p = document.createElement('p');
        p.innerHTML = "There is no template yet for this type of resource.<br/>To create your own, click on the 'EDIT TEMPLATE' button."
        this._form.appendChild(p);
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
            this._form.appendChild(fieldset);
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
        return value;
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        let templates = JSON.parse(localStorage.getItem('templates') || '{}');
        const template = templates[resource.resourceType];
        if (template) {
            this.buildTemplate(template);
            this.cleanEmpty();
            this.setValues(resource);
        } else {
            this.clear();
        }
    }

    cleanEmpty = () => {
        Array.from(this._form.querySelectorAll('section:not(:has(text-field))')).forEach(e => e.remove());
        Array.from(this._form.querySelectorAll('fieldset:not(:has(section))')).forEach(e => e.remove());
    }

};
customElements.define('resource-template-view', ResourceTemplateView);
