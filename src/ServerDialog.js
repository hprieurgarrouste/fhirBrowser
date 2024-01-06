import template from "./templates/ServerDialog.html";

import M2Dialog from "./components/M2Dialog"

import ServerForm from "./ServerForm"
import ServerList from "./ServerList";

import context from "./services/Context"
import settingsService from "./services/Settings"
import snackbarService from "./services/Snackbar"

export default class ServerDialog extends HTMLElement {
    /** @type {ServerList} */
    #list;
    /** @type {M2Dialog} */
    #appDialog;
    /** @type {ServerForm} */
    #form;
    /** @type {Boolean} */
    #editMode;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#editMode = false;

        this.#list = shadow.querySelector('server-list');
        this.#list.addEventListener('serverchanged', this.#serverListClick);

        this.#form = shadow.querySelector("server-form");
        this.#form.onOk = this.#serverFormOk;
        this.#form.onDelete = this.#serverFormDelete;

        this.#appDialog = shadow.querySelector('m2-dialog');
        this.#appDialog.onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#appDialogClose();
        };

        shadow.getElementById("setupAdd").onclick = this.#setupAddClick;

        shadow.getElementById("setupCancel").onclick = this.#setupCancel;

        shadow.getElementById("setupOk").onclick = this.#setupOk;
        shadow.getElementById("setupClose").onclick = this.#appDialogClose;

        shadow.getElementById("setupToggle").onclick = () => { this.editMode = true };
    }

    connectedCallback() {
        this.editMode = false;
        this.#loadConf();
    }

    #loadConf = () => {
        settingsService.getAll().then(conf => {
            this._conf = conf;
            this.#list.load(conf);
            this.#list.value = context.server?.serverCode;
        });
    }

    #setupOk = () => {
        settingsService.setAll(this._conf);
        this.editMode = false;
        this.#loadConf();
    }

    #setupCancel = () => {
        this.editMode = false;
        this.#loadConf();
    }

    #setupAddClick = () => {
        this.value = '';
        this.#form.value = {
            "serverCode": "",
            "server": { "url": "" }
        };
        this.#form.hidden = false;
    }

    #serverListClick = (event) => {
        const serverCode = event.detail.serverCode;
        const server = this._conf[serverCode];
        if (this.editMode) {
            this.#form.value = { "serverCode": serverCode, "server": server };
            this.#form.hidden = false;
        } else {
            this.editMode = false;
            this.hidden = true;
            event.preventDefault();
            event.stopPropagation();
            this.#onSelect({
                'code': serverCode,
                'configuration': server
            });
        }
    }

    #onSelect = () => { }
    get onSelect() {
        return this.#onSelect;
    }
    set onSelect(callback) {
        this.#onSelect = callback;
    }

    #serverFormDelete = () => {
        const server = this.#form.value;
        const serverCode = server.serverCode;
        delete this._conf[serverCode];
        this.#list.load(this._conf);
        return true;
    }

    #serverFormOk = () => {
        const server = this.#form.value;
        const current = this.value;
        const serverCode = server.serverCode;
        delete server['serverCode'];
        if (current) {
            delete this._conf[current];
        } else if (this._conf[serverCode]) {
            snackbarService.error('this configuration already exists');
            return false;
        }
        this._conf[serverCode] = server;
        this.#list.load(this._conf);
        return true;
    }

    #appDialogClose = () => {
        this.editMode = false;
        this.hidden = true;
    }

    get value() {
        return this.#list.value;
    }
    /**
     * @param {string} serverKey
     */
    set value(serverKey) {
        this.#list.value = serverKey;
    }

    get editMode() {
        return this.#editMode;
    }
    /**
     * @param {boolean} edit
     */
    set editMode(edit) {
        this.#editMode = edit;
        if (edit) {
            this.#appDialog.classList.add("edit");
        } else {
            this.#appDialog.classList.remove("edit");
        }
    }
};
customElements.define('server-dialog', ServerDialog);
