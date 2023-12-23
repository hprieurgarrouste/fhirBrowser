import template from "./templates/AppDialog.html"

class AppDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._onClose = function () {
            this.hidden = true;
        }
    }

    connectedCallback() {
        this._shadow.querySelector("main").addEventListener("click", (event) => {
            this.onClose(event);
        });
        this._shadow.querySelector('.surface').addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    get onClose() {
        return this._onClose;
    }
    set onClose(closeFct) {
        this._onClose = closeFct;
    }

    static get observedAttributes() { return ["data-title", "centered", "fullscreen"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("centered" == name) {
            this._shadow.querySelector(".surface").classList.add("centered");
        } else if ("fullscreen" == name) {
            this._shadow.querySelector(".surface").classList.add("fullscreen");
        } else if ("data-title" === name) {
            this._shadow.getElementById("title").innerText = newValue;
        }
    }
};
window.customElements.define('app-dialog', AppDialog);
