import template from "./templates/appTab.html";

(function () {
    class AppTab extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }
        connectedCallback() {
            this._shadow.querySelector("main").innerHTML = this.innerHTML;
        }
    };
    customElements.define('app-tab', AppTab);
})();