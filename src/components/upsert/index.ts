import assert from 'assert';
import { ED, OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import {
    DataUpsertTransformer,
    OakAbsRefAttrPickerDef,
} from '../../types/AbstractComponent';
import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';
import { __assign } from 'tslib';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as any;
    },
    properties: {
        helps: Object, // Record<string, string>;
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
        layout: String, // horizontal | vertical
        mode: String, // 'default' | 'card'
    },
    formData() {
        const { data, entity } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data!);
        const renderData1 = renderData?.map((ele) => {
            const { label, attr, type, required } = ele;

            let label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    const { entity: refEntity } =
                        ele as OakAbsRefAttrPickerRender<ED, keyof ED>;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = this.t(`${refEntity}:name`);
                    } else {
                        label2 = this.t(`${entity}:attr.${attr}`);
                    }
                } else {
                    label2 = this.t(`${entity}:attr.${attr}`);
                }
            }
            Object.assign(ele, { label: label2 });
            return ele;
        });
        return {
            name: 'ddd',
            renderData: renderData1,
        };
    },
    data: {
        transformer: (() => []) as DataUpsertTransformer<ED>,
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

            const transformer = analyzeDataUpsertTransformer<ED>(
                schema,
                entity!,
                attributes!
            );
            this.setState({
                transformer,
            });
        },
    },
});
