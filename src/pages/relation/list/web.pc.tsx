import PureList from '../../../components/list';
import FilterPanel from '../../../components/filterPanel';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import assert from 'assert';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'relation',
        true,
        {
            relations: RowWithActions<ED, 'relation'>[];
            hasRelationEntites: string[];
        },
        {
            onActionClicked: (id: string, entity: keyof ED) => void;
            onRelationClicked: (id: string, entity: keyof ED) => void;
        }
    >
) {
    const { relations, oakLoading, oakFullpath, hasRelationEntites } = props.data;
    const { onActionClicked, onRelationClicked } = props.methods;
    return (
        <>
            <FilterPanel
                entity="relation"
                oakPath={oakFullpath}
                columns={[
                    {
                        attr: 'entity',
                        selectProps: {
                            options: hasRelationEntites ? hasRelationEntites.map(
                                ele => ({
                                    label: ele,
                                    value: ele,
                                })
                            ) : [],
                        }
                    },
                    {
                        attr: 'entityId',
                    },
                ]}
            />
            <PureList
                entity="relation"
                loading={oakLoading}
                data={relations || []}
                attributes={['entity', 'entityId', 'name', 'display']}
                extraActions={[{ action: 'action', label: '动作', show: true }, { action: 'relation', label: '关系', show: true }]}
                onAction={(row: ED['relation']['OpSchema'], action: string) => { 
                    const { id, entity } = row;
                    if (action === 'action') {
                        onActionClicked(id!, entity!);
                    }
                    else {
                        assert(action === 'relation');
                        onRelationClicked(id!, entity!);
                    }
                }}
                // disabledOp={true}
            />
        </>
    );
}