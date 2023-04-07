import { ED } from '../../types/AbstractComponent';
import { ColumnProps } from '../../types/Filter';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    isList: true,
    data: {
        open: false,
    },
    properties: {
        entity: '' as keyof ED,
        columns: [] as ColumnProps<ED, keyof ED>[],
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
