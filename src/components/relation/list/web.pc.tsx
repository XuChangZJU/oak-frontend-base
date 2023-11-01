import React from 'react';
import { Card, Button, Input, Tag } from 'antd'
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import Styles from './web.pc.module.less';

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
                                allowClear
                                onChange={({ currentTarget }) => setEntityFilter(currentTarget.value)}
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
                                <Card
                                    title={t(`${e as string}:name`) + ` (${e as string})`}
                                    style={{ margin: 10 }}
                                >
                                    {
                                        rs.map(
                                            (r) => (
                                                <Button
                                                    type={r.entityId ? 'primary' : 'link' }
                                                    onClick={() => onClicked(r.id!)}
                                                >
                                                    {t(`${e as string}:r.${r.name!}`) + ` (${r.name})`}
                                                </Button>
                                            )
                                        )
                                    }
                                </Card>
                            )
                        }
                    )
                }
            </>
        );
    }

    return null;
}