import React, { useEffect } from 'react';
import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import MultiPoint from 'ol/geom/MultiPoint';
import { Style, Circle, Fill, Stroke } from 'ol/style';

import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import DragPan from 'ol/interaction/DragPan';
import 'ol/ol.css';
import Styles from './web.module.less';
import { locate } from '../../../utils/locate';

const prefix = Math.ceil(Math.random() * 1000);

type MapProps = {
    id?: string;
    center?: [number, number],
    zoom?: number;
    unzoomable?: boolean;
    undragable?: boolean;
    style?: object;
    autoLocate?: boolean;
    markers?: Array<[number, number]>;
}

const DEFAULT_CENTER = [120.123, 30.259];     // 浙大玉泉
const DEFAULT_ZOOM = 15;

export default function Map(props: MapProps) {
    let map: OlMap;
    const { id } = props;
    useEffect(() => {
        map = new OlMap({
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
                })
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
            map.getInteractions().forEach(
                (ele) => {
                    if (ele instanceof DragPan) {
                        ele.setActive(false);
                    }
                }
            );
        }
        if (props.autoLocate) {
            locate().then(
                ({ latitude, longitude }) => {
                    map.getView().setCenter(fromLonLat([longitude, latitude]));
                }
            );
        }
    }, []);

    useEffect(() => {
        if (props.center) {
            map && map.getView().setCenter(fromLonLat(props.center))
        }
    }, [props.center]);

    useEffect(() => {
        // marker好像没有效果，以后再调
        if (props.markers && map) {
            let markerLayer = map.getLayers().get('markLayer') as VectorLayer<VectorSource>;
            if (!markerLayer) {
                markerLayer = new VectorLayer({
                    source: new VectorSource(),
                });
                map.getLayers().set('markLayer', markerLayer);
            }
            let feature = markerLayer.getSource()!.getFeatureById('markers');
            if (feature) {
                feature.setGeometry(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
            }
            else {
                feature = new Feature(new MultiPoint(props.markers.map(ele => fromLonLat(ele))));
                feature.setStyle(
                    new Style({
                        image: new Circle({
                            // 点的颜色
                            fill: new Fill({
                                color: '#F00'
                            }),
                            // 圆形半径
                            radius: 5
                        }),
                        // 线样式
                        stroke: new Stroke({
                            color: '#0F0',
                            lineCap: 'round',       // 设置线的两端为圆头
                            width: 5                
                        }),
                        // 填充样式
                        fill: new Fill({
                            color: '#00F'
                        })
                    })
                );
                feature.setId('markers');
                markerLayer.getSource()!.addFeature(feature);
            }
            map.render();
        }
    }, [props.markers]);

    return <div id={`map-${id || prefix}`} className={Styles.map} style={props.style} />;
};

