import template from "./templates/ListRowCheck.html";

class ListRowCheck extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._shadow.querySelector('main').onclick = this.onclick;
        this._checkbox = this._shadow.querySelector("input[type=checkbox]");
    }

    static get observedAttributes() { return ["selected"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("selected" === name) {
            this._checkbox.checked = (newValue !== null);
        }
    }

    onclick = (event) => {
        if (this.getAttribute("selected") !== null) {
            this.removeAttribute("selected");
        } else {
            this.setAttribute("selected", "");
        }
    }
};

customElements.define('list-row-check', ListRowCheck);

