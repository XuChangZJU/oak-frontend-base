import { assert } from 'oak-domain/lib/utils/assert';
import React, { useEffect, useState } from 'react';
import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle, Fill } from 'ol/style';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import DragPan from 'ol/interaction/DragPan';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import 'ol/ol.css';
import Styles from './web.module.less';
import { locate } from '../../../utils/locate';
import { Point } from 'ol/geom';
const prefix = Math.ceil(Math.random() * 1000);
const DEFAULT_CENTER = [120.123, 30.259]; // 浙大玉泉
const DEFAULT_ZOOM = 15;
export default function Map(props) {
    const { id } = props;
    const [map, setMap] = useState();
    useEffect(() => {
        const map2 = new OlMap({
            target: `map-${id || prefix}`,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                        wrapX: false,
                    }),
                }),
                new VectorLayer({
                    source: new VectorSource(),
                }),
            ],
            view: new View({
                center: fromLonLat(props.center || DEFAULT_CENTER),
                zoom: props.zoom || DEFAULT_ZOOM,
                minZoom: props.unzoomable ? props.zoom : undefined,
                maxZoom: props.unzoomable ? props.zoom : undefined,
            }),
            controls: props.unzoomable ? [] : undefined,
        });
        if (props.undragable) {
            map2.getInteractions().forEach((ele) => {
                if (ele instanceof DragPan) {
                    ele.setActive(false);
                }
            });
        }
        if (props.disableWheelZoom) {
            map2.getInteractions().forEach((ele) => {
                if (ele instanceof MouseWheelZoom) {
                    ele.setActive(false);
                }
            });
        }
        if (props.autoLocate) {
            locate().then(({ latitude, longitude }) => {
                map2.getView().setCenter(fromLonLat([longitude, latitude]));
            });
        }
        setMap(map2);
    }, []);
    useEffect(() => {
        if (props.center && map) {
            const originCenter = map.getView().getCenter();
            if (originCenter) {
                const oc2 = toLonLat(originCenter);
                if (oc2[0] !== props.center[0] || oc2[1] !== props.center[1]) {
                    map.getView().animate({
                        center: fromLonLat(props.center),
                        duration: 500,
                    });
                }
            }
            else {
                map.getView().setCenter(fromLonLat(props.center));
            }
        }
    }, [props.center]);
    useEffect(() => {
        // marker好像没有效果，以后再调
        if (props.markers && map) {
            const markerLayer = map
                .getAllLayers()
                .find((ele) => ele instanceof VectorLayer);
            assert(markerLayer && markerLayer instanceof VectorLayer);
            let feature = markerLayer.getSource().getFeatureById('markers');
            if (feature) {
                // feature.setGeometry(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
                feature.setGeometry(new Point(fromLonLat(props.markers[0])));
            }
            else {
                // feature = new Feature(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
                feature = new Feature(new Point(fromLonLat(props.markers[0])));
                feature.setStyle(new Style({
                    image: new Circle({
                        // 点的颜色
                        fill: new Fill({
                            color: 'red',
                        }),
                        // 圆形半径
                        radius: 10,
                    }),
                    // 填充样式
                    fill: new Fill({
                        color: 'red',
                    }),
                }));
                feature.setId('markers');
                markerLayer.getSource().addFeature(feature);
            }
            map.render();
        }
    }, [props.markers]);
    return (<div id={`map-${id || prefix}`} className={Styles.map} style={props.style}/>);
}
