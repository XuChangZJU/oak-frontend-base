import { AttrUpsertRender, ED, OakAbsAttrUpsertDef, OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import {
    DataUpsertTransformer,
} from '../../types/AbstractComponent';
import { ReactComponentProps } from '../../types/Page';
import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as keyof ED;
    },
    properties: {
        helps: {} as Record<string, string>, // Record<string, string>;
        entity: '' as keyof ED,
        attributes: [] as OakAbsAttrUpsertDef<ED, keyof ED>[],
        data: {} as ED[keyof ED]['Schema'],
        layout: 'horizontal' as 'horizontal' | 'vertical',
        mode: 'default' as 'default' | 'card',
    },
    formData() {
        const { data, entity } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data!);
        const renderData1 = renderData?.map((ele) => {
            const { label, attr, type } = ele;

            let label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    const { entity: refEntity } =
                        ele as OakAbsRefAttrPickerRender<ED, keyof ED>;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = this.t(`${refEntity}:name`);
                    } else {
                        label2 = this.t(`${entity as string}:attr.${attr as string}`);
                    }
                } else {
                    label2 = this.t(`${entity as string}:attr.${attr as string}`);
                }
            }
            Object.assign(ele, { label: label2 });
            return ele;
        });
        return {
            renderData: renderData1,
        };
    },
    data: {
        transformer: (() => []) as DataUpsertTransformer<ED, keyof ED>,
    },
    listeners: {
        data() {
            this.reRender();
        },
    },
    lifetimes: {
        async attached() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();

            const transformer = analyzeDataUpsertTransformer(
                schema,
                entity!,
                attributes!
            );
            this.setState({
                transformer,
            });
        },
    },
}) as <ED2 extends ED, T2 extends keyof ED2, T3 extends keyof ED = keyof ED>(props: ReactComponentProps<ED2, T2, false, {
    helps: Record<string, string>;
    entity: T2;
    attributes: OakAbsAttrUpsertDef<ED2, T2, T3>[];
    data: ED2[T2]['Schema'];
    layout: 'horizontal' | 'vertical';
    mode: 'default' | 'card';
}>) => React.ReactElement;
