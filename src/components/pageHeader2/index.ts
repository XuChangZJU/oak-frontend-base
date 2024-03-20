
import { ReactComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';

export default OakComponent({
    isList: false,
    methods: {
        goBack(delta?: number) {
            this.navigateBack(delta);
        },
    },
    formData({ features }) {
        const menus = features.contextMenuFactory.menus;
        const namespace = features.navigator.getNamespace();

        const location = features.navigator.getLocation();
        const pathname = location.pathname; //当前路由path
        // const pathname2 = pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname
        const allowBack = !menus?.find(
            (ele) =>
                features.navigator
                    .getPathname(ele.url || '', namespace)
                    ?.toLocaleLowerCase() === pathname?.toLocaleLowerCase()
        );

        return {
            allowBack,
        };
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            style?: React.CSSProperties;
            className?: string;
            showHeader?: boolean; //默认true 显示头部
            showBack?: boolean;
            onBack?: () => void;
            backIcon?: React.ReactNode;
            delta?: number; //有返回按钮时，返回第几层
            title?: React.ReactNode;
            subTitle?: React.ReactNode;
            tags?: React.ReactNode;
            extra?: React.ReactNode;
            children?: React.ReactNode;
            content: React.ReactNode;
            contentStyle?: React.CSSProperties;
            contentClassName?: string;
            bodyStyle?: React.CSSProperties;
            bodyClassName?: string;
        }
    >
) => React.ReactElement;
