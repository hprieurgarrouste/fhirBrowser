import template from "./templates/ResourceTemplateEditorDialog.html"

class ResourceTemplateEditorDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._shadow.querySelector('app-dialog').onClose = this.dialogOnClose;
        this._shadow.getElementById("cancel").onclick = this.dialogOnClose;
    }

    dialogOnClose = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.remove();
    }

    /**
     * @param {any} resource
     */
    set source(resource) {
        this._shadow.querySelector('resource-template-editor').source = resource;
    }

};
customElements.define('resource-template-editor-dialog', ResourceTemplateEditorDialog);
