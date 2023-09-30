import template from "./templates/Snackbars.html";

(function () {
    class Snackbars extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }

        set type(type = 'info') {
            this._shadow.querySelector('main').classList.add(type);
        }
    };
    window.customElements.define('snack-bars', Snackbars);
})();
