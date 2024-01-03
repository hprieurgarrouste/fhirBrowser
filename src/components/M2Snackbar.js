import template from "./templates/M2Snackbar.html"


class M2Snackbar extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._main = shadow.querySelector('main');
    }

    set type(type = 'info') {
        this._main.classList.add(type);
    }
};
customElements.define('m2-snackbar', M2Snackbar);

