import "./RoundButton.js";
import template from "./templates/AppDialog.html";


class AppDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        this._shadow.getElementById('close').addEventListener("click", () => {
            this.hidden = true;
        });
        this._shadow.querySelector("main").addEventListener("click", () => {
            this.hidden = true;
        });
        this._shadow.querySelector('.surface').addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }
    static get observedAttributes() { return ["data-title"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("data-title" === name) {
            this._shadow.getElementById("title").innerText = newValue;
        }
    }
};
window.customElements.define('app-dialog', AppDialog);
