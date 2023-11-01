import { uniq } from 'oak-domain/lib/utils/lodash';

export default OakComponent({
    entity: 'relation',
    isList: true,
    projection: {
        id: 1,
        name: 1,
        display: 1,
        entity: 1,
        entityId: 1,
    },
    formData({ data }) {
        const { filter } = this.state;

        const data2 = filter ? data.filter(
            ele => ele.entity?.includes(filter)
        ) : data;
        const entities = data2 && uniq(data2.map(
            ele => ele.entity
        ));
        return {
            relations: data2 || [],
            entities,
        };
    },
    filters: [
        {
            filter() {
                const { entity, entityId } = this.props;
                const filter = {};
                if (entity) {
                    Object.assign(filter, { entity });
                }
                if (entityId) {
                    Object.assign(filter, {
                        $or: [
                            {
                                entityId: {
                                    $exists: false,
                                },
                            },
                            {
                                entityId,
                            },
                        ],
                    });
                } else {
                    Object.assign(filter, {
                        entityId: {
                            $exists: false,
                        },
                    });
                }
                return filter;
            },
        },
    ],
    properties: {
        entity: '',
        entityId: '',
        onClicked: (relationId: string) => undefined as any,
    },
    data: {
        filter: '',
    },
    methods: {
        setEntityFilter(filter: string) {
            this.setState({
                filter,
            }, () => this.reRender());
        }
    }
});
