import template from "./templates/SidePanel.html";

import "./RoundButton";
import "./AppBar";


class SidePanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._title = this._shadow.getElementById("title");
    }

    static get observedAttributes() { return ['data-title']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-title' == name) {
            this._title.innerText = newValue;
        }
    }

};
window.customElements.define('side-panel', SidePanel);
