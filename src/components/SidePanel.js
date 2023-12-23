import template from "./templates/SidePanel.html";

import "./RoundButton";
import "./AppBar";


class SidePanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._onClose = function () {
            this.classList.add('hidden');
        }
    }

    static get observedAttributes() { return ['data-title', 'data-closable']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-title' == name) {
            this._shadow.getElementById("title").innerText = newValue;
        } else if ('data-closable' == name) {
            const closable = 'true' === newValue;
            this._shadow.getElementById('close').hidden = !closable;
        }
    }

    connectedCallback() {
        this._shadow.getElementById('close').addEventListener("click", (event) => {
            this.onClose(event);
        });
    }

    get onClose() {
        return this._onClose;
    }
    set onClose(closeFct) {
        this._onClose = closeFct;
    }
};
window.customElements.define('side-panel', SidePanel);
