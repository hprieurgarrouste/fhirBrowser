import template from "./templates/LinearProgress.html";

class LinearProgress extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('linear-progress', LinearProgress)

