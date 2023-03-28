/// <reference types="react" />
import 'ol/ol.css';
declare type MapProps = {
    id?: string;
    center?: [number, number];
    zoom?: number;
    unzoomable?: boolean;
    undragable?: boolean;
    style?: object;
    autoLocate?: boolean;
    markers?: Array<[number, number]>;
};
export default function Map(props: MapProps): JSX.Element;
export {};
