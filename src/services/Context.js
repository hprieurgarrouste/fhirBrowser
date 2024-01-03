class Context {
    _server = null;
    _serverChangeListener = [];
    _appContainer = null;

    _dispatchServerChange = () => {
        this._serverChangeListener.forEach(callback => {
            callback.call();
        })
    }

    addListener = (callback) => {
        this._serverChangeListener.push(callback);
    }

    /**
     * @returns {Server} Current server
     */
    get server() {
        return this._server;
    }
    /**
     * @param {Server} srv - Current server
     */
    set server(srv) {
        if (srv != this._server) {
            this._server = srv;
            this._dispatchServerChange();
        }
    }

    get appContainer() {
        return this._appContainer;
    }
    set appContainer(node) {
        this._appContainer = node;
    }
}

export default new Context();