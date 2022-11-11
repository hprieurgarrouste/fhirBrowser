import "./components/CircularProgress.js";
import "./fhirMetadata.js";

(function () {
    class AppLeftPanel extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            ::slotted(*) {
                flex: 1 1 auto;
                height: 0;
            }
            circular-progress {
                font-size: 2em;
                text-align: center;
                padding-top: 1em;
            }
        </style>
        <main>
            <circular-progress id="waiting" hidden></circular-progress>
            <slot></slot>
        </main>
    `;

    window.customElements.define('app-left-panel', AppLeftPanel);
})();