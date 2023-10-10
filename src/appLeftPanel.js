import template from "./templates/appLeftPanel.html";

class AppLeftPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('app-left-panel', AppLeftPanel);
