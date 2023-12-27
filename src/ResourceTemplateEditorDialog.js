import template from "./templates/ResourceTemplateEditorDialog.html"

class ResourceTemplateEditorDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._shadow.querySelector('app-dialog').onClose = this.dialogOnClose;
        this._shadow.getElementById("cancel").onclick = this.dialogOnClose;
        this._shadow.getElementById("save").onclick = this.onSave;
        this._editor = this._shadow.querySelector('resource-template-editor');
    }

    _onClose = () => { }
    get onClose() {
        return this._onClose;
    }
    set onClose(closeFct) {
        this._onClose = closeFct;
    }

    dialogOnClose = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.remove();
    }

    onSave = () => {
        const templates = JSON.parse(localStorage.getItem('templates') || '{}');
        const resourceType = this._editor.source.resourceType;
        templates[resourceType] = this._editor.template;
        localStorage.setItem('templates', JSON.stringify(templates));
        this.remove();
        this._onClose();
    }

    /**
     * @param {any} resource
     */
    set source(resource) {
        const templates = JSON.parse(localStorage.getItem('templates') || '{}');
        this._editor.template = templates[resource.resourceType];
        this._editor.source = resource;
    }

};
customElements.define('resource-template-editor-dialog', ResourceTemplateEditorDialog);
