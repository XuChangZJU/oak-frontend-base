import React, { useEffect } from 'react';
import OlMap from 'ol/Map';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';

import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import DragPan from 'ol/interaction/DragPan';
import 'ol/ol.css';
import Styles from './web.module.less';
import { locate } from '../../../utils/locate';

const prefix = Math.ceil(Math.random() * 1000);

type MapProps = {
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
    useEffect(() => {
        map = new OlMap({
            target: `map-${prefix}`,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                        wrapX: false,
                    }),
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
        if (props.markers) {
            let markerLayer = map.getLayers().get('markerLayer');
            if (!markerLayer) {
                // todo 
            }
        }
    }, [props.markers]);

    return <div id={`map-${prefix}`} className={Styles.map} style={props.style} />;
};

