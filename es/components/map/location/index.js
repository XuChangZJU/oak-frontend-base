import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Input, List, Empty, Spin, } from 'antd';
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons';
import Map from '../map';
import Styles from './web.module.less';
export default function Location(props) {
    const [mode, setMode] = useState('dragMap');
    const [searchValue, setSearchValue] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [pois, setPois] = useState();
    const [currentPoi, setCurrentPoi] = useState();
    const searchRef = useRef();
    // 这里不能用useFeatures，因为无法引用lib里面的provider，引用src注入是不行的
    const featureGeo = global.features.geo;
    useEffect(() => {
        if (searchValue?.length > 1) {
            setSearchLoading(true);
            featureGeo.searchPoi(searchValue).then(({ result }) => {
                setSearchLoading(false);
                setPois(result);
                // setCurrentPoi(pois[0]);
            }, (error) => {
                console.warn(error);
                setPois(undefined);
                setSearchLoading(false);
            });
        }
        else {
            setPois(undefined);
        }
    }, [searchValue]);
    const center = currentPoi?.coordinate || props.coordinate;
    const Locate = (_jsx(List, { className: Styles["location-list"], header: _jsx(Input, { ref: searchRef, placeholder: "\u8BF7\u8F93\u5165\u5B8C\u6574\u540D\u79F0\uFF08\u5982\u201C\u6D59\u6C5F\u5927\u5B66\u201D\uFF09\u800C\u975E\u7B80\u79F0\uFF08\u5982\u201C\u6D59\u5927\u201D\uFF09", value: searchValue, allowClear: true, onChange: (e) => {
                setSearchValue(e.target.value);
            }, prefix: _jsx(SearchOutlined, {}), onFocus: () => {
                setMode('searchPoi');
            }, onBlur: () => {
            } }), children: mode === 'searchPoi' && (_jsx(React.Fragment, { children: searchLoading ? (_jsx("div", { className: Styles['location-list-meta'], children: _jsx(Spin, { delay: 0, spinning: true, size: "default" }) })) : (pois?.length
                ? pois.map((poi, index) => {
                    return (_jsx("div", { onClick: () => {
                            setCurrentPoi(poi);
                            props.onLocated({
                                poiName: poi.detail,
                                coordinate: poi.coordinate,
                                areaId: poi.areaId,
                            });
                        }, children: _jsx(List.Item, { actions: [
                                _jsx("div", { style: {
                                        width: 24,
                                    }, children: currentPoi?.id ===
                                        poi.id && (_jsx(CheckCircleFilled, { className: Styles['location-list-checked'] })) }),
                            ], children: _jsx(List.Item.Meta, { title: poi.detail }) }) }, poi.id));
                })
                : (_jsx("div", { className: Styles['location-list-meta'], children: _jsx(Empty, { description: `没有${searchValue}相关的地名搜索结果`, image: Empty.PRESENTED_IMAGE_SIMPLE }) }))) })) }));
    if (window.innerWidth > 480) {
        return (_jsxs(Row, { gutter: [16, 16], style: {
                width: '100%',
                minHeight: 600,
            }, children: [_jsx(Col, { xs: 24, sm: 14, children: _jsx(Map, { style: { height: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) }), _jsx(Col, { xs: 24, sm: 10, children: Locate })] }));
    }
    return (_jsxs(Col, { style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
        }, children: [_jsx(Row, { children: _jsx(Map, { style: { height: 400, width: '100%' }, id: "location-map", center: center, markers: center ? [center] : undefined }) }), _jsx(Row, { style: { flex: 1, marginLeft: 5, marginRight: 5 }, children: Locate })] }));
}
