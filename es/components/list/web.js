import React, { useState } from 'react';
import { Spin } from 'antd';
import ActionBtn from '../actionBtn';
import styles from './mobile.module.less';
import { Checkbox } from 'antd-mobile';
import RenderCell from './renderCell';
export default function Render(props) {
    const { methods, data } = props;
    const { t } = methods;
    const { oakLoading, entity, extraActions, mobileData, onAction, disabledOp = false, rowSelection } = data;
    const useSelect = !!rowSelection?.type;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    return (<div className={styles.container}>
            {oakLoading ? (<div className={styles.loadingView}>
                    <Spin size='large'/>
                </div>) : (<>
                    {mobileData && mobileData.map((ele) => (<div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {useSelect && (<Checkbox checked={selectedRowKeys.includes(ele.record.id)} onChange={(checked) => {
                        if (checked) {
                            selectedRowKeys.push(ele.record.id);
                            setSelectedRowKeys([...selectedRowKeys]);
                        }
                        else {
                            const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record.id);
                            selectedRowKeys.splice(index, 1);
                            setSelectedRowKeys([...selectedRowKeys]);
                        }
                    }}/>)}
                            <div className={styles.card} onClick={() => {
                    const index = selectedRowKeys.findIndex((ele2) => ele2 === ele.record?.id);
                    let keys = selectedRowKeys;
                    if (rowSelection?.type === 'checkbox') {
                        if (index !== -1) {
                            keys.splice(index, 1);
                        }
                        else {
                            keys.push(ele.record?.id);
                        }
                        setSelectedRowKeys([...selectedRowKeys]);
                    }
                    else {
                        keys = [ele.record?.id];
                        setSelectedRowKeys([ele.record?.id]);
                    }
                    rowSelection?.onChange && rowSelection?.onChange(keys, ele.record, { type: rowSelection.type === 'checkbox' ? 'multiple' : 'single' });
                }}>
                                <div className={styles.cardContent}>
                                    {ele.data.map((ele2) => (<div className={styles.textView}>
                                            <div className={styles.label}>
                                                {ele2.label}
                                            </div>
                                            <div className={styles.value}>
                                                <RenderCell value={ele2.value} type={ele2.type}/>
                                            </div>
                                        </div>))}
                                </div>
                                {!disabledOp && (<div style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
                                        <ActionBtn entity={entity} extraActions={extraActions} actions={ele.record?.['#oakLegalActions']} cascadeActions={ele.record?.['#oakLegalCascadeActions']} onAction={(action, cascadeAction) => onAction && onAction(ele.record, action, cascadeAction)}/>
                                    </div>)}
                            </div> 
                        </div>))}
                </>)}
        </div>);
}
