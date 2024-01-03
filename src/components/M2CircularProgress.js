import template from "./templates/M2CircularProgress.html"

class M2CircularProgress extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
}
customElements.define('m2-circular-progress', M2CircularProgress)
