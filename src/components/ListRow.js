import template from "./templates/ListRow.html";

(function () {
    class ListRow extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }

        static get observedAttributes() { return ["selected"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            if ("selected" === name) {
                const elm = this._shadow.querySelector("main");
                if (null === newValue) {
                    elm.removeAttribute("selected");
                } else {
                    elm.setAttribute("selected", "");
                }
            }
        }
    };
    customElements.define('list-row', ListRow);
})();
