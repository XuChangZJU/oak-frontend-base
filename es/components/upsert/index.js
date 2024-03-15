import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';
export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity;
    },
    properties: {
        helps: {}, // Record<string, string>;
        entity: '',
        attributes: [],
        layout: 'horizontal',
        mode: 'default',
    },
    formData({ data }) {
        const { entity } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data);
        const renderData1 = renderData?.map((ele) => {
            const { label, attr, type } = ele;
            let label2 = label;
            if (!label2) {
                if (type === 'ref') {
                    const { entity: refEntity } = ele;
                    if (attr === 'entityId') {
                        // 反指
                        label2 = this.t(`${refEntity}:name`);
                    }
                    else {
                        label2 = this.t(`${entity}:attr.${attr}`);
                    }
                }
                else {
                    label2 = this.t(`${entity}:attr.${attr}`);
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
        transformer: (() => []),
    },
    lifetimes: {
        async attached() {
            const { attributes, entity } = this.props;
            const schema = this.features.cache.getSchema();
            const transformer = analyzeDataUpsertTransformer(schema, entity, attributes);
            this.setState({
                transformer,
            });
        },
    },
    methods: {
        setValueMp(input) {
            const { detail, target: { dataset }, } = input;
            const { attr } = dataset;
            const { value } = detail;
            this.update({ [attr]: value });
        },
        setValueMp1(input) {
            const { detail, target: { dataset }, } = input;
            const { attr } = dataset;
            const { value } = detail;
            const valueShowed = parseFloat(Number(value).toFixed(1)) * 10;
            this.update({ [attr]: valueShowed });
        },
        setValueMp2(input) {
            const { detail, target: { dataset }, } = input;
            const { attr } = dataset;
            const { value } = detail;
            const valueShowed = parseFloat(Number(value).toFixed(2)) * 100;
            this.update({ [attr]: valueShowed });
        },
        setEnumValueMp(input) {
            const { detail, target: { dataset }, } = input;
            const { attr } = dataset;
            const { value } = detail;
            this.update({ [attr]: value });
        },
    },
});
