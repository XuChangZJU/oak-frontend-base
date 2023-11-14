export default OakComponent({
    properties: {
        value: [] as Array<string | number>,
        option: [] as Array<{ label: string, value: string | number }>,
        onSelect: (v: Array<string | number>) => undefined as void,
        disabled: false,
    },
    formData() {
        const { value } = this.props;
        const checked = {} as Record<string, true>;
        value?.forEach(
            ele => checked[ele] = true
        );

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
        onClick(event: WechatMiniprogram.TouchEvent) {
            if (this.props.disabled) {
                return;
            }
            const { target: { dataset: { value: v } }} = event;
            const { value } = this.props;
            if (value!.includes(v)) {
                this.props.onSelect!(value!.filter(ele => ele !== v));
            }
            else {
                this.props.onSelect!(value!.concat(v));
            }
        }
    }
})