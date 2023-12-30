import template from "./templates/Snackbars.html";


class Snackbars extends HTMLElement {
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
customElements.define('snack-bars', Snackbars);

