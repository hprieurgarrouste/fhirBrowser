export default class Schema {
    #schema;

    constructor(schema) {
        this.#schema = schema;
    }

    getDefinitionByResourceType = (resourceType) => {
        return this.getDefinitionByRef(this.#schema.discriminator.mapping[resourceType]);
    }

    getDefinitionByRef = (ref) => {
        return this.#evalRef(ref);
    }

    #evalRef = (ref) => {
        const path = ref.replace(/^#\//, '');
        return path.split('/').reduce((a, b) => a[b], this.#schema);
    }
}