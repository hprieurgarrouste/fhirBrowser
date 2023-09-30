import template from "./templates/LinearProgress.html";

(function () {
    class LinearProgress extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'closed' }).innerHTML = template;
        }
    };
    customElements.define('linear-progress', LinearProgress)
})();
