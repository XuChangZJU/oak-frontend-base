import {
  SettingOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { Popover, Space, Tooltip, Tree, Button, TreeNodeProps} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Style from './index.module.less';
import { TableContext } from '../../listPro/index';
import { getPath, getLabel, resolvePath } from '../../../utils/usefulFn';

function ListItem(props: {
  title: string;
  nodeKey: string;
  showToTop: boolean;
  showToBottom: boolean;
  onSelect: () => void;
  onMoveTop: () => void;
  onMoveBottom: () => void
}) {
  const { t } = useTranslation();
  const { title, onSelect, showToBottom, showToTop, onMoveTop, onMoveBottom } = props;
  return (
    <div className={Style.listItemView} onClick={onSelect}>
      <div className={Style.listItemTitle}>
        {title}
      </div>
      <div className={Style.listIconView}>
        <Tooltip title={t("leftPin")}>
          {showToTop && (
            <div
              className={Style.listIcon}
              onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMoveTop();
              }}
            >
              <VerticalAlignTopOutlined />
            </div>
          )}
        </Tooltip>
        <Tooltip title={t("rightPin")}>
          {showToBottom && (
              <div
                className={Style.listIcon}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveBottom();
                }}
              >
                <VerticalAlignBottomOutlined />
              </div>
            )}
        </Tooltip>
      </div>
    </div>
  )
}

type TreeNode = {
  title: string;
  key: string;
  keyIndex: number
}

function ColumnSetting() {
  const { t } = useTranslation();
  const { tableAttributes, entity, schema, setTableAttributes, onReset } = useContext(TableContext);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
 
  // 初始化treeData, treeData跟随attributes, attributes不会有增删变动
  useEffect(() => {
    const newTreeData: TreeNode[] = [];
    const newCheckedKeys: string[] = [];
    if (schema && entity && tableAttributes) {
        tableAttributes.forEach((ele, index) => {
          const path = getPath(ele.attribute);
          const { entity: entityI18n, attr } = resolvePath(schema, entity, path);
          const title = getLabel(ele.attribute, entityI18n, attr, t);
          newTreeData.push({
            title,
            key: path,
            keyIndex: index,
          })
          if (ele.show) {
            newCheckedKeys.push(path);
          }
        })
    }
    setCheckedKeys(newCheckedKeys);
    setTreeData(newTreeData);
  }, [tableAttributes, schema])
  const move = (path: string, targetPath: string, dropPosition: number) => {
      const newAttributes = [...tableAttributes!];
      const findIndex = newAttributes.findIndex((ele) => getPath(ele.attribute) === path);
      const targetIndex = newAttributes.findIndex(
        (ele) => getPath(ele.attribute) === targetPath,
      );
      const isDownWard = dropPosition > findIndex;
      if (findIndex < 0) return;
      const targetItem = newAttributes[findIndex];
      newAttributes.splice(findIndex, 1);

      if (dropPosition === 0) {
        newAttributes.unshift(targetItem);
      } else {
        newAttributes.splice(
          isDownWard ? targetIndex : targetIndex + 1,
          0,
          targetItem,
        );
      }
      setTableAttributes!(newAttributes);
  };
  // tree的复选框选中,
  const onCheck = (node: TreeNodeProps) => {
    const tableArr = tableAttributes!.find((ele) => getPath(ele.attribute) === node.key);
    if (tableArr) {
      tableArr.show = !tableArr.show;
      setTableAttributes!([...tableAttributes!]);
    }

  }
  const listDom = (
    <Tree
      itemHeight={24}
      draggable={true}
      checkable={true}
      onDrop={(info) => {
        const dropKey = info.node.key as string;
        const dragKey = info.dragNode.key as string;
        const { dropPosition, dropToGap } = info;
        const position =
          dropPosition === -1 || !dropToGap ? dropPosition + 1 : dropPosition;
        move(dragKey, dropKey, position);
      }}
      blockNode
      onCheck={(checkedKeys, e) => {
        onCheck(e.node as TreeNodeProps);
      }}
      titleRender={(node) => (
        <ListItem
          title={node.title as string}
          nodeKey={node.key as string}
          showToTop={node.keyIndex !== 0}
          showToBottom={node.keyIndex !== (treeData.length - 1)}
          onSelect={() => onCheck(node)}
          onMoveTop={() => move(node.key, treeData[0].key, 0)}
          onMoveBottom={() => move(node.key, treeData[treeData.length - 1].key, treeData.length + 1)}
        />
      )}
      checkedKeys={checkedKeys}
      showLine={false}
      treeData={treeData}
    />
  );
  return (
    <Popover
      arrow={false}
      title={
        <div className={Style.titleView}>
          <strong>{t('columnSetting')}</strong>
          <Button type='link' onClick={onReset}>{t('common:reset')}</Button>
        </div>
      }
      trigger="click"
      placement="bottomRight"
      content={
        <Space>{listDom}</Space>
      }
    >
      <Tooltip
          title={t('columnSetting')}
      >
        <div className={Style.iconBox}>
          <SettingOutlined />
        </div>
      </Tooltip>
    </Popover>
  );
}

export default ColumnSetting;