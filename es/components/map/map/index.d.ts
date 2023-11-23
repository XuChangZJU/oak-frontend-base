import 'ol/ol.css';
type MapProps = {
    id?: string;
    center?: [number, number];
    zoom?: number;
    unzoomable?: boolean;
    undragable?: boolean;
    disableWheelZoom?: boolean;
    style?: object;
    autoLocate?: boolean;
    markers?: Array<[number, number]>;
};
export default function Map(props: MapProps): import("react/jsx-runtime").JSX.Element;
export {};
