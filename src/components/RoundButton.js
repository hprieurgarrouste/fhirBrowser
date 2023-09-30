import template from "./templates/RoundButton.html";

(function () {
    class RoundButton extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.innerHTML = template;
        }

        static get observedAttributes() { return ["data-icon", "disabled"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            const elm = this._shadow.querySelector("main");
            if ("data-icon" === name) {
                elm.innerText = newValue;
            } else if ("disabled" === name) {
                if (null === newValue) {
                    elm.removeAttribute("disabled");
                } else {
                    elm.setAttribute("disabled", "");
                }
            }
        }

        connectedCallback() {
            this._shadow.addEventListener('click', this._onClick);
        }
        disconnectedCallback() {
            this._shadow.removeEventListener('click', this._onClick);
        }

        _onClick(event) {
            if (event.target.hasAttribute("disabled")) {
                event.stopPropagation();
            }
        }
    }
    customElements.define('round-button', RoundButton);
})();