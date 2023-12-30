import template from "./templates/circularProgress.html";

class CircularProgress extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
}
customElements.define('circular-progress', CircularProgress)
