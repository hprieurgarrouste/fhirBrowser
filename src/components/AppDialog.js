import "./RoundButton.js"

(function () {
    class AppDialog extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            this._shadow.getElementById('close').addEventListener("click", () => {
                this.hidden = true;
            });
            this._shadow.querySelector("main").addEventListener("click", () => {
                this.hidden = true;
            });
            this._shadow.querySelector('.surface').addEventListener("click", (event) => {
                event.stopPropagation();
            });
        }
        static get observedAttributes() { return ["data-title"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            if ("data-title" === name) {
                this._shadow.getElementById("title").innerText = newValue;
            }
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                position: absolute;
                top: 0;
                left:0;
                background-color: rgba(0,0,0,32%);
                min-height: 100%;
                min-width: 100%;
            }
            .surface {
                background-color: var(--background-color, white);
                border-radius: 4px;
                height: 50%;
                min-width: 20%;
                max-width: 50%;
                position: absolute;
                top: 60px;
                right: 1em;
            }
            .overlay {
                background-color: rgba(255,255,255,4%);
                color:var(--text-color-normal, white);
                display:flex;
                flex-direction: column;
                font-family: Roboto, Arial, monospace;
                height: 100%;
            }
            #header {
                border-bottom: 1px solid var(--border-color);
            }
            #title {
                margin: 0.5em 0;
            }
            #content {
                overflow:auto;
                flex: 1 1 auto;
                height: 0;
            }
            @media (max-width:480px){
                .surface {
                    top:0;
                    left:0;
                    height: 100%;
                    width:100%;
                    max-width: unset;
                    max-height: unset;
                }
                .overlay {
                    background-color: transparent;
                }
            }
        </style>
        <main>
            <div class="surface">
                <div class="overlay">
                    <section id="header">
                        <app-bar>
                            <round-button id="close" title="Close" data-icon="close" slot="left"></round-button>
                            <h3 id="title" slot="middle"></h3>
                        </app-bar>
                    </section>
                    <section id="content">
                        <slot></slot>
                    </section>
                </div>
            </div>
        </main>
    `;

    window.customElements.define('app-dialog', AppDialog);
})();