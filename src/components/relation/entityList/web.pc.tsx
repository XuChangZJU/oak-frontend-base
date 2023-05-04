import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { Row, Button, Col, Input } from 'antd';
import { useState } from 'react';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        keyof ED,
        true,
        {
            entities: string[];
        },
        {
            onEntityClicked: (entity: string) => void;
        }
    >
) {
    const { entities } = props.data;
    const { onEntityClicked } = props.methods;
    const [ search, setSearch ] = useState('');

    const entities2 = search ? entities?.filter(
        ele => ele.includes(search)
    ) : entities;

    return (
        <>
            <Row>
                <Col span={8} style={{ padding: 20 }}>
                    <Input 
                        onChange={({ currentTarget }) => setSearch(currentTarget.value)}
                        allowClear
                    />
                </Col>
            </Row>
            <Row wrap style={{ width: '100%' }}>
                {
                    entities2?.map(
                        ele => (
                            <Col span={6} style={{ paddingTop: 5, paddingBottom: 5 }}>
                                <Button
                                    type="link"
                                    onClick={() => onEntityClicked(ele)}>
                                    {ele}
                                </Button>
                            </Col>
                        )
                    )
                }
            </Row>
        </>
    );
}