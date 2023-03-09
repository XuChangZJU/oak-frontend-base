
export default OakComponent({
    isList: false,
    wechatMp: {
        externalClasses: ['oak-class'],
    },
    properties: {
        name: {
            type: String,
            value: '',
        },
        size: Number,
        color: {
            type: String,
            value: '',
        },
    },
});