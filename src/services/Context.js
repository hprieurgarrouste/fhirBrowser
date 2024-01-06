class Context {
    #server = null;
    #serverChangeListener = [];
    #appContainer = null;

    #dispatchServerChange = () => {
        this.#serverChangeListener.forEach(callback => {
            callback.call();
        })
    }

    addListener = (callback) => {
        this.#serverChangeListener.push(callback);
    }

    /**
     * @returns {Server} Current server
     */
    get server() {
        return this.#server;
    }
    /**
     * @param {Server} srv - Current server
     */
    set server(srv) {
        if (srv != this.#server) {
            this.#server = srv;
            this.#dispatchServerChange();
        }
    }

    get appContainer() {
        return this.#appContainer;
    }
    set appContainer(node) {
        this.#appContainer = node;
    }
}

export default new Context();