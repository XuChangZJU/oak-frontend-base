import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Space, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ButtonGroup from '../buttonGroup';
import ColumnSetting from '../columnSetting';
import { useFeatures } from '../../../platforms/web';
import Style from './index.module.less';
function ToolBar(props) {
    const { title, buttonGroup, reload } = props;
    const features = useFeatures();
    return (_jsxs("div", { className: Style.toolbarContainer, children: [_jsx("div", { className: Style.title, children: title }), _jsx("div", { className: Style.toolbarRight, children: _jsxs(Space, { children: [buttonGroup && buttonGroup.length > 0 && (_jsx(ButtonGroup, { items: buttonGroup })), _jsx(Tooltip, { title: features.locales.t('reload'), children: _jsx("div", { className: Style.reloadIconBox, onClick: () => {
                                    reload();
                                }, children: _jsx(ReloadOutlined, {}) }) }), _jsx(ColumnSetting, {})] }) })] }));
}
export default ToolBar;
