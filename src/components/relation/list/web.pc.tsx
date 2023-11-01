import PureList from '../../../components/list';
import FilterPanel from '../../../components/filterPanel';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { assert } from 'oak-domain/lib/utils/assert';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'relation',
        true,
        {
            relations: RowWithActions<ED, 'relation'>[];
            entity: string,
            entities: string[],
            onClicked: (relationId: string) => any;
        }
    >
) {
    const { entities, entity, relations, onClicked } = props.data;

    return <div>待实现</div>
}