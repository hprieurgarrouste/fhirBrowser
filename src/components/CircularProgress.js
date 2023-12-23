import template from "./templates/circularProgress.html";

class CircularProgress extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }
}
customElements.define('circular-progress', CircularProgress)
