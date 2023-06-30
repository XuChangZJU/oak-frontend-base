import { ED, ListButtonProps } from '../../../types/AbstractComponent';
import { ReactComponentProps } from '../../../types/Page';

export default OakComponent({
    isList: false,
    properties: {
        item: [] as ListButtonProps[],
    },
}) as <ED2 extends ED, T2 extends keyof ED2>(
    props: ReactComponentProps<
        ED2,
        T2,
        false,
        {
            item: ListButtonProps[]
        }
    >
) => React.ReactElement;