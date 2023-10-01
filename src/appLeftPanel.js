import template from "./templates/appLeftPanel.html";

import "./components/CircularProgress.js";

class AppLeftPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('app-left-panel', AppLeftPanel);
