import template from "./templates/AppBar.html";

class AppBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
window.customElements.define('app-bar', AppBar);
