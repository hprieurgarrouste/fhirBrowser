customElements.define('app-round-button', class AppRoundButton extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'closed' }).innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                #wrapper {
                    padding:8px;
                    cursor:pointer;
                    text-align:center;
                    border:0 none;
                    color: inherit;
                    background-color:transparent;
                }
                #wrapper:hover {
                    background-color:var(--hover-color, rgba(0,0,0,5%));
                    border-radius: 50%;
                }
            </style>
            <div id="wrapper" class="material-icons">${this.innerHTML}</div>
        `;
    }
});
