customElements.define('app-text', class AppText extends HTMLElement {
    connectedCallback() {
        let shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                div {
                    font-size: 1em;
                    position:relative;
                    background-color:var(--hover-color, lightgray);
                    border-bottom: 1px solid rgba(0,0,0,42%);
                }
                div:focus-within {
                    border-bottom-color: var(--primary-color, black);
                }
                input {
                    caret-color: var(--primary-color, black);
                    background: none;
                    border: 0 none;
                    padding: 1.3em 1em 1.3em 1em;
                    color:var(--text-color-normal, black);
                }
                input:focus {
                    outline: none;
                    padding: 1.6em 1em 1em 1em;            
                }
                input::placeholder {
                    font-size: 1em;                    
                    color:var(--text-color-disabled, black);
                }
                input:focus::placeholder {
                    visibility: hidden;
                }
                label {
                    color: var(--primary-color, black);
                    font-size: smaller;
                    left: 1em;
                    pointer-events: none;
                    position: absolute;
                    top: 0;
                    visibility: hidden;
                }
                input:focus + label, input:not(:placeholder-shown) + label {
                    visibility: visible;
                }
            </style>
            <div><input type="text" placeholder="${this.getAttribute("placeholder")}"></input><label>${this.getAttribute("placeholder")}</label></div>
        `;
    }
});
