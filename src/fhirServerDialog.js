import template from "./templates/FhirServerDialog.html";

import "./components/AppDialog.js"
import "./components/AppButton.js"
import "./components/RoundButton.js"
import "./fhirServerList.js"
import "./fhirServerForm.js"
import { FhirService } from "./services/Fhir.js"
import { SettingsService } from "./services/Settings.js"
import { SnackbarsService } from "./services/Snackbars.js";

class FhirServerDialog extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._editMode = false;
        this._list = null;
        this._form = null;
    }

    connectedCallback() {
        this._list = this._shadow.querySelector('fhir-server-list');
        this._form = this._shadow.querySelector("fhir-server-form");

        this._shadow.querySelector('app-dialog').onClose = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.appDialogClose();
        };

        this._form.onOk = this.serverFormOk;
        this._form.onDelete = this.serverFormDelete;

        this._list.addEventListener('serverchanged', this.serverListClick);

        this._shadow.getElementById("setupAdd").onclick = this.setupAddClick;

        this._shadow.getElementById("setupCancel").onclick = this.setupCancel;

        this._shadow.getElementById("setupOk").onclick = this.setupOk;
        this._shadow.getElementById("setupClose").onclick = this.appDialogClose;

        this._shadow.getElementById("setupToggle").onclick = () => { this.editMode = true };

        this.editMode = false;
        this.loadConf();
    }

    loadConf = () => {
        SettingsService.getAll().then(conf => {
            this._conf = conf;
            this._list.load(conf);
            this._list.value = FhirService.server?.serverCode;
        });
    }

    setupOk = () => {
        SettingsService.setAll(this._conf);
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
            this.dispatchEvent(new CustomEvent("serverchanged", {
                bubbles: false,
                cancelable: false,
                detail: {
                    "serverCode": serverCode,
                    "server": server
                }
            }));
        }
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
            SnackbarsService.show('this configuration already exists',
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
        const dlg = this._shadow.querySelector('app-dialog');
        if (edit) {
            dlg.classList.add("edit");
        } else {
            dlg.classList.remove("edit");
        }
    }
};
customElements.define('fhir-server-dialog', FhirServerDialog);