import template from "./templates/AboutDialog.html";


class AboutDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;

        this._shadow.getElementById('closeButton').onclick = this.appDialogClose;
        this._shadow.querySelector('app-dialog').onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.appDialogClose();
        };
    }

    appDialogClose = () => {
        this.hidden = true
    }
}
customElements.define('about-dialog', AboutDialog);
