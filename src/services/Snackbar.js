import context from './Context'
import M2Snackbar from '../components/M2Snackbar'

class SnackbarService {
    /**
     * Show an error message
     * @param {string} message
     */
    error(message) {
        this.#show(message, 'error')
    }

    /**
     * Show an information message
     * @param {string} message
     */
    info(message) {
        this.#show(message, 'info')
    }

    /**
     * Clear and hide the snackbar
     */
    clear() {
        const nbar = context.appContainer.querySelector('m2-snackbar')
        nbar.type = 'info'
        nbar.innerText = ''
        nbar.hidePopover()
    }

    /**
     * Show a snackbar message
     * @param {string} message
     * @param {{'info':'error'}} [type='info'] - notification color, default 'info'
     * @param {number} [duration=3000] - Display time in milliseconds, default 3000
     */
    #show(message, type = 'info', duration = 3000) {
        /** @type {M2Snackbar} */
        let nbar = context.appContainer.querySelector('m2-snackbar')
        nbar.type = type
        nbar.innerText = message
        nbar.showPopover()
        setTimeout(() => {
            nbar?.hidePopover()
        }, duration)
    }
}

export default new SnackbarService()
