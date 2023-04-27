import assert from 'assert';
import { ED, OakAbsRefAttrPickerRender } from '../../types/AbstractComponent';
import { OakAbsRefAttrPickerDef } from '../../types/AbstractComponent';


export default OakComponent({
    isList: false,
    /* entity() {
        return this.props.pickerDef!.entity as keyof ED;
    }, */
    properties: {
        multiple: false,
        entityId: '',
        entityIds: [] as string[],
        pickerRender: {} as OakAbsRefAttrPickerRender<ED, keyof ED>,      // OakAbsRefAttrPickerRender
        onChange: (() => undefined) as (value: string[]) => void,
    },
    formData() {
        const { multiple, entityIds, pickerRender } = this.props;
        const { entity, projection, title } = pickerRender as OakAbsRefAttrPickerRender<ED, keyof ED>;
        const rows = entityIds && this.features.cache.get(entity, {
            data: typeof projection === 'function' ? projection() : projection,
            filter: {
                id: {
                    $in: entityIds,
                },
            },
        });
        const renderValue = rows && rows.map(
            (row) => title(row)
        ).join(',');
        return {
            renderValue,
        };
    },
    data: {
        data: undefined as { id: string, title: string }[] | undefined,        
    },
    listeners: {
        entityId() {
            this.reRender();
        },
        entityIds() {
            this.reRender();
        }
    },
    lifetimes: {
        async ready() {
            this.refreshData();            
        }
    },
    methods: {
        async refreshData() {
            const { pickerRender, multiple } = this.props;
            const { mode, entity, projection, filter, count, title } = pickerRender as OakAbsRefAttrPickerDef<ED, keyof ED>;
            if (mode === 'radio') {
                // radio的要先取数据出来
                assert(typeof count === 'number' && count <= 5, 'radio类型的外键选择，总数必须小于5');
            }
            else if (mode === 'select') {
                // select也先取（可以点击再取，但这样初始状态不好渲染）
                assert(!multiple, '选择为多项时不支持multiple');
                assert(typeof count === 'number' && count <= 20, 'select类型的外键选择，总数必须小于20');
            }
            else {
                return;
            }
            
            const proj = typeof projection === 'function' ? projection() : projection;
            const filter2 = typeof filter === 'function' ? filter() : filter;
            const { data } = await this.features.cache.refresh(entity, {
                data: proj,
                filter: filter2,
                indexFrom: 0,
                count,
            });
            const data2 = data.map(
                ele => ({
                    id: ele.id!,
                    title: title(ele)!,
                })
            );
            this.setState({
                data: data2,
            });
        },
    }
});