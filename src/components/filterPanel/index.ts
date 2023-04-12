import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';
import assert from 'assert';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    isList: true,
    data: {
        open: false,
        columnsMp: [] as ColumnProps<ED, keyof ED>[],
        moreColumnsMp: [] as ColumnProps<ED, keyof ED>[],
    },
    properties: {
        entity: '' as keyof ED,
        columns: [] as ColumnProps<ED, keyof ED>[],
    },
    lifetimes: {
        async ready() {
            const { columns } = this.props;
            let count = 0;
            columns?.forEach((ele) => {
                if (ele.op === '$text') {
                    count++;
                }
            });
            assert(!(count > 1), '仅支持一项进行全文检索');
            // 小程序最多可显示三个过滤器，剩下的放在折叠面板
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                const columnsMp = columns?.splice(0, 3);
                const moreColumnsMp = columns?.splice(3);
                this.setState({
                    columnsMp,
                    moreColumnsMp,
                })
            }
        }
    },
    methods: {
        getNamedFilters() {
            if (this.state.oakFullpath) {
                const namedFilters = this.features.runningTree.getNamedFilters(
                    this.state.oakFullpath
                );
                return namedFilters;
            }
            return [];
        },
    },
});
