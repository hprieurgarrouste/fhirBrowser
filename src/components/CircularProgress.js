import template from "./templates/circularProgress.html";

(function () {
    class CircularProgress extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.innerHTML = template;
        }

        setColor(color) {
            const main = this._shadow.querySelector('main')
            main.setAttribute('style', 'color:' + color + ';')
        }
    }
    customElements.define('circular-progress', CircularProgress)
})();
