import { assert } from 'oak-domain/lib/utils/assert';
import { getFilterName, getOp, getOp2 } from './utils';
import { resolvePath } from '../../utils/usefulFn';
import dayjs from 'dayjs';
import { set } from 'oak-domain/lib/utils/lodash';
export default OakComponent({
    isList: true,
    formData() {
        const { column } = this.props;
        assert(!!column, 'column缺失');
        const { entityI18n, attrI18n, viewType, attribute } = this.state;
        const { label: _label, selectProps } = column;
        // 兼容小程序和web，数据要在这里处理
        // 小程序, 在这里可以直接使用t进行翻译
        let labelMp = '';
        // 是否需要采用common的i18json
        const isCommonI18n = attrI18n === '$$createAt$$' || attrI18n === '$$updateAt$$' || attrI18n === '$$seq$$' || attrI18n === 'id';
        if (_label) {
            labelMp = _label;
        }
        else if (isCommonI18n) {
            labelMp = this.t(`common::${attrI18n}`);
        }
        else {
            labelMp =
                entityI18n && attrI18n
                    ? this.t(`${entityI18n}:attr.${attrI18n}`)
                    : '';
        }
        // enum类型和布尔类型采用select组件，组合渲染所需的options
        let options = []; // web使用
        let optionsMp = []; // 小程序使用
        if (viewType === 'Select') {
            const enumeration = attribute?.enumeration;
            // weblabel目前只能在render的时候翻译
            if (enumeration) {
                let exclude = [];
                if (selectProps?.exclude) {
                    if (typeof selectProps.exclude === 'string') {
                        exclude = [selectProps.exclude];
                    }
                    else {
                        exclude = selectProps.exclude;
                    }
                }
                options = enumeration
                    .filter((ele) => !exclude.includes(ele))
                    .map((ele) => ({
                    value: ele,
                }));
                optionsMp = enumeration
                    .filter((ele) => !exclude.includes(ele))
                    .map((ele) => ({
                    label: this.t(`${entityI18n}:v.${attrI18n}.${ele}`),
                    value: ele,
                    checked: false,
                }));
            }
            else {
                options = [
                    { value: true },
                    { value: false },
                ];
                optionsMp = [
                    { label: this.t('tip.yes'), value: true, checked: false, },
                    { label: this.t('tip.no'), value: false, checked: false, },
                ];
            }
        }
        // 该方法将attr和算子拼接，作为addNameFilter的#name参数
        const name = getFilterName(column);
        return {
            isCommonI18n,
            options,
            name,
            labelMp,
            optionsMp,
        };
    },
    data: {
        modeMp: '',
        labelMp: '',
        optionsMp: [],
        isCommonI18n: false,
        name: '',
        show: false,
        viewType: '',
        entityI18n: '',
        attrI18n: '',
        attribute: {},
        options: [],
        inputType: '',
        timeStartStr: '', // 小程序选择时间显示
        timeEndStr: '',
        selectedLabel: '',
        minDateMp: new Date(1980, 1, 1).getTime(),
        defaultDateMp: new Date().getTime(),
    },
    properties: {
        entity: '',
        column: {},
    },
    lifetimes: {
        async ready() {
            const { column, entity } = this.props;
            const { attr, dateProps, op } = column;
            const schema = this.features.cache.getSchema();
            const { entity: entityI18n, attrType, attr: attrI18n, attribute } = resolvePath(schema, entity, attr);
            let viewType;
            let inputType;
            // 根据attrType来决定采用什么样类型的组件，datePicker还有类型欠缺
            switch (attrType) {
                case 'money':
                case 'integer':
                case 'float':
                    viewType = 'Input';
                    inputType = 'number';
                    break;
                case 'text':
                case 'varchar':
                    viewType = 'Input';
                    inputType = 'text';
                    break;
                case 'datetime':
                    viewType = dateProps?.range ? 'DatePicker.RangePicker' : 'DatePicker';
                    break;
                case 'boolean':
                case 'enum':
                    viewType = 'Select';
                    break;
                case 'ref':
                    viewType = 'RefAttr';
                    break;
            }
            let modeMp = 'selector';
            if (op && op === '$in' || op === '$nin') {
                modeMp = 'multiSelector';
            }
            this.setState({
                viewType,
                entityI18n,
                attribute,
                attrI18n,
                inputType,
                modeMp,
            }, () => {
                this.reRender();
            });
        }
    },
    methods: {
        searchConfirmMp() {
            this.refresh();
            this.setState({
                show: false,
            });
        },
        onChangeTapMp(event) {
            const { key, checked } = event.detail;
            const { optionsMp, modeMp } = this.state;
            if (modeMp === 'selector') {
                const optionsMp2 = optionsMp.map((ele) => ({
                    label: ele.label,
                    value: ele.value,
                    checked: ele.value === key ? checked : false,
                }));
                this.setState({
                    optionsMp: [...optionsMp2],
                });
            }
            else {
                const option = optionsMp.find((ele) => ele.value === key);
                option?.checked === checked;
                this.setState({
                    optionsMp: [...optionsMp],
                });
            }
        },
        onConfirmSelectMp() {
            const { optionsMp, viewType } = this.state;
            const selectedOptions = optionsMp.filter((ele) => ele.checked);
            const values = selectedOptions.map((ele) => ele.value);
            const labels = selectedOptions.map((ele) => ele.label);
            this.setState({
                selectedLabel: labels.join(' ')
            });
            this.setFilterAndResetFilter(viewType, values);
            this.searchConfirmMp();
        },
        onCancelSelectMp() {
            const { optionsMp } = this.state;
            const optionsMps2 = optionsMp.map((ele) => ({
                label: ele.label,
                value: ele.value,
                checked: false,
            }));
            this.setState({
                optionsMp: optionsMps2,
            });
        },
        bindPickerChangeMp(event) {
            const selectedIndexMp = event.detail.value;
            this.setState({
                selectedIndexMp,
            });
        },
        openPopupMp() {
            this.setState({
                show: true,
            });
        },
        closePopupMp() {
            const { name } = this.state;
            this.removeNamedFilterByName(name);
            this.setState({
                show: false,
            });
        },
        closePopupMp2() {
            const { name, optionsMp } = this.state;
            const optionsMp2 = optionsMp.map((ele) => ({
                label: ele.label,
                value: ele.value,
                checked: false,
            }));
            this.removeNamedFilterByName(name);
            this.setState({
                show: false,
                optionsMp: optionsMp2,
            });
        },
        setValueMp(input) {
            const { viewType } = this.state;
            const { detail, target: { dataset }, } = input;
            const { attr } = dataset;
            const { value } = detail;
            this.setFilterAndResetFilter(viewType, value);
        },
        setTimeStrMp(event) {
            const { viewType } = this.state;
            const value = event.detail;
            if (value instanceof Array) {
                const timeStartStr = dayjs(value[0]).format('YYYY-MM-DD');
                const timeEndStr = dayjs(value[1]).format('YYYY-MM-DD');
                this.setState({
                    timeStartStr,
                    timeEndStr,
                });
            }
            else {
                const timeStartStr = dayjs(value).format('YYYY-MM-DD');
                this.setState({
                    timeStartStr,
                });
            }
            this.setFilterAndResetFilter(viewType, value);
        },
        setFilterAndResetFilter(viewType, value) {
            const { name } = this.state;
            const { column } = this.props;
            if (value === '' ||
                value === undefined ||
                value === null ||
                value?.length === 0) {
                this.removeNamedFilterByName(name);
                return;
            }
            const filter = this.transformFilter(viewType, value);
            this.addNamedFilter({
                filter,
                '#name': name,
            });
        },
        transformFilter(viewType, value) {
            const { column } = this.props;
            const unitOfTime = 'day';
            const { op } = column;
            // 这里只有全文字段和时间戳字段需要特殊处理。
            if (viewType === 'Input' && op === '$text') {
                return set({}, '$text.$search', value);
            }
            if ((viewType === 'Select' || viewType === 'RefAttr') && !op) {
                return set({}, getOp(column), value[0]);
            }
            if (viewType === 'DatePicker') {
                const startTime = dayjs(value)
                    .startOf(unitOfTime)
                    .valueOf();
                const endTime = dayjs(value)
                    .endOf(unitOfTime)
                    .valueOf();
                if (op === '$between') {
                    const values2 = [startTime, endTime];
                    return set({}, getOp(column), values2);
                }
                if (op === '$gt' || op === '$gte') {
                    return set({}, getOp(column), startTime);
                }
                if (op === '$lt' || op === '$lte') {
                    return set({}, getOp(column), endTime);
                }
                return set({}, getOp(column), dayjs(value).valueOf());
            }
            if (viewType === 'DatePicker.RangePicker') {
                const startTime = dayjs(value[0])
                    .startOf(unitOfTime)
                    .valueOf();
                const endTime = dayjs(value[1])
                    .endOf(unitOfTime)
                    .valueOf();
                // range只能是between
                return set({}, getOp2(column, '$between'), [startTime, endTime]);
            }
            return set({}, getOp(column), value);
        },
        getNamedFilter(name) {
            if (this.state.oakFullpath) {
                const filter = this.getFilterByName(name);
                return filter;
            }
        },
    },
});
