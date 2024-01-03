import template from "./templates/M2AppBar.html"

class M2AppBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
window.customElements.define('m2-app-bar', M2AppBar);
