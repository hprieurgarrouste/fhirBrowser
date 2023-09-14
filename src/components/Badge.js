import "./CircularProgress.js";

(function () {

    class Badge extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.appendChild(template.content.cloneNode(true));
            this._main = this._shadow.querySelector('main')
        }

        spinner() {
            let spinner = document.createElement("circular-progress");
            spinner.setColor('white');
            this._main.appendChild(spinner);
        }

        set(value) {
            this._main.innerHTML = value;
        }

        error(value) {
            this.set(value);
            this._main.setAttribute('class','error material-symbols');
        }

    }

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            circular-progress {
                color: white;
            }

            main {
                align-items: center;
                line-height:1.9em;
                border-radius: 1em;
                background-color: var(--primary-color);
                color: rgb(255, 255, 255);
                padding: 0 0.5em;
                font-size: 0.8em;
                min-width: 1em;
            }
            main.error  {
                background-color: var(--background-error);
                padding: 0 0.4em;
            }
        </style>
        <main></main>
    `;

    window.customElements.define('app-badge', Badge);
})();