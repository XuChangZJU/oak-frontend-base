"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const assert_1 = require("oak-domain/lib/utils/assert");
const react_1 = require("react");
const Map_1 = tslib_1.__importDefault(require("ol/Map"));
const Feature_1 = tslib_1.__importDefault(require("ol/Feature"));
const XYZ_1 = tslib_1.__importDefault(require("ol/source/XYZ"));
const Vector_1 = tslib_1.__importDefault(require("ol/source/Vector"));
const Tile_1 = tslib_1.__importDefault(require("ol/layer/Tile"));
const Vector_2 = tslib_1.__importDefault(require("ol/layer/Vector"));
const style_1 = require("ol/style");
const View_1 = tslib_1.__importDefault(require("ol/View"));
const proj_1 = require("ol/proj");
const DragPan_1 = tslib_1.__importDefault(require("ol/interaction/DragPan"));
const MouseWheelZoom_1 = tslib_1.__importDefault(require("ol/interaction/MouseWheelZoom"));
require("ol/ol.css");
const web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
const locate_1 = require("../../../utils/locate");
const geom_1 = require("ol/geom");
const prefix = Math.ceil(Math.random() * 1000);
const DEFAULT_CENTER = [120.123, 30.259]; // 浙大玉泉
const DEFAULT_ZOOM = 15;
function Map(props) {
    const { id } = props;
    const [map, setMap] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        const map2 = new Map_1.default({
            target: `map-${id || prefix}`,
            layers: [
                new Tile_1.default({
                    source: new XYZ_1.default({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                        wrapX: false,
                    }),
                }),
                new Vector_2.default({
                    source: new Vector_1.default(),
                }),
            ],
            view: new View_1.default({
                center: (0, proj_1.fromLonLat)(props.center || DEFAULT_CENTER),
                zoom: props.zoom || DEFAULT_ZOOM,
                minZoom: props.unzoomable ? props.zoom : undefined,
                maxZoom: props.unzoomable ? props.zoom : undefined,
            }),
            controls: props.unzoomable ? [] : undefined,
        });
        if (props.undragable) {
            map2.getInteractions().forEach((ele) => {
                if (ele instanceof DragPan_1.default) {
                    ele.setActive(false);
                }
            });
        }
        if (props.disableWheelZoom) {
            map2.getInteractions().forEach((ele) => {
                if (ele instanceof MouseWheelZoom_1.default) {
                    ele.setActive(false);
                }
            });
        }
        if (props.autoLocate) {
            (0, locate_1.locate)().then(({ latitude, longitude }) => {
                map2.getView().setCenter((0, proj_1.fromLonLat)([longitude, latitude]));
            });
        }
        setMap(map2);
    }, []);
    (0, react_1.useEffect)(() => {
        if (props.center && map) {
            const originCenter = map.getView().getCenter();
            if (originCenter) {
                const oc2 = (0, proj_1.toLonLat)(originCenter);
                if (oc2[0] !== props.center[0] || oc2[1] !== props.center[1]) {
                    map.getView().animate({
                        center: (0, proj_1.fromLonLat)(props.center),
                        duration: 500,
                    });
                }
            }
            else {
                map.getView().setCenter((0, proj_1.fromLonLat)(props.center));
            }
        }
    }, [props.center]);
    (0, react_1.useEffect)(() => {
        // marker好像没有效果，以后再调
        if (props.markers && map) {
            const markerLayer = map
                .getAllLayers()
                .find((ele) => ele instanceof Vector_2.default);
            (0, assert_1.assert)(markerLayer && markerLayer instanceof Vector_2.default);
            let feature = markerLayer.getSource().getFeatureById('markers');
            if (feature) {
                // feature.setGeometry(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
                feature.setGeometry(new geom_1.Point((0, proj_1.fromLonLat)(props.markers[0])));
            }
            else {
                // feature = new Feature(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
                feature = new Feature_1.default(new geom_1.Point((0, proj_1.fromLonLat)(props.markers[0])));
                feature.setStyle(new style_1.Style({
                    image: new style_1.Circle({
                        // 点的颜色
                        fill: new style_1.Fill({
                            color: 'red',
                        }),
                        // 圆形半径
                        radius: 10,
                    }),
                    // 填充样式
                    fill: new style_1.Fill({
                        color: 'red',
                    }),
                }));
                feature.setId('markers');
                markerLayer.getSource().addFeature(feature);
            }
            map.render();
        }
    }, [props.markers]);
    return ((0, jsx_runtime_1.jsx)("div", { id: `map-${id || prefix}`, className: web_module_less_1.default.map, style: props.style }));
}
exports.default = Map;
