import assert from 'assert';
import { ED } from '../../types/AbstractComponent';
import { DataUpsertTransformer, OakAbsRefAttrPickerDef } from '../../types/AbstractComponent';
import { analyzeDataUpsertTransformer } from '../../utils/usefulFn';

export default OakComponent({
    isList: false,
    entity() {
        return this.props.entity as any;
    },
    properties: {
        entity: String,
        attributes: Array,
        data: Object,
        children: Object,
    },
    formData() {
        const { data } = this.props;
        const { transformer } = this.state;
        const renderData = transformer(data!);
        return {
            renderData,
        };
    },
    data: {
        transformer: (() => []) as DataUpsertTransformer<ED>,
        mtoPickerDict: {} as Record<string, OakAbsRefAttrPickerDef<ED, keyof (ED)>>,
        mtoData: {} as Record<string, Array<{
            id: string;
            title: string;
        }>>,
        pickerEntity: undefined as keyof ED | undefined,
        pickerProjection: {} as ED[keyof ED]['Selection']['data'],
        pickerFilter: {} as ED[keyof ED]['Selection']['filter'],
        pickerTitleFn: undefined as ((data: any) => string) | undefined,
        pickerTitleLabel: '',
        pickerAttr: '',
        pickerDialogTitle: '',
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

            const { transformer, mtoPickerDict } = analyzeDataUpsertTransformer<ED>(schema, entity!, attributes!, (k, params) => this.t(k, params));
            this.setState({
                transformer,
                mtoPickerDict,
            });

        },
        ready() {
            const { mtoPickerDict } = this.state;
            for (const k in mtoPickerDict) {
                const { mode, entity, projection, filter, count, title } = mtoPickerDict[k];
                if (mode === 'radio' || mode === 'select') {
                    // radio的要先取数据出来
                    assert(typeof count === 'number' && count <= 10, 'radio类型的外键选择，总数必须小于10');

                    this.refreshData(k);
                }
            }
        }
    },
    methods: {
        async refreshData(attr: string) {
            const data = await this.fetchData(attr);

            this.setState({
                mtoData: Object.assign({}, this.state.mtoData, {
                    [attr]: data,
                })
            });
        },
        async fetchData(attr: string) {
            const { entity, projection, filter, count, title } = this.state.mtoPickerDict[attr];
            const entity2 = attr === 'entityId' ? this.props.data!.entity! : entity;
            const proj = typeof projection === 'function' ? projection() : projection;
            const filter2 = typeof filter === 'function' ? filter() : filter;
            const { data } = await this.features.cache.refresh(entity2 as keyof ED, {
                data: proj,
                filter: filter2,
                indexFrom: 0,
                count,
            });
            const data2 = data.map(
                ele => ({
                    id: ele.id,
                    title: title(ele)!,
                })
            );
            return data2;
        },
        openPicker(attr: string) {
            const { entity, projection, filter, count, title, titleLabel } = this.state.mtoPickerDict[attr];
            const entity2 = attr === 'entityId' ? this.props.data!.entity! : entity;
            const proj = typeof projection === 'function' ? projection() : projection;
            const filter2 = typeof filter === 'function' ? filter() : filter;

            this.setState({
                pickerEntity: entity2,
                pickerProjection: proj,
                pickerFilter: filter2,
                pickerTitleFn: title,
                pickerTitleLabel: titleLabel,
                pickerAttr: attr,
                pickerDialogTitle: `选择${this.t(`${entity2}:name`)}`,
            });
        },
        closePicker() {
            this.setState({
                pickerEntity: undefined,
            });
        }
    }
});