import { Snackbars } from "../components/Snackbars.js";

export class SnackbarsService {

    // TODO : Add message queuing

    static {
        this._container = document.body;
    }

    static set container(cnt) {
        this._container = cnt;
    }

    static error(message) {
        this.show(message, undefined, undefined, 'error');
    }

    static show(message, action, delay = 4000, type = 'info') {
        let bar = document.createElement("snack-bars");
        bar.type = type;
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
