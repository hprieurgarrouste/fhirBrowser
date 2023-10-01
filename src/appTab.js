import template from "./templates/appTab.html";

class AppTab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('app-tab', AppTab);
