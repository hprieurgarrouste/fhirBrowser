import template from "./templates/AppBar.html";

(function () {
    class AppBar extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'closed' }).innerHTML = template;
        }
    };
    window.customElements.define('app-bar', AppBar);
})();