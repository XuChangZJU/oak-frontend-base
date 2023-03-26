"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Map_1 = tslib_1.__importDefault(require("ol/Map"));
var XYZ_1 = tslib_1.__importDefault(require("ol/source/XYZ"));
var Tile_1 = tslib_1.__importDefault(require("ol/layer/Tile"));
var View_1 = tslib_1.__importDefault(require("ol/View"));
var proj_1 = require("ol/proj");
var DragPan_1 = tslib_1.__importDefault(require("ol/interaction/DragPan"));
require("ol/ol.css");
var web_module_less_1 = tslib_1.__importDefault(require("./web.module.less"));
var locate_1 = require("../../../utils/locate");
var prefix = Math.ceil(Math.random() * 1000);
var DEFAULT_CENTER = [120.123, 30.259]; // 浙大玉泉
var DEFAULT_ZOOM = 15;
function Map(props) {
    var map;
    (0, react_1.useEffect)(function () {
        map = new Map_1.default({
            target: "map-".concat(prefix),
            layers: [
                new Tile_1.default({
                    source: new XYZ_1.default({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                        wrapX: false,
                    }),
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
            map.getInteractions().forEach(function (ele) {
                if (ele instanceof DragPan_1.default) {
                    ele.setActive(false);
                }
            });
        }
        if (props.autoLocate) {
            (0, locate_1.locate)().then(function (_a) {
                var latitude = _a.latitude, longitude = _a.longitude;
                map.getView().setCenter((0, proj_1.fromLonLat)([longitude, latitude]));
            });
        }
    }, []);
    (0, react_1.useEffect)(function () {
        if (props.center) {
            map && map.getView().setCenter((0, proj_1.fromLonLat)(props.center));
        }
    }, [props.center]);
    (0, react_1.useEffect)(function () {
        if (props.markers) {
            var markerLayer = map.getLayers().get('markerLayer');
            if (!markerLayer) {
                // todo 
            }
        }
    }, [props.markers]);
    return (0, jsx_runtime_1.jsx)("div", { id: "map-".concat(prefix), className: web_module_less_1.default.map, style: props.style });
}
exports.default = Map;
;
