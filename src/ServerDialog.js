import template from "./templates/ServerDialog.html";

import "./components/M2Button"
import "./components/M2Dialog"
import "./components/M2RoundButton"

import "./ServerList"
import "./ServerForm"

import context from "./services/Context"
import settingsService from "./services/Settings"
import snackbarService from "./services/Snackbar"

class ServerDialog extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._editMode = false;

        this._list = shadow.querySelector('server-list');
        this._list.addEventListener('serverchanged', this.serverListClick);

        this._form = shadow.querySelector("server-form");
        this._form.onOk = this.serverFormOk;
        this._form.onDelete = this.serverFormDelete;

        this._appDialog = shadow.querySelector('m2-dialog');
        this._appDialog.onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.appDialogClose();
        };

        shadow.getElementById("setupAdd").onclick = this.setupAddClick;

        shadow.getElementById("setupCancel").onclick = this.setupCancel;

        shadow.getElementById("setupOk").onclick = this.setupOk;
        shadow.getElementById("setupClose").onclick = this.appDialogClose;

        shadow.getElementById("setupToggle").onclick = () => { this.editMode = true };
    }

    connectedCallback() {
        this.editMode = false;
        this.loadConf();
    }

    loadConf = () => {
        settingsService.getAll().then(conf => {
            this._conf = conf;
            this._list.load(conf);
            this._list.value = context.server?.serverCode;
        });
    }

    setupOk = () => {
        settingsService.setAll(this._conf);
        this.editMode = false;
        this.loadConf();
    }

    setupCancel = () => {
        this.editMode = false;
        this.loadConf();
    }

    setupAddClick = () => {
        this.value = '';
        this._form.value = {
            "serverCode": "",
            "server": { "url": "" }
        };
        this._form.hidden = false;
    }

    serverListClick = (event) => {
        const serverCode = event.detail.serverCode;
        const server = this._conf[serverCode];
        if (this.editMode) {
            this._form.value = { "serverCode": serverCode, "server": server };
            this._form.hidden = false;
        } else {
            this.editMode = false;
            this.hidden = true;
            event.preventDefault();
            event.stopPropagation();
            this._onSelect({
                'code': serverCode,
                'configuration': server
            });
        }
    }

    _onSelect = () => { }
    get onSelect() {
        return this._onSelect;
    }
    set onSelect(callback) {
        this._onSelect = callback;
    }

    serverFormDelete = () => {
        const server = this._form.value;
        const serverCode = server.serverCode;
        delete this._conf[serverCode];
        this._list.load(this._conf);
        return true;
    }

    serverFormOk = () => {
        const server = this._form.value;
        const current = this.value;
        const serverCode = server.serverCode;
        delete server['serverCode'];
        if (current) {
            delete this._conf[current];
        } else if (this._conf[serverCode]) {
            snackbarService.show('this configuration already exists',
                undefined,
                undefined,
                'error'
            );
            return false;
        }
        this._conf[serverCode] = server;
        this._list.load(this._conf);
        return true;
    }

    appDialogClose = () => {
        this.editMode = false;
        this.hidden = true;
    }

    get value() {
        return this._list.value;
    }
    /**
     * @param {string} serverKey
     */
    set value(serverKey) {
        this._list.value = serverKey;
    }

    get editMode() {
        return this._editMode;
    }
    /**
     * @param {boolean} edit
     */
    set editMode(edit) {
        this._editMode = edit;
        if (edit) {
            this._appDialog.classList.add("edit");
        } else {
            this._appDialog.classList.remove("edit");
        }
    }
};
customElements.define('server-dialog', ServerDialog);
