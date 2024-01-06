import context from "./Context"
import M2Snackbar from "../components/M2Snackbar"

class SnackbarService {

    // TODO : Add message queuing

    /**
     * @param {String} message
     */
    error(message) {
        this.show(message, undefined, undefined, 'error');
    }

    clear() {
        Array.from(context.appContainer.querySelectorAll('m2-snackbar')).forEach(msg => msg.remove());
    }

    show(message, action, delay = 4000, type = 'info') {
        let bar = new M2Snackbar();
        bar.type = type;
        bar.appendChild(document.createTextNode(message));
        if (action) {
            action.setAttribute("slot", "right");
            bar.appendChild(action);
        }
        context.appContainer.appendChild(bar);
        // TODO : disable timeout if action present
        setTimeout(() => {
            bar?.remove();
        }, delay);
    }
}

export default new SnackbarService();