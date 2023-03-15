// picker/picker.js
import eventBus from '../core/utils/event-bus.js';
import validator from '../behaviors/validator';
import rules from '../behaviors/rules';
Component({
    /**
     * 组件的属性列表
     */
    options: {
        multipleSlots: true,
    },
    behaviors: ['wx://form-field', validator, rules],
    externalClasses: [
        'l-class',
        'l-label-class',
        'l-error-text',
        'l-error-text-class',
        'l-picker-class',
        'l-row-class',
    ],
    properties: {
        // 选择器的标题，仅安卓可用
        headerText: String,
        // 表单标题（label）的文本
        label: String,
        // 是否隐藏label
        hideLabel: Boolean,
        // 是否自定义label部分
        labelCustom: Boolean,
        // 是否显示下划线
        showRow: {
            type: Boolean,
            value: true,
        },
        // 是否必选
        required: Boolean,
        // 占位文本
        placeholder: {
            type: String,
            value: '请选择',
        },
        range: {
            type: Array,
        },
        // 输入框类型
        mode: {
            type: String,
            value: 'selector',
            options: ['selector', 'multiSelector', 'time', 'date', 'region'],
        },
        rangeKey: {
            type: String,
            value: '',
        },
        rangeValue: {
            type: String,
            value: 'value',
        },
        // 传入的值
        value: {
            type: null,
            optionalTypes: [String, Number],
            value: '',
        },
        // 是否需要冒号
        colon: Boolean,
        // 获取焦点
        focus: Boolean,
        // 是否显示清除按钮
        clear: Boolean,
        showIcon: {
            type: Boolean,
            value: true,
        },
        // 表单项的宽度，单位rpx
        width: {
            type: Number,
            value: null,
        },
        // 表单项标题部分的宽度，单位rpx
        labelWidth: {
            type: Number,
            value: 200,
        },
        // label标题的显示位置 left top right
        labelLayout: {
            type: String,
            value: 'left',
            options: ['left', 'right'],
        },
        // 是否禁用
        disabled: Boolean,
        // 占位文字的样式
        placeholderStyle: String,
    },
    /**
     * 组件的初始数据
     */
    data: {},
    attached() {
        this.valToIndex();
    },
    pageLifetimes: {
        show() {
            this.valToIndex();
        },
    },
    observers: {
        value: function (value) {
            if (value) {
                this.valToIndex();
            }
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        valToIndex() {
            const { value = '', range, rangeKey, rangeValue, mode } = this.data;
            if (mode === 'date' || mode === 'time') {
                return;
            }
            let currentIndex;
            if (rangeKey) {
                // 对象
                currentIndex =
                    range &&
                    range.findIndex((ele) => ele[rangeValue] === value);
            } else {
                //普通数组
                currentIndex = range && range.findIndex((ele) => ele === value);
            }
            if (!(currentIndex >= 0)) {
                currentIndex = '';
            }
            this.setData({
                currentIndex,
            });
        },
        handlePickerChange(event) {
            const { range, rangeKey, rangeValue, mode } = this.data;
            const { detail = {} } = event;
            let value;
            if (!(mode === 'date' || mode === 'time')) {
                const currentIndex = detail.value;
                let data = range[currentIndex];
                if (rangeKey) {
                    value = data && data[rangeValue];
                    detail.value = value;
                } else {
                    value = data;
                    detail.value = value;
                }
                this.setData({
                    currentIndex,
                });
            }
            //  this.validatorData({
            //      [this.data.name]: event.detail.value,
            //  });
            eventBus.emit(`lin-form-change-${this.id}`, this.id);
            this.triggerEvent('linchange', event.detail);
        },
        handlePickerCancel(event) {
            const { detail = {} } = event;
            const { value = '' } = detail;
            this.triggerEvent('lincancel', event.detail);
        },
        onClearTap(event) {
            this.setData({
                value: '',
            });
            this.triggerEvent('linclear', event.detail);
        },
        getValues() {
            return this.data.value;
        },
    },
});
