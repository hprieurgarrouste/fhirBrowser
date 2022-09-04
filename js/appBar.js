customElements.define('app-bar', class AppBar extends HTMLElement {
    connectedCallback() {
        let shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                div {
                    background-color: var(--primary-color, #000);
                    text-transform: uppercase;
                    color:#FFF; 
                    padding:24px;
                    display:flex;
                    flex-direction:row;
                    align-items:center;
                }
                i {
                    margin-right: 16px;
                    cursor: pointer;
                }
            </style>
            <div><i id="menu" class="material-icons">menu</i><span>${this.getAttribute("title")}</span></div>
        `;
        shadow.getElementById("menu").addEventListener("click", () => {
            this._menuCallback();
        });
    }
    /**
     * @param {function} callback
     */
    set onMenuClick(callback) {
        this._menuCallback = callback;
    }
});
