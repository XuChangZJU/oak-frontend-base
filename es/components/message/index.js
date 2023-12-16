export default OakComponent({
    isList: false,
    formData({ props }) {
        const data = this.consumeMessage();
        if (process.env.OAK_PLATFORM === 'wechatMp') {
            if (data) {
                // lin-ui的message: https://doc.mini.talelin.com/component/response/message.html
                wx.lin.showMessage({
                    type: data.type === 'info'
                        ? 'primary'
                        : data.type || 'primary',
                    content: data.content,
                    icon: data.icon,
                    duration: data.duration,
                    top: data.offset,
                });
            }
            return {};
        }
        return {
            data,
        };
    },
    features: ['message'],
});
