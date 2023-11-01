import { List } from 'antd-mobile';
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
            entities: (keyof ED)[],
            onClicked: (relationId: string) => any;
        }
    >
) {
    const { entities, entity, relations, onClicked } = props.data;

    if (entities) {
        return (
            <>
                {
                    entities.map(
                        (e) => {
                            const rs = relations.filter(
                                ele => ele.entity === e
                            );
                            return (
                                <List header={e}>
                                    {
                                        rs.map(
                                            (r) => (
                                                <List.Item onClick={() => onClicked(r.id!)}>
                                                    {r.name!}
                                                </List.Item>
                                            )
                                        )
                                    }
                                </List>                            
                            )
                        }
                    )    
                }
            </>
        );
    }

    return null;
}