import { List, Tag, Input, Divider } from 'antd-mobile';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';

import Styles from './web.module.less';

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
        },
        {
            setEntityFilter: (filter: string) => void;
        }
    >
) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;

    if (entities) {
        return (
            <>
                {!entity &&
                    <>
                        <div className={Styles.inputDiv}>
                            <Input
                                placeholder={t('searchTip')}
                                clearable
                                onChange={(val) => setEntityFilter(val)}
                            />
                        </div>
                    </>
                }
                {
                    entities.map(
                        (e) => {
                            const rs = relations.filter(
                                ele => ele.entity === e
                            );
                            return (
                                <List header={t(`${e as string}:name`) + ` (${e as string})`}>
                                    {
                                        rs.map(
                                            (r) => (
                                                <List.Item
                                                    extra={r.entityId && <Tag color='primary' fill='outline'>{t('hasEntityId')}</Tag>}
                                                    onClick={() => onClicked(r.id!)}
                                                >
                                                    {t(`${e as string}:r.${r.name!}`) + ` (${r.name})`}
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