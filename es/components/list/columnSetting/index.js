import React, { useContext, useEffect, useState } from 'react';
import { SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined, } from '@ant-design/icons';
import { Popover, Space, Tooltip, Tree, Button } from 'antd';
import Style from './index.module.less';
import { TableContext } from '../../listPro/index';
import { getPath, getLabel } from '../../../utils/usefulFn';
import { useFeatures } from '../../../platforms/web';
function ListItem(props) {
    const features = useFeatures();
    const { disabled, title, onSelect, showToBottom, showToTop, onMoveTop, onMoveBottom, } = props;
    return (<div className={Style.listItemView} onClick={onSelect}>
            <div className={Style.listItemTitle}>{title}</div>
            {!disabled ? (<div className={Style.listIconView}>
                    <Tooltip title={features.locales.t('leftPin')}>
                        {showToTop && (<div className={Style.listIcon} onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveTop();
                }}>
                                <VerticalAlignTopOutlined />
                            </div>)}
                    </Tooltip>
                    <Tooltip title={features.locales.t('rightPin')}>
                        {showToBottom && (<div className={Style.listIcon} onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveBottom();
                }}>
                                <VerticalAlignBottomOutlined />
                            </div>)}
                    </Tooltip>
                </div>) : null}
        </div>);
}
function ColumnSetting() {
    const features = useFeatures();
    const { tableAttributes, entity, schema, setTableAttributes, onReset } = useContext(TableContext);
    const [treeData, setTreeData] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    // 初始化treeData, treeData跟随attributes, attributes不会有增删变动
    useEffect(() => {
        const newTreeData = [];
        const newCheckedKeys = [];
        if (schema && entity && tableAttributes) {
            tableAttributes.forEach((ele, index) => {
                const title = getLabel(ele.attribute.attribute, ele.attribute.entity, ele.attribute.attr, (k, p) => features.locales.t(k, p));
                newTreeData.push({
                    title,
                    key: ele.attribute.path,
                    keyIndex: index,
                    disableCheckbox: ele.disableCheckbox,
                    disabled: ele.disabled,
                });
                if (ele.show) {
                    newCheckedKeys.push(ele.attribute.path);
                }
            });
        }
        setCheckedKeys(newCheckedKeys);
        setTreeData(newTreeData);
    }, [tableAttributes, schema]);
    const move = (path, targetPath, dropPosition) => {
        const newAttributes = [...tableAttributes];
        const findIndex = newAttributes.findIndex((ele) => getPath(ele.attribute.attribute) === path);
        const targetIndex = newAttributes.findIndex((ele) => getPath(ele.attribute.attribute) === targetPath);
        const isDownWard = dropPosition > findIndex;
        if (findIndex < 0)
            return;
        const targetItem = newAttributes[findIndex];
        newAttributes.splice(findIndex, 1);
        if (dropPosition === 0) {
            newAttributes.unshift(targetItem);
        }
        else {
            newAttributes.splice(isDownWard ? targetIndex : targetIndex + 1, 0, targetItem);
        }
        setTableAttributes(newAttributes);
    };
    // tree的复选框选中,
    const onCheck = (node) => {
        const tableArr = tableAttributes.find((ele) => getPath(ele.attribute.attribute) === node.key);
        if (tableArr) {
            tableArr.show = !tableArr.show;
            setTableAttributes([...tableAttributes]);
        }
    };
    const listDom = (<Tree itemHeight={24} draggable={true} checkable={true} onDrop={(info) => {
            const dropKey = info.node.key;
            const dragKey = info.dragNode.key;
            const { dropPosition, dropToGap } = info;
            const position = dropPosition === -1 || !dropToGap
                ? dropPosition + 1
                : dropPosition;
            move(dragKey, dropKey, position);
        }} blockNode onCheck={(checkedKeys, e) => {
            onCheck(e.node);
        }} titleRender={(node) => (<ListItem disabled={node.disabled} title={node.title} nodeKey={node.key} showToTop={node.keyIndex !== 0} showToBottom={node.keyIndex !== treeData.length - 1} onSelect={() => onCheck(node)} onMoveTop={() => move(node.key, treeData[0].key, 0)} onMoveBottom={() => move(node.key, treeData[treeData.length - 1].key, treeData.length + 1)}/>)} checkedKeys={checkedKeys} showLine={false} treeData={treeData}/>);
    return (<Popover arrow={false} title={<div className={Style.titleView}>
                    <strong>{features.locales.t('columnSetting')}</strong>
                    <Button type="link" onClick={onReset}>
                        {features.locales.t('common::reset')}
                    </Button>
                </div>} trigger="click" placement="bottomRight" content={<Space>{listDom}</Space>}>
            <Tooltip title={features.locales.t('columnSetting')}>
                <div className={Style.iconBox}>
                    <SettingOutlined />
                </div>
            </Tooltip>
        </Popover>);
}
export default ColumnSetting;
