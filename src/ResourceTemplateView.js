import template from "./templates/ResourceTemplateView.html"

import "./components/M2TextField"
import "./ResourceTemplateEditor"
import "./ResourceTemplateEditorDialog"

import context from "./services/Context"
import M2TextField from "./components/M2TextField"
import ResourceTemplateEditorDialog from "./ResourceTemplateEditorDialog"

export default class ResourceTemplateView extends HTMLElement {
    /** @type {HTMLElement} */
    #template;
    /** @type {HTMLElement} */
    #emptyMsg;
    /** @type {ShadowRoot} */
    #shadowRoot;
    /** @type {Fhir.Resource} */
    #resource;

    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: 'closed' });
        this.#shadowRoot.innerHTML = template;
        this.#template = this.#shadowRoot.getElementById('template');
        this.#shadowRoot.querySelector('m2-round-button[class~="fab"]').onclick = this.#showEditor;
        this.#emptyMsg = this.#shadowRoot.getElementById('emptyMsg');
    }

    clear() {
        while (this.#template.firstChild) this.#template.removeChild(this.#template.lastChild);
    }

    #buildTemplate = (template) => {
        this.clear();
        template.forEach(section => {
            const fieldset = this.#createFieldset(section.label);
            section.row.forEach(row => {
                const section = this.#createSection();
                row.forEach(field => {
                    section.appendChild(this.#createField(field.name, field.placeholder));
                })
                fieldset.appendChild(section);
            });
            this.#template.appendChild(fieldset);
        });
    }

    #createFieldset = (name) => {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.innerText = name;
        fieldset.appendChild(legend);
        return fieldset;
    }

    #createSection = () => {
        const section = document.createElement('section');
        return section
    }

    #createField = (name, placeholder) => {
        const textField = new M2TextField();
        textField.id = name;
        textField.setAttribute("placeholder", placeholder);
        textField.setAttribute("readonly", "");
        return textField;
    }

    #setValues = (resource) => {
        const fields = Array.from(this.#shadowRoot.querySelectorAll("m2-textfield"));
        fields.forEach(field => {
            let value = '';
            if (field.id) {
                value = this.#calcValue(resource, field.id)
            }
            field.setAttribute("value", value);
        })
    }

    #calcValue = (resource, id) => {
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
     * @param {Fhir.resource} resource
     */
    set source(resource) {
        if (!resource) return;
        let templates = JSON.parse(localStorage.getItem('templates') || '{}');
        const template = templates[resource.resourceType];
        this.#emptyMsg.hidden = template;
        if (template) {
            this.#buildTemplate(template);
            this.#cleanEmpty();
            this.#setValues(resource);
        } else {
            this.clear();
        }
        this.#resource = resource;
    }

    #cleanEmpty = () => {
        Array.from(this.#template.querySelectorAll('section:not(:has(m2-textfield))')).forEach(e => e.remove());
        Array.from(this.#template.querySelectorAll('fieldset:not(:has(section))')).forEach(e => e.remove());
    }

    #showEditor = () => {
        const editorDialog = new ResourceTemplateEditorDialog();
        editorDialog.source = this.#resource;
        editorDialog.onClose = () => {
            this.source = this.#resource;
            editorDialog.remove();
        }
        context.appContainer.appendChild(editorDialog);
    }

};
customElements.define('resource-template-view', ResourceTemplateView);
