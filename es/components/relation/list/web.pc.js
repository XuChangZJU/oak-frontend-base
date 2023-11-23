import React from 'react';
import { Card, Button, Input } from 'antd';
import Styles from './web.pc.module.less';
export default function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return (<>
                {!entity &&
                <>
                        <div className={Styles.inputDiv}>
                            <Input placeholder={t('searchTip')} allowClear onChange={({ currentTarget }) => setEntityFilter(currentTarget.value)}/>
                        </div>
                    </>}
                {entities.map((e) => {
                const rs = relations.filter(ele => ele.entity === e);
                return (<Card title={t(`${e}:name`) + ` (${e})`} style={{ margin: 10 }}>
                                    {rs.map((r) => (<Button type={r.entityId ? 'primary' : 'link'} onClick={() => onClicked(r.id)}>
                                                    {t(`${e}:r.${r.name}`) + ` (${r.name})`}
                                                </Button>))}
                                </Card>);
            })}
            </>);
    }
    return null;
}
