import { ED, OakAbsDerivedAttrDef } from '../../../types/AbstractComponent';
import { ReactComponentProps } from '../../../types/Page';

export default OakComponent({
    isList: false,
    properties: {
        value: '',
        type: '',
        color: '',
        linkUrl: '',
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            value: string | string[];
            type: OakAbsDerivedAttrDef['type'],
            color: string;
            linkUrl: string;
        }
    >
) => React.ReactElement;