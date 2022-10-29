export class Snackbars {

    // TODO : Add message queuing

    static {
        this._container = document.body;
    }

    static set container(cnt) {
        this._container = cnt;
    }

    static show(message, action, delay = 4000) {
        let bar = document.createElement("app-snackbars");
        bar.appendChild(document.createTextNode(message));
        if (action) {
            action.setAttribute("slot", "right");
            bar.appendChild(action);
        }
        this._container.appendChild(bar);
        // TODO : disable timeout if action present
        setTimeout(() => {
            bar.remove();
        }, delay);
    }
}

customElements.define('app-snackbars', class AppSnackbars extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppSnackbarsTemplate.content.cloneNode(true));
    }

    connectedCallback() {
    }
});

const AppSnackbarsTemplate = document.createElement('template');
AppSnackbarsTemplate.innerHTML = `
    <style>
        main {
            background-color: white;
            border-radius: 4px;
            box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
            bottom: 1em;
            margin: 0 1em;
            min-width: 344px;
            position: absolute;
        }
        .overlay {
            align-items: center;
            background-color: rgba(0,0,0,85%);
            color: white;
            display:flex;
            flex-direction: row;
            font-family: Roboto, Arial, monospace;
            min-height: 48px;
            padding: 0 1em;
        }
        #message {
            flex-grow: 1;
            overflow: hidden;
            padding: 0 1em;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        slot[name="right"] {
            margin-left: 1em;
        }
        @media (max-width:480px){
            main {
                min-width: unset;
                width: calc(100% - 2em);
            }
        }
    </style>
    <main>
        <div class="overlay">
            <div id="message"><slot></slot></div>
            <slot name="right"></slot>
        </div>
    </main>
`;
