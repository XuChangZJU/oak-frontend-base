export default OakComponent({
    properties: {
        value: [],
        option: [],
        onSelect: (v) => undefined,
        disabled: false,
    },
    formData() {
        const { value } = this.props;
        const checked = {};
        value?.forEach(ele => checked[ele] = true);
        return {
            checked,
        };
    },
    listeners: {
        value() {
            this.reRender();
        },
        option() {
            this.reRender();
        }
    },
    methods: {
        onClick(event) {
            if (this.props.disabled) {
                return;
            }
            const { target: { dataset: { value: v } } } = event;
            const { value } = this.props;
            if (value.includes(v)) {
                this.props.onSelect(value.filter(ele => ele !== v));
            }
            else {
                this.props.onSelect(value.concat(v));
            }
        }
    }
});
