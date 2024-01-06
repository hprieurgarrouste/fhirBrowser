import context from "./Context"

class FhirService {
    #server_url = "https://hl7.org/fhir";
    /**
     * Get resource type help url
     * @param {string} resourceType
     * @returns {string}
     */
    helpUrl(resourceType) {
        return `${this.#server_url}/${context.server.release}/${resourceType.toLowerCase()}.html`;
    }

    /**
     * Get history help url
     * @returns {string}
     */
    historyUrl() {
        return `${this.#server_url}/${context.server.release}//http.html#history.html`;
    }

    /**
     * get structureDefinition from hl7 server
     * @param {string} resourceType
     * @returns {object}
     */
    async structureDefinition(resourceType) {
        const url = new URL(`${this.#server_url}/${context.server.release}/${resourceType.toLowerCase()}.profile.json`);
        const response = await fetch(url, {
            "cache": "force-cache"
        });
        return response.json();
    }

}

export default new FhirService();