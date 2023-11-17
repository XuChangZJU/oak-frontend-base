import { assert } from 'oak-domain/lib/utils/assert';
import { getFilterName } from '../filter2/utils';
export default OakComponent({
    isList: true,
    data: {
        isExpandContent: false,
        open: false,
        columnsMp: [],
        moreColumnsMp: [],
    },
    properties: {
        entity: '',
        columns: [],
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
                const columnsMp = columns?.slice(0, 3);
                const moreColumnsMp = columns?.slice(3);
                this.setState({
                    columnsMp,
                    moreColumnsMp,
                });
            }
        }
    },
    methods: {
        getNamedFilters() {
            if (this.state.oakFullpath) {
                const namedFilters = this.features.runningTree.getNamedFilters(this.state.oakFullpath);
                return namedFilters;
            }
            return [];
        },
        toggleExpand() {
            this.setState({
                isExpandContent: !this.state.isExpandContent,
            });
        },
        resetFiltersMp() {
            const { columns } = this.props;
            const filterNames = columns?.map((ele) => getFilterName(ele));
            if (filterNames && filterNames.length) {
                filterNames.forEach((ele) => this.removeNamedFilterByName(ele));
                this.refresh();
            }
        },
        confirmSearchMp() {
            this.refresh();
        }
    },
});
