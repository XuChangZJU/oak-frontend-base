import { List, Tag, Input } from 'antd-mobile';
import Styles from './web.module.less';
export default function render(props) {
    const { entities, entity, relations, onClicked } = props.data;
    const { t, setEntityFilter } = props.methods;
    if (entities) {
        return (<>
                {!entity &&
                <>
                        <div className={Styles.inputDiv}>
                            <Input placeholder={t('searchTip')} clearable onChange={(val) => setEntityFilter(val)}/>
                        </div>
                    </>}
                {entities.map((e) => {
                const rs = relations.filter(ele => ele.entity === e);
                return (<List header={t(`${e}:name`) + ` (${e})`}>
                                    {rs.map((r) => (<List.Item extra={r.entityId && <Tag color='primary' fill='outline'>{t('hasEntityId')}</Tag>} onClick={() => onClicked(r.id)}>
                                                    {t(`${e}:r.${r.name}`) + ` (${r.name})`}
                                                </List.Item>))}
                                </List>);
            })}
            </>);
    }
    return null;
}
