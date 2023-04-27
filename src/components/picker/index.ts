import { ED } from '../../types/AbstractComponent';
import { RowWithActions } from '../..';

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity as keyof ED;
    },
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
    },
});
