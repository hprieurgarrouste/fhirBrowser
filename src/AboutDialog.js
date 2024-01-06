import template from "./templates/AboutDialog.html";

import { version } from '../package.json';

export default class AboutDialog extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.getElementById('closeButton').onclick = this.#appDialogClose;

        shadow.querySelector('m2-dialog').onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#appDialogClose();
        };

        shadow.getElementById('version').innerText = version;
    }

    #appDialogClose = () => this.hidden = true;
}
customElements.define('about-dialog', AboutDialog);
