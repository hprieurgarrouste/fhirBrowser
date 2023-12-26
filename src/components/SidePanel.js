import template from "./templates/SidePanel.html";

import "./RoundButton";
import "./AppBar";


class SidePanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._title = this._shadow.getElementById("title");
        this._closeButton = this._shadow.getElementById('close');
        this._closeButton.onclick = (event) => {
            this._onClose(event);
        };
    }

    static get observedAttributes() { return ['data-title', 'data-closable']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-title' == name) {
            this._title.innerText = newValue;
        } else if ('data-closable' == name) {
            this._closeButton.hidden = 'true' !== newValue;
        }
    }

    _onClose = (event) => {
        this.classList.add('hidden');
    }
    get onClose() {
        return this._onClose;
    }
    set onClose(closeFct) {
        this._onClose = closeFct;
    }
};
window.customElements.define('side-panel', SidePanel);
