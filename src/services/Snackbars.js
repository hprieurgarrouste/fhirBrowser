import { Snackbars } from "../components/Snackbars.js";

export class SnackbarsService {

    // TODO : Add message queuing

    static error(message) {
        this.show(message, undefined, undefined, 'error');
    }

    static clear() {
        const container = document.querySelector('fhir-browser').container;
        Array.from(container.querySelectorAll('snack-bars')).forEach(msg => msg.remove());
    }

    static show(message, action, delay = 4000, type = 'info') {
        let bar = document.createElement("snack-bars");
        bar.type = type;
        bar.appendChild(document.createTextNode(message));
        if (action) {
            action.setAttribute("slot", "right");
            bar.appendChild(action);
        }
        document.querySelector('fhir-browser').container.appendChild(bar);
        // TODO : disable timeout if action present
        setTimeout(() => {
            bar?.remove();
        }, delay);
    }
}
