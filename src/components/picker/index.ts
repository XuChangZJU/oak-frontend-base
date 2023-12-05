import { ED } from '../../types/AbstractComponent';
import { RowWithActions } from '../..';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
    projection() {
        return this.props.projection;
    },
    filters: [
        {
            filter() {
                return this.props.filter;
            }
        },
    ],
    sorters: [
        {
            sorter() {
                return this.props.sorter;
            }
        }
    ],
    formData({ data = [] }) {
        const { title } = this.props;
        return {
            rows: data
        };
    },
    isList: true,
    properties: {
        entity: '' as keyof ED,
        multiple: false,
        onSelect: (() => undefined) as (value: [{ id: string }]) => void,
        title: (() => '') as (row: RowWithActions<ED, keyof ED>) => string,
        titleLabel: '',
        filter: [] as ED[keyof ED]['Selection']['filter'],
        sorter: [] as ED[keyof ED]['Selection']['sorter'],
        projection: {},
    },
});
