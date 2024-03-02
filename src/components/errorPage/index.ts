import {
    ED,
} from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
import { ECode } from '../../types/ErrorPage';

const DefaultErrorInfo = {
    [ECode.forbidden]: {
        title: '403 Forbidden',
        desc: '抱歉，您无权限访问此页面。',
        imagePath: './assets/svg/assets-result-403.svg',
    },
    [ECode.notFound]: {
        title: '404 Not Found',
        desc: '抱歉，您访问的页面不存在。',
        imagePath: './assets/svg/assets-result-404.svg',
    },
    [ECode.error]: {
        title: '500 Internal Server Error',
        desc: '抱歉，服务器出错啦！',
        imagePath: './assets/svg/assets-result-500.svg',
    },
    [ECode.networkError]: {
        title: '网络异常',
        desc: '网络异常，请稍后再试。',
        imagePath: './assets/svg/assets-result-network-error.svg',
    },
    [ECode.maintenance]: {
        title: '系统维护中',
        desc: '系统维护中，请稍后再试。',
        imagePath: './assets/svg/assets-result-maintenance.svg',
    },
    [ECode.browserIncompatible]: {
        title: '浏览器版本低',
        desc: '抱歉，您正在使用的浏览器版本过低，无法打开当前网页。',
        imagePath: './assets/svg/assets-result-browser-incompatible.svg',
    },
};

export default OakComponent({
    isList: false,
    properties: {
        code: '',
        title: '',
        desc: '',
        icon: '', //web独有
        imagePath: '', //小程序独有
    },
    lifetimes: {
        ready() {
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                const { title, desc, code, imagePath } = this.props;
                let title2 = title;
                if (code) {
                    this.setState({
                        desc: desc || DefaultErrorInfo[code as ECode].desc,
                        imagePath:
                            imagePath ||
                            DefaultErrorInfo[code as ECode].imagePath,
                    });
                    if (!title2) {
                        title2 = DefaultErrorInfo[code as ECode].title;
                    }
                    wx.setNavigationBarTitle({
                        title: title2,
                    });
                }
            }
        },
    },
    methods: {
        goBack(delta?: number) {
            this.navigateBack(delta);
        },
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            code: ECode;
            title?: string;
            desc?: string;
            children?: React.ReactNode;
            icon?: React.ReactNode;
        }
    >
) => React.ReactElement;
