import template from "./templates/M2LinearProgress.html"

export default class M2LinearProgress extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('m2-linear-progress', M2LinearProgress)

