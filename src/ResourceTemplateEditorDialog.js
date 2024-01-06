import template from "./templates/ResourceTemplateEditorDialog.html"

import M2Dialog from "./components/M2Dialog"
import ResourceTemplateEditor from "./ResourceTemplateEditor"

export default class ResourceTemplateEditorDialog extends HTMLElement {
    /** @type {M2Dialog} */
    #dialog;
    /** @type {ResourceTemplateEditor} */
    #editor;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        shadow.querySelector('m2-dialog').onClose = this.#dialogOnClose;
        shadow.getElementById("cancel").onclick = this.#dialogOnClose;
        shadow.getElementById("save").onclick = this.#onSave;

        this.#editor = shadow.querySelector('resource-template-editor');
        this.#dialog = shadow.querySelector('m2-dialog');
    }

    #onClose = () => { }
    get onClose() {
        return this.#onClose;
    }
    set onClose(closeFct) {
        this.#onClose = closeFct;
    }

    #dialogOnClose = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.remove();
    }

    #onSave = () => {
        const templates = JSON.parse(localStorage.getItem('templates') || '{}');
        const resourceType = this.#editor.source.resourceType;
        templates[resourceType] = this.#editor.template;
        localStorage.setItem('templates', JSON.stringify(templates));
        this.remove();
        this.#onClose();
    }

    /**
     * @param {Fhir.Resource} resource
     */
    set source(resource) {
        const templates = JSON.parse(localStorage.getItem('templates') || '{}');
        this.#editor.template = templates[resource.resourceType];
        this.#editor.source = resource;
        this.#dialog.dataset.title = `${resource.resourceType} template`;
    }

};
customElements.define('resource-template-editor-dialog', ResourceTemplateEditorDialog);
