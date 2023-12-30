import template from "./templates/AboutDialog.html";


class AboutDialog extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.getElementById('closeButton').onclick = this.appDialogClose;

        shadow.querySelector('app-dialog').onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.appDialogClose();
        };
    }

    appDialogClose = () => this.hidden = true;
}
customElements.define('about-dialog', AboutDialog);
