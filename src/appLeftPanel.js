import template from "./templates/appLeftPanel.html";

import "./components/CircularProgress.js";
import "./fhirMetadata.js";

(function () {
    class AppLeftPanel extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.innerHTML = template;
        }
    };
    customElements.define('app-left-panel', AppLeftPanel);
})();