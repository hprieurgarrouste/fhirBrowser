import template from "./templates/ListItem.html";

(function () {

    class ListItem extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }

        static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "data-icon":
                    this._shadow.getElementById("icon").innerText = newValue;
                    break;
                case "data-primary":
                    this._shadow.getElementById("primary").innerText = newValue;
                    break;
                case "data-secondary":
                    this._shadow.getElementById("secondary").innerText = newValue;
                    break;
                default:
                    break;
            }
        }
    };

    customElements.define('list-item', ListItem)
})();
