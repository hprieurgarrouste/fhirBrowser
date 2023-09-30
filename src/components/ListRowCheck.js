import template from "./templates/ListRowCheck.html";

(function () {

    class ListRowCheck extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }

        static get observedAttributes() { return ["selected"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            if ("selected" === name) {
                this._shadow.querySelector("input[type=checkbox]").checked = (newValue !== null);
            }
        }
    };

    customElements.define('list-row-check', ListRowCheck);
})();
