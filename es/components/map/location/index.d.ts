type LocationProps = {
    poiName?: string;
    coordinate?: [number, number];
    areaId?: string;
    onLocated: (selected: {
        poiName: string;
        coordinate: [number, number];
        areaId: string;
    }) => void;
};
export type Poi = {
    id: string;
    areaId: string;
    poiName: string;
    detail: string;
    coordinate: [number, number];
};
export default function Location(props: LocationProps): import("react/jsx-runtime").JSX.Element;
export {};
