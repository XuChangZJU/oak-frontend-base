import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ReactComponentProps } from '../../types/Page';

export default OakComponent({
    isList: false,
    methods: {
        goBack(delta?: number) {
            this.navigateBack(delta);
        },
    },
}) as <ED2 extends EntityDict & BaseEntityDict, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            style?: React.CSSProperties;
            className?: string;
            title?: React.ReactNode;
            showBack?: boolean;
            onBack?: () => void;
            backIcon?: React.ReactNode;
            delta?: number; //有返回按钮时，返回第几层
            extra?: React.ReactNode;
            subTitle?: React.ReactNode;
            contentMargin?: boolean; // 设置内容是否有边距 默认true 边距为20px
            contentStyle?: React.CSSProperties;
            contentClassName?: string;
            tags?: React.ReactNode;
            children?: React.ReactNode;
            showHeader?: boolean; //默认true 显示头部
        }
    >
) => React.ReactElement;
