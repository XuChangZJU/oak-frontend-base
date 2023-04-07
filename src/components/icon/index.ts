
export default OakComponent({
    isList: false,
    wechatMp: {
        externalClasses: ['oak-class'],
    },
    properties: {
        name: '',
        size: 12 as number,
        color: 'primary' as 'primary' | 'success' | 'error' | 'waring' | 'info' | string,
    },
});