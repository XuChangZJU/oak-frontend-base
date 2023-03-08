export default OakComponent({
    isList: false,
    formData({ props, features }) {
        const colorDict = features.style.getColorDict();
        const dataSchema = features.cache.getSchema();
        return {
            colorDict,
            dataSchema,
        }
    },
    properties: {
    },
    data: {
    },
    lifetimes: {
    },
    methods: {
    },
});
