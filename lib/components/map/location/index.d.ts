/// <reference types="react" />
declare type LocationProps = {
    poiName?: string;
    coordinate?: [number, number];
    areaId?: string;
};
export default function Location(props: LocationProps): JSX.Element;
export {};
