/// <reference types="react" />
import { OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
declare type Props = {
    value: string | string[];
    type: OakAbsDerivedAttrDef['type'];
    color: string;
};
declare function TableCell(props: Props): JSX.Element;
export default TableCell;
