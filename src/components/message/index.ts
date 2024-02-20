import { MessageProps } from '../../types/Message';

export default OakComponent({
    isList: false,
    formData({ props }) {
        const data = this.consumeMessage() as MessageProps;
        if (data) {
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                // lin-ui的message: https://doc.mini.talelin.com/component/response/message.html
                const type =
                    !data.type || data.type === 'info' ? 'primary' : data.type;
                (wx as any).lin.showMessage({
                    type: type,
                    content: data.content,
                    icon: data.icon,
                    duration: data.duration,
                    top: data.offset,
                });
                return {};
            }

            return {
                data,
            };
        }
        return {};
    },
    features: ['message'],
});
