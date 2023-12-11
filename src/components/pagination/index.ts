import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ReactComponentProps } from '../../types/Page';

export default OakComponent({
    entity() {
        return this.props.entity!;
    },
    properties: {
        entity: '',
    },
    isList: true,
    lifetimes: {
        ready() {
            const { oakPagination } = this.state;
            const { total } = oakPagination || {};
            if (total) {
                this.setState({ total1: total })
            }
        }
    },
    listeners: {
        oakPagination(prev, next) {
            const { oakPagination } = this.state;
            const { total } = oakPagination || {};
            if (!prev.oakPagination && prev.oakPagination !== next.oakPagination) {
                if (total) {
                    this.setState({ total1: total })
                }
            }
        },
    },
    methods: {
        async setTotal() {
            const { oakPagination, total1 } = this.state;
            const { pageSize, total, currentPage, more } = oakPagination || {};
            if (total && pageSize) {
                if (Math.ceil(total1 / pageSize) === currentPage) {
                    this.setState({ total1: total1 + pageSize })
                    // return
                }
            }
        },
        // async setPage(value: number) {
        //     const { oakPagination, total1 } = this.state;
        //     const { pageSize, total, currentPage, more } = oakPagination || {};
        //     if (value && pageSize) {
        //         if ((value * pageSize) > total1) {
        //             this.setState({ total1: value * pageSize })
        //         }
        //         // else {

        //         // }
        //     }
        // }
    }
}) as <ED2 extends EntityDict & BaseEntityDict, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            entity: T2;
            style?: React.CSSProperties;
            className?: string;
            showQuickJumper?: boolean | {
                goButton?: React.ReactNode;
            };
            size?: 'default' | 'small';
            responsive?: boolean;
            role?: string;
            totalBoundaryShowSizeChanger?: number;
            rootClassName?: string;
            showTotal?: (total: number, range: [number, number]) => React.ReactNode;
        }
    >
) => React.ReactElement;

