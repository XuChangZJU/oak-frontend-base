/// <reference types="react" />
declare type LocationProps = {
    poiName?: string;
    coordinate?: [number, number];
    areaId?: string;
    onSelect: (selected: {
        poiName: string;
        coordinate: [number, number];
        areaId: string;
    }) => void;
};
export default function Location(props: LocationProps): JSX.Element | null;
export {};
