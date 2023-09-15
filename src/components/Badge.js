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
            this._main.innerHTML = this.beautifyNumber(value);
        }

        beautifyNumber(number) {
            if (isNaN(parseFloat(number))) return number
            const nbDigit = number.toString().length;
            const unit = {0: "", 3:" k", 6:" M", 9:" G", 12:" B"};
            const maxOrder = Math.max(...Object.keys(unit).map(parseFloat))
            const order = Math.min(3*Math.floor((nbDigit-1)/3),maxOrder)
            return (number/10**(order)).toFixed((nbDigit%3==1 && nbDigit > 1 && nbDigit<= maxOrder+1)?1:0) + unit[order]
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