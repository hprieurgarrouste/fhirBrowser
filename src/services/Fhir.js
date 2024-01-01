export class FhirService {
    static {
        this._server = null;
        this._serverChangeListener = [];
    }

    static addListener = (callback) => {
        this._serverChangeListener.push(callback);
    }
    static dispatchServerChange = () => {
        this._serverChangeListener.forEach(callback => {
            callback.call();
        })
    }

    /**
     * @returns {Server} Current server
     */
    static get server() {
        return this._server;
    }
    /**
     * @param {Server} srv - Current server
     */
    static set server(srv) {
        if (srv != this._server) {
            this._server = srv;
            this.dispatchServerChange();
        }
    }

    /**
     * Get resource type help url
     * @param {string} resourceType
     * @returns {string}
     */
    static helpUrl(resourceType) {
        return `https://hl7.org/fhir/${this.server.release}/${resourceType.toLowerCase()}.html`;
    }

    /**
     * get structureDefinition from hl7 server
     * @param {string} resourceType
     * @returns {object}
     */
    static async structureDefinition(resourceType) {
        const url = new URL(`https://hl7.org/fhir/${this.server.release}/${resourceType.toLowerCase()}.profile.json`);
        const response = await fetch(url, {
            "cache": "force-cache"
        });
        return response.json();
    }

}