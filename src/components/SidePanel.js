import template from "./templates/SidePanel.html";

import "./RoundButton";
import "./AppBar";


class SidePanel extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._title = shadow.getElementById('title');
    }

    static get observedAttributes() { return ['data-title']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-title' == name) {
            this._title.innerText = newValue;
        }
    }

};
window.customElements.define('side-panel', SidePanel);
